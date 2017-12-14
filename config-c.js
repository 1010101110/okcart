//only put safe things you don't mind being exposed to the client here

export default client = {
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