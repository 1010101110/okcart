# under development (see Todo.md)

> A tiny webserver + shopping cart for developers looking to setup simple shop pages quickly on virtual private servers without any SAAS fees or bloated CMS. 

    Webserver = node + express
    Database = nedb
    Front end = vue + vuex + vue-router
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

## Server setup

create droplet (or any other vps)
* ubuntu (tested on 14 and 16)
* cheapest 512MB 20gb

login via putty / ssh
* should get an email with ip and root password
* set a new password

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
* local
* currency
* Email details see nodemailer documentation
* admin password - change this to something else!! - use: https://bcrypt-generator.com/

### index.html
* meta tags to whatever you want
* icon
* title

### src/store.js
* store_name 

### src/stylus/main.styl
* can change any theme colors here

### src/components/cart.vue
* stripe public key (can search "var stripe")

## Build the application
if you make changes you can rebuild as much as you want. server will pick them up just need to refresh the page.
```bash
npm run build
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
npm install pm2 -g
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
