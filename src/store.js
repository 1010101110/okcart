// init vuex
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);

//config
import client from './../config-c'

// for ajax calls
import ax from 'axios'
var axios = ax.create({
    baseURL: client.storeURL,
    timeout: 60000
  });

//global store object
export function createStore () {
    return new Vuex.Store({
        state: {
            //data
            products:[],
            cart:[],
            order:{},
            //helpers
            store_name:client.storeName,
            loading:false,
            pass:'',
            authenticated:false,
            drawer:null,
            //admin data
            orders:[]
        },
        getters: {
            products:(state,getters)=>{
                //list of products
                return state.products
            },
            product:(state,getters)=>{
                //one product
                return state.products.find(product=>product.name === state.route.params.name || product.name === state.route.params.name.replace(/-/g," "))
            },
            cart:(state,getters)=>{
                //list of cart items
                return state.cart
            },
            cartQuantity:(state,getters)=>{
                //number of items in cart
                var quantity = 0;
                for (var i = 0; i < state.cart.length; i++) {
                    quantity += state.cart[i].quantity
                }
                return quantity;
            },
            cartIsEmpty:(state,getters)=>{
                //bool cart is empty
                return state.cart.length == 0
            },
            cartSubTotal:(state,getters)=>{
                //price of items in cart
                var subtotal = 0
                for (var i = 0; i < state.cart.length; i++) {
                    //have to do multiply/divide 100 because javascript one-cent errors with decimals
                    subtotal += (state.cart[i].quantity * parseInt(state.cart[i].price))
                }
                return subtotal
            },
            cartShipping:(state,getters)=>{
                let shipTotal = 0
                //price of items in cart
                for (var i = 0; i < state.cart.length; i++) {
                    //have to do multiply/divide 100 because javascript one-cent errors with decimals
                    shipTotal += (state.cart[i].quantity * parseInt(state.cart[i].shipping))
                }

                //base order charge
                shipTotal += client.ordershipbasecharge

                //if subtotal is less than free shipping limit then charge shipping, otherwise it's free!
                return getters.cartSubTotal < client.ordershipfreelimit ? shipTotal : 0
            },
            cartTotal:(state,getters)=>{
                return getters.cartShipping + getters.cartSubTotal
            },
            loading:(state,getters)=>{
                //starts spinners to indicate something is happening
                return state.loading
            },
            drawer:(state,getters)=>{
                return state.drawer
            },
            order:(state,getters)=>{
                return state.order
            },
            orders:(state,getters)=>{
                return state.orders
            },
            authenticated:(state,getters)=>{
                return state.authenticated
            },
            formatPrice:(state,getters)=>{
                //returns function to format price (this is a little wierd yeah)
                const currency = Intl.NumberFormat(client.locale, {
                    style: 'currency',
                    currency: client.currency,
                    minimumFractionDigits: 2,
                })

                return price => { return currency.format(price/100) }
            },
            makeLink:(state,getters)=>{
                return name => {return name.replace(/ /g,"-")}
            }
        },
        mutations: {
            setproducts(state,products){
                state.products = products
            },
            additemtocart(state,product){
                var productitem = state.products.find(function(pp){return pp._id === product._id})

                if(productitem.stock>0){
                    //decrement from stock
                    productitem.stock--

                    //check if product is already in cart
                    var existing = false
                    for (var i = 0; i < state.cart.length; i++) {
                        var cartitem = state.cart[i]
                        var found = false

                        //add existing item to cart
                        if (cartitem._id === product._id) {
                            if(product.selectable_fields && cartitem.selectable_fields){
                                var cartoptions = cartitem.selectable_fields.map(a => a.selected.name)
                                var prodoptions = product.selectable_fields.map(a => a.selected.name)
                                if(JSON.stringify(cartoptions) === JSON.stringify(prodoptions)){
                                    found = true
                                    //remove stock from selectable options
                                    product.selectable_fields.forEach(function(v){
                                        v.selected.stock--
                                        productitem.selectable_options.forEach(function(vo){
                                            vo.stock -= v.selected._id === vo._id ? 1 : 0
                                        })
                                    })
                                }
                            }

                            if(!product.selectable_fields){
                                found = true
                            }

                            if(found){
                                existing = true
                                cartitem.stock--
                                cartitem.quantity++
                                Vue.set(state.cart, i, cartitem)
                            }
                        }
                    }

                    //add new item to cart
                    if (!existing) {
                        product.quantity = 1
                        state.cart.push(JSON.parse(JSON.stringify(product)))
                    }

                }
            },
            removeitemfromcart(state,product){
                var productitem = state.products.find(function(pp){return pp._id === product._id})
                productitem.stock++

                //first update the cart item
                for (var i = 0; i < state.cart.length; i++) {
                    var cartitem = state.cart[i]
                    var found = false

                    //remove item from cart
                    if (cartitem._id === product._id) {
                        if(product.selectable_fields && cartitem.selectable_fields && JSON.stringify(product.selectable_fields) === JSON.stringify(cartitem.selectable_fields)){
                            found = true
                            //add stock to selectable optoins
                            product.selectable_fields.forEach(function(v){
                                v.selected.stock++
                                productitem.selectable_options.forEach(function(vo){
                                    vo.stock += v.selected._id === vo._id ? 1 : 0
                                })
                            })
                        }

                        if(!product.selectable_fields){
                            found = true
                        }

                        if(found){
                            cartitem.quantity--
                            cartitem.stock++
                            if(cartitem.quantity > 0){
                                //decrement quantity
                                Vue.set(state.cart, i, cartitem)
                            } else {
                                //remove item from cart
                                state.cart.splice(i,1)
                            }
                        }
                    }
                }
            },
            deleteitemfromcart(state,product){
                for (var i = 0; i < state.cart.length; i++) {
                    var cartitem = state.cart[i]
                    if (cartitem._id === product._id) {
                        cartitem.stock += cartitem.quantity
                        cartitem.quantity = 0
                        state.cart.splice(i,1)
                    }
                }
            },
            setcart(state,val){
                state.cart = val
            },
            setloading(state,val){
                state.loading = val
            },
            setorder(state,val){
                state.order = val
            },
            setorders(state,val){
                state.orders = val
            },
            setauthenticated(state,val){
                state.authenticated = val
            },
            setdrawer(state,val){
                state.drawer = val
            },
            setpass(state,val){
                state.pass = val
            }
        },
        actions:{
            fetchProducts({commit}){
                return axios.get('/api/products')
                .then(function(response){
                    commit('setproducts',response.data);
                })
                .catch(function(error){
                    console.error('fetchProducts: ' + error);
                })
            },
            fetchOrder({commit,state}, payload){
                return axios.get('/api/order/'+payload)
                .then(function(response){
                    commit('setorder',response.data);
                })
                .catch(function(error){
                    console.error('fetchOrder: ' + error);
                })
            },
            fetchOrders({commit,state}, payload){
                return axios.post('/api/orders',{pass:state.pass})
                .then(function(response){
                    commit('setorders',response.data);
                })
                .catch(function(error){
                    console.error('fetchOrders: ' + error);
                })
            },
            checkout({dispatch,commit,state,getters}, payload){
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
                    nonce: payload.nonce,
                    email: payload.email,
                    address: payload.address,
                    comment: payload.comment
                }

                //create order in database
                return axios.post('/api/checkout',postdata)
                .then(function(response){
                    if(response.data.order){
                        //reset cart
                        commit('setcart',[])
                        //reset products
                        commit('setproducts',[])
                        //navigate to order completed page
                        payload.router.push('/order/'+response.data.order._id)
                        //refresh products
                        setTimeout(function(){
                            dispatch('fetchProducts')
                        },50)
                    }else{
                        //error of some kind
                        console.log(response)
                    }
                })
                .catch(function(error){
                    console.log(error)
                }).then(function(){
                    commit('setloading',false)
                });
            },
            auth({dispatch,commit,state}, payload){
                //show loading
                commit('setloading',true)

                //send pass to server to try and authenticate
                return axios.get('/api/auth?pass='+payload.pass)
                .then(function(response){
                    if(response.data === "good"){
                        commit('setauthenticated',true);
                        commit('setpass',payload.pass)
                        //refresh data
                        dispatch('fetchProducts')
                        dispatch('fetchOrders')
                    }
                })
                .catch(function(error){
                    console.log(error)
                })
                .then(function(){
                    commit('setloading',false);
                });
            },
            deleteProduct({dispatch,commit,state}, payload){
                return axios.post('/api/deleteProduct/'+payload,{pass:state.pass})
                .then(function(response){
                    //refresh data
                    dispatch('fetchProducts');
                })
                .catch(function(error){
                    console.log(error)
                })
            },
            addProduct({dispatch,commit,state}){
                return axios.post('/api/addProduct',{pass:state.pass})
                .then(function(response){
                    //refresh data
                    dispatch('fetchProducts')
                })
                .catch(function(error){
                    console.log(error)
                })            },
            updateProduct({dispatch,commit,state}, payload){
                return axios.post('/api/updateProduct',{pass:state.pass,product:payload})
                .then(function(response){
                    //refresh data
                    dispatch('fetchProducts')
                })
                .catch(function(error){
                    console.log(error)
                })
            },
            updateOrder({dispatch,commit,state}, payload){
                return axios.post('/api/updateOrder',{pass:state.pass,order:payload})
                .then(function(response){
                    //refresh data
                    dispatch('fetchOrders')
                })
                .catch(function(error){
                    console.log(error)
                })
            },
            uploadFiles({commit,state}, payload){
                return axios.post('/api/upload',payload)
            },
            sendEmail({commit,state}, payload){
                return axios.post('/api/contact',{pass:state.pass,email:payload})
            }
        },
    })
}