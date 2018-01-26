import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)


export function createRouter () {
  return new Router({
    mode: 'history',
    routes: [
        { path: '/', component: () => import('./components/ProductList.vue') },
        { path: '/cart', component: () => import('./components/Cart.vue') },
        { path: '/product/:name', component: () => import('./components/ProductView.vue')  },
        { path: '/order/:id', component: () => import('./components/Order.vue') },
        { path: '/admin', component: () => import('./components/Admin.vue') },
        { path: '/about', component: () => import('./components/About.vue') },
        { path: '/contact', component: () => import('./components/Contact.vue') },
      ]  
    })
}
