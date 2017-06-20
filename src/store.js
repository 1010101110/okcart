//init vuex
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);
//router object for nav actions
import {router} from './main.js'

//global store object
const store = new Vuex.Store({
    state: {        
        //data
        products:[],        
        cart:[],
        order:{},
        //helpers
        store_name:"MyStore",
        currency: Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }),
        loading:false,
        authenticated:false,
        //admin data        
        orders:[]
    },
    getters: {
        currency:(state,getters)=>{
            return state.currency;
        },
        products:(state,getters)=>{
            //list of products
            return state.products;
        },
        product:(state,getters)=>{
            //one product
            return state.products.find(product=>product.name === state.route.params.name);
        },                
        cart:(state,getters)=>{
            //list of cart items
            return state.cart;
        },
        cartQuantity:(state,getters)=>{
            //number of items in cart
            var quantity = 0;
            for (var i = 0; i < state.cart.length; i++) {
                quantity += state.cart[i].quantity;
            }
            return quantity;
        },
        cartIsEmpty:(state,getters)=>{
            //bool cart is empty
            return state.cart.length == 0;
        },
        cartSubTotal:(state,getters)=>{
            //price of items in cart
            var subtotal = 0;
            for (var i = 0; i < state.cart.length; i++) {
                //have to do multiply/divide 100 because javascript one-cent errors with decimals
                subtotal += (state.cart[i].quantity * (state.cart[i].price));
            }
            return state.currency.format(subtotal/100);
        },
        cartShipping:(state,getters)=>{
            //price of items in cart
            var shipTotal = 0;
            for (var i = 0; i < state.cart.length; i++) {
                //have to do multiply/divide 100 because javascript one-cent errors with decimals
                shipTotal += (state.cart[i].quantity * (state.cart[i].shipping));
            }
            return state.currency.format(shipTotal/100);
        },
        cartTotal:(state,getters)=>{
            var Total = 0;
            for (var i = 0; i < state.cart.length; i++) {
                //have to do multiply/divide 100 because javascript one-cent errors with decimals
                Total += (state.cart[i].quantity * (state.cart[i].shipping+state.cart[i].price));
            }
            return Total;
        },
        orderTotal:(state,getters)=>{
            return state.currency.format(state.order.amount/100);
        },
        loading:(state,getters)=>{
            return state.loading;
        },
        order:(state,getters)=>{
            return state.order;
        },
        orders:(state,getters)=>{
            return state.orders;
        },
        authenticated:(state,getters)=>{
            return state.authenticated;
        }
    },
    mutations: {
        setproducts(state,products){
            state.products = products;
        },
        additemtocart(state,product){
            if(product.stock>0){
                //decrement from stock
                product.stock -= 1;

                //check if product is already in cart
                var found = false;
                for (var i = 0; i < state.cart.length; i++) {
                    var cartitem = state.cart[i];

                    //add existing item to cart
                    if (cartitem._id === product._id) {
                        found = true;                                
                        cartitem.quantity += 1;
                        Vue.set(state.cart, i, cartitem);
                    }
                }

                //add new item to cart
                if (!found) {
                    product.quantity = 1;
                    state.cart.push(product);
                }

            }else{
                //item is out of stock
                return;
            }
        },
        removeitemfromcart(state,product){
            for (var i = 0; i < state.cart.length; i++) {
                var cartitem = state.cart[i];

                //remove item from cart
                if (cartitem._id === product._id) {                              
                    cartitem.quantity -= 1;
                    cartitem.stock += 1;
                    if(cartitem.quantity > 0){
                        //decrement quantity
                        Vue.set(state.cart, i, cartitem);
                    } else {
                        //remove item from cart
                        state.cart.splice(i,1);
                    }
                    
                }
            }
        },
        deleteitemfromcart(state,product){
            for (var i = 0; i < state.cart.length; i++) {
                var cartitem = state.cart[i];
                if (cartitem._id === product._id) {
                    cartitem.stock += cartitem.quantity;
                    cartitem.quantity = 0;
                    state.cart.splice(i,1);
                }
            }
        },
        setcart(state,val){
            state.cart = val;
        },
        setloading(state,val){
            state.loading = val;
        },
        setorder(state,val){
            state.order = val;
            console.log(state.order);
        },
        setorders(state,val){
            state.orders = val;
        },
        setauthenticated(state,val){
            state.authenticated = val;
        }
    },
    actions:{
        fetchProducts({commit}){
            Vue.http.get('/api/products').then(function(response){
                commit('setproducts',response.body);
            },function(response){
                console.error('fetchProducts: ' + response.statusText);
            })
        },
        fetchOrder({commit,state}, payload){
            Vue.http.get('/api/order/'+payload).then(function(response){
                commit('setorder',response.body);
            },function(response){
                console.error('fetchOrder: ' + response.statusText);
            })
        },
        fetchOrders({commit,state}, payload){
            Vue.http.get('/api/orders/'+payload.pass).then(function(response){
                if(response.body){
                    commit('setorders',response.body);
                }else{                    
                    console.log('no orders')
                    console.log(response)
                }
            },function(response){
                console.error('fetchOrders: ' + response.statusText);
            })
        },
        checkout({commit,state,getters}, payload){
            //show loading
            commit('setloading',true);

            //cart data
            const cartout = state.cart;

            //checkout data            
            const postdata = {
                cart:  state.cart,
                subtotal: getters.cartSubTotal,
                shiptotal: getters.cartShipping,
                total: getters.cartTotal,
                token: payload.token,
                email: payload.email,
                address: payload.address
            }

            //create order in database
            Vue.http.post('/api/checkout',postdata).then(function(response){
                if(response.data.order){
                    //reset cart
                    commit('setcart',[]);
                    //reset products
                    commit('setproducts',[]);
                    //navigate to order completed page
                    router.push('/order/'+response.data.order._id);
                    //refresh products
                    setTimeout(function(){
                        store.dispatch('fetchProducts');
                    },50)
                }else{
                    //error of some kind
                    console.log(response);
                }
            },function(response){
                //error of some kind
                console.log(response)
            }).then(function(){               
                commit('setloading',false);
            });            
        },
        auth({commit,state}, payload){
            //show loading
            commit('setloading',true);
            
            //send pass to server to try and authenticate
            Vue.http.get('/api/auth?pass='+payload.pass).then(function(response){
                if(response.ok && response.body === "good"){
                    commit('setauthenticated',true);
                    //refresh data
                    store.dispatch('fetchProducts');
                    store.dispatch('fetchOrders',{pass:payload.pass});
                }
            }).then(function(){
                commit('setloading',false);
            });
        }
    }
});

export default store;