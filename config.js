//here you can put secret stuff only the server knows
export const server = {    
    //stripe secret api key
    stripesk:"sk_test_AbLFTbzSIGCoNxJwixfU8OgG",

    //email used for contact form and order updates
    storeEmailService:"Gmail",
    storeEmailUser:"asdf@gmail.com",
    storeEmailPass:"asdf123",

    //password hash to /admin backend
    adminPassHash: "$2a$10$1hFcepwZlTmpmrM.QTvZtuczVJswgTUG8pn9nlidS39rEJ/aK7U2."
}

//only put safe things you don't mind being exposed to the client here
export const client = {
    //stripe public api key
    stripepk:"pk_test_GhV0QqLp9vthn8RTrVlfDiF9",

    //store name used in views, emails
    storeName:"MyStore",

    //currency configuration
    locale:"en-US",
    currency:"usd",

    //order base shipping charge (cents)
    //first order shipping is calculated by adding each items shipping cost.
    //you can set this to 0 to not have a per order charge
    ordershipbasecharge: 100,
    
    //if order is over this ammount(cents) it will ship free
    ordershipfreelimit: 5000
}