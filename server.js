'use strict'

//config
var config_s = require('./config-s')
var config_c = require('./config-c')

// =========Node packages=========

//file path
var fs = require('fs');
var path = require('path');

//password hash
var bcrypt = require('bcrypt');

//email
const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: config_s.storeEmailService,
    auth: {
        user: config_s.storeEmailUser,
        pass: config_s.storeEmailPass
    }
});
var orderemail = fs.readFileSync( path.join(__dirname, '/email/orderemail.html') ,{encoding:"utf8"})
var orderemailitem = fs.readFileSync( path.join(__dirname, '/email/orderemailitem.html'),{encoding:"utf8"})
var orderemailimg = fs.readFileSync( path.join(__dirname, '/email/orderemailimage.gif'))
var shippedemail = fs.readFileSync( path.join(__dirname, '/email/shippedemail.html') ,{encoding:"utf8"})
var shippedemailimg = fs.readFileSync( path.join(__dirname, '/email/shipping.gif'))
var refundemail = fs.readFileSync( path.join(__dirname, '/email/refundemail.html') ,{encoding:"utf8"})
var refundemailimg = fs.readFileSync( path.join(__dirname, '/email/refund.gif'))

//http server
var http = require('http');

//https server
var https = require('https');
//you should get your certs from lets encrypt / certbot once you have your domain setup
var privateKey = fs.readFileSync(path.join(__dirname, '/cert/privkey.pem'), 'utf8');
var certificate = fs.readFileSync(path.join(__dirname, '/cert/fullchain.pem'), 'utf8');
var credentials = { key: privateKey, cert: certificate };

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
var stripe = require('stripe')(config_s.stripesk);

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

//file upload
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

//contact email 
server.post('/api/contact',function(request,response){        
    if(checkpass(request.body.pass)){
        let emailOptions ={
            replyTo: request.body.email.email,
            to: config_s.storeEmailUser,
            subject: config_c.storeName + ' Contact',
            text:request.body.email.body
        }

        transporter.sendMail(emailOptions,(err,info)=>{
            if(err) console.log(err)
            response.end()
        })
    }else{
        console.log('failed auth')
        response.end()
    }
})

/////////////////////////PRODUCTS///////////////////////////////

//return json products find from database
server.get('/api/products', function (request, response) {
    products.find({}, function (err, docs) {
        if (err) console.log(err);
        docs.sort((a,b)=>{return a.sort - b.sort})
        response.json(docs);
    })     
});

//add product to database
server.post('/api/addProduct',function (request,response) {
    if(checkpass(request.body.pass)){
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
    }else{
        response.end()
    }
})

//update existing product in database
server.post('/api/updateProduct',function(request,response){    
    if(checkpass(request.body.pass)){
        products.update({_id:request.body.product._id},
        { $set: {
            name:request.body.product.name,
            stock:request.body.product.stock,
            price:request.body.product.price,
            shipping:request.body.product.shipping,
            description:request.body.product.description,
            images:request.body.product.images,
            visible:request.body.product.visible,
            sort:request.body.product.sort
        }},{},function(err,num){
            if(err) console.log(err)
            response.end()
        })
    }else{
        response.end()
    }
})

//delete product from database
server.post('/api/deleteProduct/:id',function(request,response){
    if(checkpass(request.body.pass)){
        if(request.params.id){
            products.remove({_id: request.params.id},function(err,num){
                if(num>0){
                    response.end('good')
                }else{
                    response.end('fail')
                }
            })
        }
    }else{
        response.end()
    }
})


/////////////////////////ORDERS///////////////////////////////

//return json order find in database
server.get('/api/order/:id', function (request, response) {
    orders.findOne({_id:request.params.id}, function (err, doc) {
        if (err) console.log(err);
        response.json(doc);
    })  
});

//return json orders find from database
server.post('/api/orders', function (request, response) {
    if(checkpass(request.body.pass)){
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
        currency: config_c.currency,
        description: request.body.email + " order from " + config_c.storeName,
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
                    response.json({order:newOrder})

                    //html email
                    let emailhtml = orderemail

                    //formats prices in emails
                    let currency = Intl.NumberFormat('en-US', {
                        style: config_c.locale,
                        currency: config_c.currency,
                        minimumFractionDigits: 2,
                    })

                    //order
                    emailhtml = emailhtml.replace('%%storename%%',config_c.storeName)
                    emailhtml = emailhtml.replace('%%date%%', new Date(newOrder.charge.created*1000).toLocaleString())
                    emailhtml = emailhtml.replace('%%orderlink%%','https://' + request.get('host') + '/order/' + newOrder._id)

                    //send email confirmation to user
                    let emailOptions ={
                        from: config_s.storeEmailUser,
                        to: order.email,
                        subject: config_c.storeName + ' order confirmation',
                        html: emailhtml,
                        attachments: [
                            {
                                filename: 'okok.gif',
                                path: __dirname + '/email/orderemailimage.gif',
                                cid: 'orderimage@okok.com'
                            }
                        ]
                    }

                    transporter.sendMail(emailOptions,(err,info)=>{
                        if(err) console.log(err)
                    })

                    //send mail to store owner that new order created for them to process
                    let semailoptions = emailOptions
                    semailoptions.from = config_s.storeEmailUser
                    semailoptions.t0 = config_s.storeEmailUser
                    semailoptions.subject = 'New ' + config_c.storeName + ' order'
                    transporter.sendMail(semailoptions,(err,info)=>{
                        if(err) console.log(err)
                    })

                }
            })            
        }
    });
})

//update existing order in database
server.post('/api/updateOrder',function(request,response){
    if(checkpass(request.body.pass)){
        //check for status change    
        orders.findOne({_id:request.body.order._id},(err,doc)=>{
            //order is shipped!
            if(doc.status === "created" && request.body.order.status === "shipped"){
                //send email
                let emailhtml = shippedemail
                emailhtml = emailhtml.replace('%%storename%%',config_c.storeName)
                emailhtml = emailhtml.replace('%%storename%%',config_c.storeName)
                emailhtml = emailhtml.replace('%%date%%', new Date().toDateString())
                emailhtml = emailhtml.replace('%%shippingco%%',request.body.order.trackingco ? request.body.order.trackingco : "")
                emailhtml = emailhtml.replace('%%tracking%%',request.body.order.trackingnum ? request.body.order.trackingnum : "")
                
                let emailOptions ={
                    from: config_s.storeEmailUser,
                    to: request.body.order.email,
                    subject: config_c.storeName + ' order shipped',
                    html: emailhtml,
                    attachments: [
                        {
                            filename: 'shipimage.gif',
                            path: __dirname + '/email/shipping.gif',
                            cid: 'shipimage@okok.com'
                        }
                    ]
                }

                transporter.sendMail(emailOptions,(err,info)=>{
                    if(err) console.log(err)
                })
                
            }

            //order is refunded!
            if((doc.status === "created" || doc.status === "shipped") && request.body.order.status === "refunded"){
                //refund stripe
                stripe.refunds.create({
                    charge: request.body.order.charge.id
                },(err,refund)=>{
                    if(err) console.log(err)
                    //send email
                    let emailhtml = refundemail
                    emailhtml = emailhtml.replace('%%storename%%',config_c.storeName)
                    emailhtml = emailhtml.replace('%%date%%', new Date().toDateString())
                    emailhtml = emailhtml.replace('%%amount%%',refund.amount/100)
                    emailhtml = emailhtml.replace('%%ordernum%%',request.body.order._id)

                    let emailOptions ={
                        from: config_s.storeEmailUser,
                        to: request.body.order.email,
                        subject: config_c.storeName + ' order refund',
                        html: emailhtml,
                        attachments: [
                            {
                                filename: 'refund.gif',
                                path: __dirname + '/email/refund.gif',
                                cid: 'refund@okok.com'
                            }
                        ]
                    }
        
                    transporter.sendMail(emailOptions,(err,info)=>{
                        if(err) console.log(err)
                    })                
                })
            }
        })

        //update order in db
        orders.update({_id:request.body.order._id},
        { $set: {
            status:request.body.order.status,
            trackingnum:request.body.order.trackingnum,
            trackingco:request.body.order.trackingco
        }},{},function(err,num){
            if(err) console.log(err)
            response.end()
        })
    }else{
        response.end()
    }
})

//Authentication for backend
//a timeout to prevent a high frequency of requests (like brute force)
var authtimeout = false;
server.get('/api/auth', function (request, response) {

    if(!authtimeout){
        authtimeout = true;
        setTimeout(function() {
            authtimeout = false;
        }, 500);

        //use bcrypt.hash to generate your own password and store it in config
        //if you ever forget your password you will have to redo this step
        //default password , hash : lol , $2a$10$1hFcepwZlTmpmrM.QTvZtuczVJswgTUG8pn9nlidS39rEJ/aK7U2.
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
    //default password: "lol"
    return bcrypt.compareSync(pass,config_s.adminPassHash);
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