<template>
  <v-app>
    <v-toolbar light>
      <v-toolbar-title><router-link class="white--text" to="/">{{title}}</router-link></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon light v-on:click.native="$router.push('/cart')">
        <v-icon class="white--text">shopping_cart</v-icon>{{cartQuantity}}
      </v-btn>
    </v-toolbar>
    <main>
      <v-container fluid>
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import store from './../store.js'

export default {
  name: 'app',
  created () {
      //init the products array
      store.dispatch('fetchProducts')
      //need to get cart from local storage and make sure it's valid
  },
  computed:{
    cartQuantity: ()=>{
      return store.getters.cartQuantity;
    },
    title: ()=>{
      return store.state.store_name;
    }
  }
}
</script>

<style>
.toolbar a{
  text-decoration: none;
}
/*fade effect for page switching*/
.fade-leave-active {
  transition: opacity .2s
}
.fade-enter-active {
  transition: opacity .2s
}
.fade-enter, .fade-leave-to {
  opacity: 0
}
</style>
