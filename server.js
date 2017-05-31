'use strict'

//node utilities
var fs = require('fs');
var path = require('path');

//email
const sendmail = require('sendmail')();

//http server
var http = require('http');

//https server
var https = require('https');
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

//https redirect
server.all('*', function (req, res, next){
   return req.secure ? next() : res.redirect('https://' + req.hostname + req.url);
});

// Serve files from the assets + dist directory
server.use('/assets', express.static(
    path.resolve(__dirname, 'assets')
));
server.use('/dist', express.static(
    path.resolve(__dirname, 'dist')
));

//=========API=========
//settings
server.get('/settings', function (req, res) {
    res.end(JSON.stringify({
        title: "mystore"
    }));
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

//
server.post('/checkout', function (request, response) {    
    // Charge the user's card:
    var charge = stripe.charges.create({
        amount: request.body.subtotal,
        currency: "usd",
        description: "Order #test????",
        source: request.body.token.id,
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
                                console.log('new stock for '+doc._id + ': ');
                                console.log(doc.stock-element.quantity)
                                products.update({_id:element._id}, {$set: {stock:doc.stock-element.quantity}},{},function(){})
                            }
                        })                        
                    }, this);

                    //pass completed order back to client
                    response.json({order:newOrder});

                    //email confirmation
                    sendmail({
                        from: 'no-reply@yourdomain.com',
                        to: request.body.email,
                        subject: 'test sendmail',
                        html: 'Mail of test sendmail <br> <h1>HI MOM</h1>',
                    }, function(err, reply) {
                        console.log(err && err.stack);
                    });
                }
            })            
        }
    });

})

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
//need to get ssl cert from lets encrypt
https.createServer(credentials, server).listen(443, function (err) {
   if (err) throw err;
   console.log('started https server')
});