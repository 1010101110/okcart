'use strict'

// =========Node packages=========

//file path
var fs = require('fs');
var path = require('path');

//password hash
var bcrypt = require('bcrypt');

//email
const sendmail = require('sendmail')();

//http server
var http = require('http');

//https server
var https = require('https');
//you should get your certs from lets encrypt once you have your domain setup
var privateKey = fs.readFileSync(path.join(__dirname, '/cert/server.key'), 'utf8');
var certificate = fs.readFileSync(path.join(__dirname, '/cert/server.crt'), 'utf8');
var credentials = { key: privateKey, cert: certificate, passphrase:'monki' };

// Create an express server
var express = require('express')
var server = express();

// Open NeDB databases
var Datastore = require('nedb');
var products = new Datastore({ filename: path.join(__dirname, '/db/products'), autoload: true });
var orders = new Datastore({ filename: path.join(__dirname, '/db/orders'), autoload: true });

//bodyparser for express post data
var bodyParser = require("body-parser");
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

//stripe for payment processing
var stripe = require('stripe')("sk_test_AbLFTbzSIGCoNxJwixfU8OgG");

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
server.get('/settings', function (req, res) {
    res.end(require("config.json"));
});

//return json products find from database
server.get('/products', function (request, response) {
    // Set an existing field's value
    products.find({}, function (err, docs) {
        if (err) console.log(err);
        response.json(docs);
    })     
});

//return json order find in database
server.get('/orders/:id', function (request, response) {
    orders.findOne({_id:request.params.id}, function (err, doc) {
        if (err) console.log(err);
        response.json(doc);
    })  
});

//return json orders find from database
server.get('/orders', function (request, response) {

})

//create order
server.post('/checkout', function (request, response) {    
    // Create+Send Stripe Charge (see stripe api)
    var charge = stripe.charges.create({
        amount: request.body.total,
        currency: "usd",
        description: request.body.email + " order from " + "mystore",
        source: request.body.token.id
    }, function(err, charge) {
        if(err){
            switch(err.type){
                default:
                    //pass error to client
                    console.log({error:err.message});
                    response.json({error:err.message});                    
                break;
            }       
        }else{
            //add our cart information to the charge 
            //(stripe complains if we do this first as it is not part of their api)
            charge.cart = request.body.cart;
            charge.address = request.body.address;

            orders.insert(charge,function(err,newOrder){
                if(err){
                    //pass error to client
                    console.log({error:err.message});
                    response.json({error:err.message});
                }else{
                    //update product stock
                    request.body.cart.forEach(function(element) {
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
                    emailtext += 'Total: ' + (newOrder.amount * 100);

                    //html email
                    var emailhtml = '';

                    //send email confirmation
                    sendmail({
                        from: 'no-reply@mystore.com',
                        to: newOrder.email,
                        subject: 'Your ' + 'mystore' + 'order',
                        text:emailtext,
                        html:emailhtml
                    }, function(err, reply) {
                        console.log(err && err.stack);
                    });
                }
            })            
        }
    });
})

//Authentication for backend
server.get('/auth', function (request, response) {    
    //use bcrypt.hash to generate your own password and store the hash here
    //if you ever forget your password you will have to redo this step
    //we store this here as a local variable and never reference it again to keep it secure
    var mypass = "$2a$10$1hFcepwZlTmpmrM.QTvZtuczVJswgTUG8pn9nlidS39rEJ/aK7U2.";
    bcrypt.compare(request.query.pass,mypass,function(err,res){
        if(res){
            response.end("good")
        }else{
            response.end("fail")
        }
    })    
});

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