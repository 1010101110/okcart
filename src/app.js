//Vue
import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router.js'
import { createStore } from './store.js'
import { sync } from 'vuex-router-sync'


//Vuetify + theme
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
Vue.use(Vuetify,{
    theme:{
        primary: '#616161',
        accent: '#E53935',
        secondary: '#9E9E9E',
        error: '#F44336'
    }
})



export function createApp(ssrContext) {
  // create store and router instances
  const store = createStore()
  const router = createRouter()

  // sync the router with the vuex store.
  // this registers `store.state.route`
  sync(store, router)

  // create the app instance.
  // here we inject the router, store and ssr context to all child components,
  // making them available everywhere as `this.$router` and `this.$store`.
  const app = new Vue({
    router,
    store,
    ssrContext,
    render: h => h(App)
  })

  // expose the app, the router and the store.
  // note we are not mounting the app here, since bootstrapping will be
  // different depending on whether we are in a browser or on the server.
  return { app, router, store }
}
    