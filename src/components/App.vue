<template>
  <v-app>
    <v-navigation-drawer
      persistent
      clipped
      enable-resize-watcher
      v-model="drawer"
      app
    >
      <v-list dense>
        <v-list-tile v-for="item in menuitems" :key="item.text" :to="item.href">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ item.text }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar class="primary" fixed dark dense clipped-left app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>{{title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon dark v-on:click.native="$router.push('/cart')">
        <v-icon>shopping_cart</v-icon>{{cartQuantity}}
      </v-btn>
    </v-toolbar>
    <main>
      <v-content>
        <v-container fluid>
          <transition name="fade" mode="out-in">
            <router-view></router-view>
          </transition>
        </v-container>
      </v-content>
    </main>
  </v-app>
</template>

<script>
import store from './../store.js'

export default {
  name: 'app',
  data: ()=>({
    menuitems:[
      {icon:"store",text:"Store",href:"/"},
      {icon:"people",text:"About",href:"/cart"},
      {icon:"contact_mail",text:"Contact",href:"contact"},
    ],
    cursor:"auto"
  }),
  created () {
      //init the products array
      store.dispatch('fetchProducts')
      //need to get cart from local storage and make sure it's valid
  },
  computed:{
    drawer:{ 
      get: ()=>{
        return store.state.drawer
      },
      set: (z)=>{
        store.commit('setdrawer',z)
      } 
    },
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
