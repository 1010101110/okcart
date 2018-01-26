# OKCART
A tiny webserver + shopping cart for developers looking to setup simple shop pages quickly on virtual private servers without any SAAS fees or bloated CMS. 

### Tech
    Webserver = node + express
    Database = nedb
    Front end = Vue + Vuex + Vuetify
    Build = webpack
    email = nodemailer
    payments = stripe

### Commands

``` bash
# build with webpack
npm run build

# run the server
pm2 start server.js
pm2 stop server.js
```

# Table of Contents

- [Install](#install)
  * [Dependencies](#dependencies)
  * [Server setup](#server-setup)
  * [Get okcart](#get-okcart)
  * [Config](#config)
  * [Build the application](#build-the-application)
  * [Setup https](#setup-https)
  * [Start the server](#start-the-server)
  * [Done installing!!](#done-installing--)
- [Customization](#customization)
  * [Theme](#theme)
  * [Adding custom pages](#adding-custom-pages)
  * [Splash page](#splash-page)


# Install
Realtime video of install - TODO

Dependencies 
* external mail account [list](https://nodemailer.com/smtp/well-known/)
* Stripe account, Api keys

## Server setup

create [VPS](https://www.digitalocean.com/products/droplets/)
* ubuntu (tested on 14 and 16)
* cheapest is fine (1gb ram)

login via putty / ssh
* should get an email with ip and root password
* login as root

update
```bash
apt-get update
apt-get upgrade
```

install nodejs
* https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
* tested with 8.x and 9.x

install build tools
```bash
apt-get install -y build-essential
```

---

## Get okcart
get okcart code
```bash
git clone https://github.com/1010101110/okcart.git
cd okcart
```

install okcart dependencies
```bash
npm install
```

install server runner/watcher
```bash
npm install -g pm2
```

## Config

### stripe account
* [Login](https://dashboard.stripe.com/) to your stripe account 
* go to the API menu
* Standard API keys: get the plublic and secret key

### mail account
* if using gmail you will need to enable access for [lesssecureapps](https://www.google.com/settings/security/lesssecureapps)

### config-s.json
this is your secret server only config file. put secure info here.
* stripe private(secret) key
* Email details see nodemailer documentation
* admin password - change this to something else!! - use: https://bcrypt-generator.com/

### config-c.json
this is your public config file.
* store name
* store url - this helps our requests find the server whether on client or server.
* stripe public key
* locale
* currency
* order shipping base charge - if you want every order to have a shipping charge no matter items set this to x amount, otherwise 0
* order shipping free limit - if you want orders to ship free after x amount use this, otherwise 0

### index.html
* icons

### src/components/About.vue
Add HTML to your about page. You can use [Vuetify](https://vuetifyjs.com/layout/grid) to make it pretty.

## Build the application
Webpack will build our application. This combines all our source files into minified / optimized files in the dist directory.

```bash
npm run build
``` 

After you rebuild the application you should restart the server

```bash
pm2 restart server
```

## Setup https
you must have a domain name pointing to the server's ip for this to work. (set the server ip address up with your domain host) (this can take a few hours for the domain to point to your droplet)

certbot + letsencrypt free ssl certificate
```bash
wget https://dl.eff.org/certbot-auto  
chmod a+x certbot-auto
./certbot-auto certonly --standalone -d yourdomainname.com
```

now you need to tell your server where the certs are (example paths)
```js
//server.js
var privateKey = fs.readFileSync('/etc/letsencrypt/live/mystore.com/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/mystore.com/fullchain.pem', 'utf8');
```
---

## Start the server

run the server once, just to see if it works, useful for debugging errors watching activity.
```bash
node server.js
```

if everything is good lets go ahead and configure the server to run forever.
```bash
pm2 start server.js
pm2 startup
pm2 save
```

test it will work by rebooting
```bash
shtudown -r now
```

---

## Done installing!!

* login to the backend and get your products setup
* https://yourdomain.com/admin


# Customization

## Theme
You can edit theme colors via vuetify.

color codes see https://material.io/guidelines/style/color.html

We mainly only use the primary color as the page is so simple, you can go through and edit each component to use other colors if you want.
```js
// src/app.js
Vue.use(Vuetify,{
    theme:{
        primary: '#616161',
        accent: '#E53935',
        secondary: '#9E9E9E',
        error: '#F44336'
    }
})
```

You can also change the browser theme (changes mobile browser color)
```html
    <!-- index.html  -->
    <meta name="theme-color" content="#616161">
```

## Adding custom pages
If you need more pages it is pretty simple to add. Here we will create an example News page.

1. create file.vue in src/components. can edit hellow world to any HTML or see vuetify docs for pretty components.
```html
<!-- src/components/News.Vue -->

<template>
    <div :key="news_view">
        <h1>hello world</h1>
    </div>
</template>

<script>
import store from './../store.js'

export default {
  name: 'News'
}
</script>

<style scoped>
</style>
```

2. change key and name in above to something unique. like News for a news page. It needs to be unique.

3. in router.js import the file and add the page to routes
```js
// src/router.js

// add route to array
  routes: [
    { path: '/news', component: () => import('./components/News.vue') },
  ]
```
4. optional add to menu
```js
// src/App.vue

//find menuitems array, add news entry
//can add an icon from material icons https://material.io/icons/
{icon:"storage",text:"News",href:"/news"},

```

5. rebuild the app
```bash
npm run build
```

## Splash page

follow the create new page guide above

in router.js routes, change the product list view to a different path  
add your splash page to as the / path
```js
  //src/router.js

  //updated routes
  routes: [
    { path: '/', component: () => import('./components/Splash.vue') },
    { path: '/store', component: () => import('./components/ProductList.vue') },
```

also you will need up update your menus with the correct path in App.vue
```js
    //src/App.vue
    menuitems:[
      {icon:"home",text:"Home",href:"/"},  
      {icon:"store",text:"Store",href:"/store"},
      {icon:"people",text:"About",href:"/about"},
      {icon:"contact_mail",text:"Contact",href:"/contact"},
    ],
```