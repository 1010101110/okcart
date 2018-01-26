<template>
  <v-app>
    <v-navigation-drawer
      clipped
      fixed
      disable-route-watcher
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
        <v-divider></v-divider>
        <v-subheader>Social</v-subheader>
        <v-list-tile avatar >
            <a target="_blank" href="https://www.instagram.com/mystore"><img class="socialicon" src="/assets/instaicon.jpg"></a>
            <a target="_blank" href="https://www.facebook.com/mystore"><img class="socialicon" src="/assets/fbicon.svg"></a>
            <a target="_blank" href="https://www.reddit.com/user/mystore"><img class="socialicon" src="/assets/redditicon.jpg"></a>
        </v-list-tile>        
      </v-list>
    </v-navigation-drawer>
    <v-toolbar class="primary" fixed dark dense clipped-left app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>{{this.$store.state.store_name}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon dark v-on:click.native="$router.push('/cart')">
        <v-icon>shopping_cart</v-icon>{{cartQuantity}}
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'app',
  data: ()=>{
    return {
      menuitems:[
        {icon:"store",text:"Store",href:"/"},
        {icon:"people",text:"About",href:"/about"},
        {icon:"contact_mail",text:"Contact",href:"/contact"},
      ],
      cursor:"auto"
    }
  },
  computed:{
    drawer:{ 
      get(){
        return this.$store.getters.drawer
      },
      set(z){
        this.$store.commit('setdrawer',z)
      } 
    },
    cartQuantity(){
      return this.$store.getters.cartQuantity;
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
.socialicon{
	width: 20px;
	height: 20px;
  float: left;
  margin: 0 5px;
}
</style>
