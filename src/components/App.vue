<template>
  <div>
    <md-whiteframe md-elevation="2" id="main-header">
      <md-toolbar>
          <h2 class="md-title" style="flex: 1"><router-link to="/">{{title}}</router-link></h2>
          <router-link to="/cart" class="md-button">
            <md-icon>shopping_cart</md-icon>{{cartQuantity}}
          </router-link>
      </md-toolbar>
    </md-whiteframe>
    <div id="page-content">
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
    </div>
  </div>
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
#page-content {
    padding: 64px 10px 10px 10px;
    text-align: center;
}
#main-header {
    z-index: 999;
    color: #fff !important;
    position: fixed;
    width: 100%;
}
#main-header a{
    text-decoration: none;
    color: inherit;
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

/*bugfix for icon button in tablecell*/
.md-table .md-table-cell .md-button .md-icon{
    margin:auto !important;
}
</style>
