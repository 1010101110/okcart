//Vue
import Vue from 'vue'

//http
import VueResource from 'vue-resource'
Vue.use(VueResource);

//Vuex
import store from './store.js'

//components
import App from './components/App.vue'
import ProductView from './components/ProductView.vue'
import ProductList from './components/ProductList.vue'
import Cart from './components/Cart.vue'
import Order from './components/Order.vue'
import Admin from './components/Admin.vue'
import About from './components/About.vue'
import Contact from './components/Contact.vue'

//router
import Router from 'vue-router'
Vue.use(Router)

//router definition
export const router = new Router({
  mode: 'history',
  routes: [
    {
        path: '/',
        name: 'ProductList',
        component: ProductList
    },
    {
        path: '/cart',
        name: 'cart',
        component: Cart
    },
    {
        path: '/product/:name',
        name: 'product',
        component: ProductView
    },
    {
        path: '/order/:id',
        name: 'order',
        component: Order
    },
    {
        path: '/admin',
        name: 'admin',
        component: Admin
    },
    {
        path: '/about',
        name: 'about',
        component: About
    },
    {
        path: '/contact',
        name: 'contact',
        component: Contact
    },
  ]  
})

//sync router and vuex
import {sync} from 'vuex-router-sync'
sync(store,router)

//Vuetify + theme
import Vuetify from 'vuetify'
Vue.use(Vuetify,{
    theme:{
        primary: '#616161',
        accent: '#E53935',
        secondary: '#9E9E9E',
        error: '#F44336'
    }
})


//init app
const app = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})