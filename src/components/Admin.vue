<template>
    <div :key="ad_view">
        <div v-if="authenticated">
            <!-- products -->
            <h1>Products</h1>
            <v-layout row wrap>
                <v-flex xs12 sm6 md4 lg3 xl2 v-for="item in products" :key="item._id">
                    {{item.name}} - {{formatPrice(item.price)}}<br>
                    stock: {{item.stock}}<br>
                    <v-btn icon class="indigo--text">
                        <v-icon>edit</v-icon>
                    </v-btn>
                </v-flex>
            </v-layout>
            <!-- orders -->
            <h1>Orders</h1>
            <v-layout row wrap>
                <v-flex xs12 sm6 md4 lg3 xl2 v-for="item in orders" :key="item._id">
                    {{item._id}}<br>
                    {{item.address.name}}<br>
                    {{formatPrice(item.amount)}}
                </v-flex>
            </v-layout>
            <!-- settings -->
        </div>
        <div v-else>
            <!-- login -->
            <v-text-field v-model="pass" label="Enter password" type="password"></v-text-field>
            <v-btn primary light @click.native="auth()" v-if="!loading">Authenticate</v-btn>
            <v-progress-circular indeterminate primary v-bind:size="70" v-else></v-progress-circular>
        </div>
    </div>
</template>

<script>
import store from './../store.js'

export default {
  name: 'Admin',
  data:{
      pass:""
  },
  computed:{
      products: ()=>{
        return store.getters.products;
      },
      orders: ()=>{
          return store.getters.orders;
      },
      authenticated: ()=>{
          return store.getters.authenticated;
      },
      loading: ()=>{
          return store.getters.loading;
      }
  },
  methods:{
      formatPrice(i){
        return store.getters.currency.format(i/100);
      },
      auth(){
        store.dispatch('auth',{pass:this.pass});
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
