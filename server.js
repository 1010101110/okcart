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

// you should get your certs from lets encrypt / certbot once you have your domain setup
// for testing you can use the below to generate one for localhost
// openssl req -newkey rsa:2048 -nodes -keyout domain.key -x509 -days 365 -out domain.crt
var privateKey = fs.readFileSync('domain.key', 'utf8');
var certificate = fs.readFileSync('domain.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };

// Create an express server
var express = require('express')
var server = express();

//formidable for file upload
var formidable = require('formidable')
var compress_images = require('compress-images')

// Open NeDB databases
var Datastore = require('nedb');
var products = new Datastore({ filename: path.join(__dirname, '/db/products'), autoload: true });
var orders = new Datastore({ filename: path.join(__dirname, '/db/orders'), autoload: true });

//bodyparser for express post data
var bodyParser = require("body-parser");
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

//payment processing
var braintree = require("braintree")
var gateway = braintree.connect({
    environment:  braintree.Environment.Production,
    merchantId:   config_s.merchantId,
    publicKey:    config_s.publicKey,
    privateKey:   config_s.privateKey
});

// =========Server Routes=========
// Redirect http to https
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

// Serve a blank robots.txt so google doesn't complain
server.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow: ");
});

//file upload
server.post('/api/upload',function(request,response){
    var paths = []
    var form = new formidable.IncomingForm()
    form.multiples = true

    form.on('file',function(field,file){
        paths.push('/assets/' + file.name)
        console.log('file upload: ' + file.name)

        var temppath = path.join(__dirname, '/optimized',file.name)
        var newpath = path.join(__dirname, '/assets',file.name)

        fs.renameSync(file.path,newpath)

        compress_images(newpath, __dirname + '/optimized/', {compress_force: true, statistic: false, autoupdate: true}, false,
        {jpg: {engine: 'mozjpeg', command: ['-quality', '60']}},
        {png: {engine: 'pngquant', command: ['--quality=20-50']}},
        {svg: {engine: 'svgo', command: '--multipass'}},
        {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, function(error, completed, statistic){
            if(fs.existsSync(temppath)){
                console.log('image optimized: ' + newpath)
                fs.renameSync(temppath,newpath)
            }
        });
    })
    form.on('error',function(err){
        console.log('error in form: ' + err)
    })
    form.on('end',function(){
        response.json(paths)
    })
    form.parse(request)
})

//contact email
server.post('/api/contact',function(request,response){
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
            images:["/assets/default.jpg"],
            selectable_fields:[],
            selectable_options:[]
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
            sort:request.body.product.sort,
            selectable_fields:request.body.product.selectable_fields,
            selectable_options:request.body.product.selectable_options
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

    gateway.transaction.sale({
        amount: request.body.total/100,
        paymentMethodNonce: request.body.nonce,
        options: {
            submitForSettlement: true
          }
    }, function (err, result){
        if(err){
            console.log(err)
            res.end('error')
            return
        }
        if(result.success){

            //create order now that it has been charged
            let order = {}
            order.payment = result;
            order.cart = request.body.cart;
            order.email = request.body.email;
            order.address = request.body.address;
            order.status = "created";
            order.subtotal = request.body.subtotal;
            order.shiptotal = request.body.shiptotal;
            order.total = request.body.total;
            order.comment = request.body.comment;

            orders.insert(order,function(err,newOrder){
                if(err){
                    //pass error to client
                    console.log({error:err.message});
                    response.json({error:err.message});
                }else{
                    //update product stock
                    newOrder.cart.forEach(function(cartitem) {
                        products.findOne({_id:cartitem._id},function(err,product){
                            if(err){
                                console.log('error updating products after checkout')
                                console.log(err);
                            }else{
                                //update the product stock
                                products.update({_id:cartitem._id}, {$set: {stock:product.stock - cartitem.quantity}},{},function(){})

                                //calculate the selectable options stock
                                if(cartitem.selectable_fields){
                                    cartitem.selectable_fields.forEach(function(sfield){
                                        //if an option was selected
                                        if(sfield.selected){
                                            //find the matching option in the product
                                            product.selectable_options.forEach(function(soption){
                                                if(sfield.selected.name === soption.name){
                                                    //remove the # qty selected
                                                    soption.stock -= cartitem.quantity
                                                }
                                            })
                                        }
                                    }) 
                                    //update the selectable options
                                    products.update({_id:cartitem._id}, {$set: {selectable_options:product.selectable_options}},{},function(){})
                                }


                            }
                        })
                    }, this);

                    //pass completed order back to client
                    response.json({order:newOrder})

                    //html email
                    let emailhtml = orderemail

                    //order
                    emailhtml = emailhtml.replace('%%storename%%',config_c.storeName)
                    emailhtml = emailhtml.replace('%%date%%', new Date().toLocaleString())
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
                    semailoptions.to = config_s.storeEmailUser
                    semailoptions.replyTo = order.email
                    semailoptions.subject = 'New ' + config_c.storeName + ' order'
                    transporter.sendMail(semailoptions,(err,info)=>{
                        if(err) console.log(err)
                    })

                }
            })

        }else{
            console.log(result)
            console.log(err)
            res.end('error')
        }
    })

})

//update existing order in database
server.post('/api/updateOrder',function(request,response){
    if(checkpass(request.body.pass)){
        //check for status change
        orders.findOne({_id:request.body.order._id},(err,doc)=>{
            //formats prices in emails
            let currency = Intl.NumberFormat(config_c.locale, {
                style: "currency",
                currency: config_c.currency,
                minimumFractionDigits: 2,
            })

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
                //refund braintree
                gateway.transaction.refund(request.body.order.payment.transaction.id,(err,result)=>{
                    if(err || !result.success){
                        console.log(err)
                        console.log(result.transaction.status)
                    }else{
                        //send email
                        let emailhtml = refundemail
                        emailhtml = emailhtml.replace('%%storename%%',config_c.storeName)
                        emailhtml = emailhtml.replace('%%date%%', new Date().toDateString())
                        emailhtml = emailhtml.replace('%%amount%%',currency.format(result.transaction.amount))
                        emailhtml = emailhtml.replace('%%orderlink%%','https://' + request.get('host') + '/order/' + request.body.order._id)

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
                    }
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
const { createBundleRenderer } = require('vue-server-renderer')

const template = fs.readFileSync( path.join(__dirname,'index.html') , 'utf-8')
const bundle = require('./dist/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')

const renderer = createBundleRenderer(bundle, {
  template,
  clientManifest
})

// inside a server handler...
server.get('*', (req, res) => {
    const context = {
      title: config_c.storeName  ,
      url: req.url
    }
  // No need to pass an app here because it is auto-created by
  // executing the bundle. Now our server is decoupled from our Vue app!
  renderer.renderToString(context, (err, html) => {
    if (err) {
        console.log(req.url)
        console.log(err)
        if (err.code === 404) {
          res.status(404).end('Page not found')
        } else {
          res.status(500).end('Internal Server Error')
        }
    } else {
      res.end(html)
    }
  })
})

//=========HTTP / HTTPS server=========
var http = require('http');
var https = require('https');

https.createServer(credentials, server).listen(443, function (err) {
   if (err) throw err;
   console.log('started https server')
});
http.createServer(server).listen(80, function (err) {
    if (err) throw err;
    console.log('started http server')
});