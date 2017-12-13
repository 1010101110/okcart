# under development (see Todo.md)

> A tiny webserver + shopping cart for developers looking to setup simple shop pages quickly on virtual private servers without any SAAS fees or bloated CMS. 

    Webserver = node + express
    Database = nedb
    Front end = vue
    Style = vuetify
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

# Install

## Dependencies 
* external mail account [list](https://nodemailer.com/smtp/well-known/)
* Stripe account, Api keys

## Server setup

create droplet (or any other vps)
* ubuntu (tested on 14 and 16)
* cheapest 512MB 20gb

login via putty / ssh
* should get an email with ip and root password
* login to root

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

add swap (or build will fail)
```bash
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
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

### config.json
* store name
* stripe private(secret) key
* stripe public key
* local
* currency
* Email details see nodemailer documentation
* admin password - change this to something else!! - use: https://bcrypt-generator.com/

### index.html
* meta tags to whatever you want
* icon
* title

## Build the application
Build compiles the Vue application, aka the web pages. This does not affect the server or asset files (picutes etc).

```bash
npm run build
```
if you make changes you can rebuild as much as you want. server will pick them up just need to refresh the browser.

## Setup https
you must have a domain name pointing to the server's ip for this to work. (set the server ip address up with your domain host) (this can take a few hours for the domain to point to your droplet)

certbot + letsencrypt free ssl certificate
```bash
wget https://dl.eff.org/certbot-auto  
chmod a+x certbot-auto
./certbot-auto certonly --standalone -d yourdomainname.com
```

now you need to tell your server where the certs are (example paths)
```bash
ln -s /etc/letsencrypt/live/yourdomainname.com/privkey.pem /root/okcart/cert/privkey.pem
ln -s /etc/letsencrypt/live/yourdomainname.com/fullchain.pem /root/okcart/cert/fullchain.pem
```
---

## Start the server

run the server once, just to see if it works
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
// src/main.js
Vue.use(Vuetify,{
    theme:{
        primary: '#616161',
        accent: '#E53935',
        secondary: '#9E9E9E',
        error: '#F44336'
    }
})

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

3. in main.js import the file and add the page to router
```js
// src/main.js

import News from './components/News.vue'

// add route to array

  routes: [
    {
        path: '/news',
        name: 'News',
        component: News
    },
  ]
```
4. optional add to menu
```js
// src/components/App.vue

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

in main.js routes, change the product list view to a different path 
add your splash page to as the / path
```js
  //src/main.js
  //import new component
  import Splash from './components/Splash.vue'

  //updated routes
  routes: [
    {
        path: '/store',
        name: 'ProductList',
        component: ProductList
    },
    {
        path: '/',
        name: 'Splash',
        component: Splash
    },
```

also you will need up update your menus with the correct path in App.vue
```js
    //src/components/App.vue
    menuitems:[
      {icon:"home",text:"Home",href:"/"},  
      {icon:"store",text:"Store",href:"/store"},
      {icon:"people",text:"About",href:"/about"},
      {icon:"contact_mail",text:"Contact",href:"/contact"},
    ],
```