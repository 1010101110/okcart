'use strict'

var config = require("./config.json")

// =========Node packages=========

//file path
var fs = require('fs');
var path = require('path');

//password hash
var bcrypt = require('bcrypt');

//email
const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: config.storeEmailService,
    auth: {
        user: config.storeEmailUser,
        pass: config.storeEmailPass
    }
});

//http server
var http = require('http');

//https server
var https = require('https');
//you should get your certs from lets encrypt / certbot once you have your domain setup
var privateKey = fs.readFileSync(path.join(__dirname, '/cert/server.key'), 'utf8');
var certificate = fs.readFileSync(path.join(__dirname, '/cert/server.crt'), 'utf8');
var credentials = { key: privateKey, cert: certificate, passphrase:'monki' };

// Create an express server
var express = require('express')
var server = express();

//formidable for file upload
var formidable = require('formidable')

// Open NeDB databases
var Datastore = require('nedb');
var products = new Datastore({ filename: path.join(__dirname, '/db/products'), autoload: true });
var orders = new Datastore({ filename: path.join(__dirname, '/db/orders'), autoload: true });

//bodyparser for express post data
var bodyParser = require("body-parser");
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

//stripe for payment processing
var stripe = require('stripe')(config.stripekey);

// =========Server Routes=========

//https redirect
server.all('*', function (req, res, next){
   return req.secure ? next() : res.redirect('https://' + req.hostname + req.url);
});

// Serve static files from the assets + dist directory
server.use('/assets', express.static(
    path.resolve(__dirname, 'assets')
));
server.use('/dist', express.static(
    path.resolve(__dirname, 'dist')
));

//settings
// server.get('/settings', function (req, res) {
//     res.end(require("config.json"));
// });
server.post('/api/upload',function(request,response){
    var paths = []
    var form = new formidable.IncomingForm()
    form.multiples = true
    form.on('file',function(field,file){
        paths.push('/assets/'+file.name)
        fs.rename(file.path, path.join(__dirname, '/assets',file.name),err=>{
            if(err) console.log(err)
        })
    })
    form.on('error',function(err){
        console.log(err)
    })
    form.on('end',function(){
        response.json(paths)
    })
    form.parse(request)
})

//return json products find from database
server.get('/api/products', function (request, response) {
    products.find({}, function (err, docs) {
        if (err) console.log(err);
        docs.sort((a,b)=>{return a.sort - b.sort})
        response.json(docs);
    })     
});

//add product to database
server.get('/api/addProduct',function (request,response) {
    var doc = {
        name:"",
        stock:0,
        price:0,
        shipping:0,
        images:["/assets/default.jpg"]
    }
    products.insert(doc,function(err,inserted){
        if(err) console.log(err)
        response.json(doc)
    })
})

//update existing product in database
server.post('/api/updateProduct',function(request,response){    
    products.update({_id:request.body._id},
    { $set: {
        name:request.body.name,
        stock:request.body.stock,
        price:request.body.price,
        shipping:request.body.shipping,
        description:request.body.description,
        images:request.body.images,
        visible:request.body.visible,
        sort:request.body.sort
    }},{},function(err,num){
        if(err) console.log(err)
        response.end()
    })
})

//delete product from database
server.get('/api/deleteProduct/:id',function(request,response){
    if(request.params.id){
        products.remove({_id: request.params.id},function(err,num){
            if(num>0){
                response.end('good')
            }else{
                response.end('fail')
            }
        })
    }
})

//return json order find in database
server.get('/api/order/:id', function (request, response) {
    orders.findOne({_id:request.params.id}, function (err, doc) {
        if (err) console.log(err);
        response.json(doc);
    })  
});

//return json orders find from database
server.get('/api/orders/:pass', function (request, response) {
    if(checkpass(request.params.pass)){
        orders.find({},function (err,docs){
            if (err) console.log(err);
            response.json(docs);
        })        
    }else{
        console.log('failed orders authorization')
        response.end();
    }
})

//create order
server.post('/api/checkout', function (request, response) {    
    // Create+Send Stripe Charge (see stripe api)
    var charge = stripe.charges.create({
        amount: request.body.total,
        currency: "usd",
        description: request.body.email + " order from " + "mystore",
        source: request.body.token.id
    }, function(err, charge) {
        if(err){
            //handle different types of errors
            switch(err.type){
                default:
                    //pass error to client
                    console.log({error:err.message});
                    response.json({error:err.message});                    
                break;
            }       
        }else{
            //create order now that it has been charged
            let order = {}
            order.charge = charge;
            order.cart = request.body.cart;
            order.email = request.body.email;
            order.address = request.body.address;
            order.status = "created";
            order.subtotal = request.body.subtotal;
            order.shiptotal = request.body.shiptotal;
            order.total = request.body.total;

            orders.insert(order,function(err,newOrder){
                if(err){
                    //pass error to client
                    console.log({error:err.message});
                    response.json({error:err.message});
                }else{
                    //update product stock
                    newOrder.cart.forEach(function(element) {
                        products.findOne({_id:element._id},function(err,doc){
                            if(err){
                                console.log('error updating products after checkout')
                                console.log(err);
                            }else{                            
                                products.update({_id:element._id}, {$set: {stock:doc.stock-element.quantity}},{},function(){})
                            }
                        })                        
                    }, this);

                    //pass completed order back to client
                    response.json({order:newOrder});                    
                    
                    //plaintext email (incase user has html mail disabled?)
                    var emailtext = 'Thanks for your order! \n \n '
                         + newOrder.address.name +'\n'
                         + newOrder.address.street +'\n'
                         + newOrder.address.apt +'\n'
                         + newOrder.address.city +'\n'
                         + newOrder.address.state +'\n'
                         + newOrder.address.zip +'\n \n';
                    newOrder.cart.forEach(function(element) {
                        emailtext += (element.quantity + 'x ' + element.name + ' '  + (element.price * 100) + '\n');
                    }, this);
                    emailtext += '\n \n';
                    emailtext += 'Total: ' + (newOrder.charge.amount * 100);

                    //html email
                    var emailhtml = '';

                    //send email confirmation
                    let emailOptions ={
                        from: config.storeEmailUser,
                        to: order.email,
                        subject: config.storeName + ' order confirmation',
                        text:emailtext,
                        html:emailhtml
                    }

                    transporter.sendMail(emailOptions,(err,info)=>{
                        if(err) console.log(err)
                    })

                }
            })            
        }
    });
})

//contact email 
server.post('/api/contact',function(request,response){        
    let emailOptions ={
        replyTo: request.body.email,
        to: config.storeEmailUser,
        subject: config.storeName + ' Contact',
        text:request.body.body
    }

    transporter.sendMail(emailOptions,(err,info)=>{
        if(err) console.log(err)
        response.end()
    })
})

//update existing product in database
server.post('/api/updateOrder',function(request,response){
    //update db
    orders.update({_id:request.body._id},
    { $set: {
        status:request.body.status,
        tracking:request.body.tracking
    }},{},function(err,num){
        if(err) console.log(err)
        response.end()
    })
})

//Authentication for backend
//a timeout to prevent a high frequency of requests (like brute force)
var authtimeout = false;
server.get('/api/auth', function (request, response) {

    if(!authtimeout){
        authtimeout = true;
        setTimeout(function() {
            authtimeout = false;
        }, 1000);

        if(checkpass(request.query.pass)){
            response.end("good")
        }else{
            console.log('failed authorization')
            response.end("fail")
        }
    }
    else{
        response.end("fail")
    }
});

function checkpass(pass){
    //use bcrypt.hash to generate your own password and store it in config
    //if you ever forget your password you will have to redo this step
    //default password , hash: lol , $2a$10$1hFcepwZlTmpmrM.QTvZtuczVJswgTUG8pn9nlidS39rEJ/aK7U2.
    return bcrypt.compareSync(pass,config.adminPassHash);
}

// =========Vue App Route=========
//this lets vue router handle all other routes on the client (only above routes go to the server)
server.get('*', function (request, response) {
    response.sendFile(path.join(__dirname, '/index.html'));
});

//=========HTTP / HTTPS server=========
http.createServer(server).listen(80, function (err) {
    if (err) throw err;
    console.log('started http server')
});
https.createServer(credentials, server).listen(443, function (err) {
   if (err) throw err;
   console.log('started https server')
});