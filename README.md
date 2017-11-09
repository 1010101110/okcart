# under development (see Todo.md)

> A tiny webserver + shopping cart for developers looking to setup simple shop pages quickly on virtual private servers without any SAAS fees or bloated CMS. 

    Webserver = node + express
    Database = nedb
    Front end = vue + vuex + vue-router
    Style = vuetify
    email = nodemailer
    payments = stripe

## Commands

``` bash
# install dependencies
npm install

# build with webpack
npm run build

# run the server
node server.js

# run the server forever
npm install pm2 -g
pm2 start server.js
```
