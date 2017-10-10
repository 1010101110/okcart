<template>
    <div :key="ad_view">
        <div v-if="authenticated">
            <!-- products -->
            <h3>Products</h3>
            <v-layout row wrap>
                <v-flex xs12 sm6 md4 lg3 xl2 class="pa-2" v-for="item in products" :key="item._id">
                    <v-text-field disabled v-model="item._id" name="id" label="id"></v-text-field>
                    <v-text-field v-model="item.name" name="name" label="name"></v-text-field>
                    <v-text-field v-model="item.stock" name="stock" label="stock"></v-text-field>
                    <v-text-field v-model="item.price" name="price" label="price"></v-text-field>
                    <v-text-field v-model="item.shipping" name="shipping" label="shipping"></v-text-field>
                    <v-btn icon @click.native="updateProduct(item)"><v-icon>save</v-icon></v-btn>
                    <v-btn icon @click.native="deleteProduct(item._id)"><v-icon>delete</v-icon></v-btn>
                </v-flex>
                <v-flex xs12 sm6 md4 lg3 xl2 class="pa-2">
                    <v-btn color="primary" @click.native="addProduct()">Add Product</v-btn>
                </v-flex>
            </v-layout>
            <!-- orders -->
            <h3>Orders</h3>
            <v-layout row wrap>
                <v-flex xs12 sm6 md4 lg3 xl2 v-for="item in orders" :key="item._id">
                    {{item}}
                </v-flex>
            </v-layout>
            <!-- settings -->
        </div>
        <div v-else>
            <!-- login -->
            <v-text-field v-model="pass" label="Enter password" type="password"></v-text-field>
            <v-btn color="primary" light @click.native="auth()" v-if="!loading">Authenticate</v-btn>
            <v-progress-circular indeterminate primary v-bind:size="70" v-else></v-progress-circular>
        </div>
    </div>
</template>

<script>
import store from './../store.js'
import _ from 'lodash'

export default {
  name: 'Admin',
  data:{
      pass:""
  },
  computed:{
      products: ()=>{
        return _.cloneDeep(store.getters.products);
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
      },
      addProduct(){
        store.dispatch('addProduct');
      },
      updateProduct(p){
        store.dispatch('updateProduct',p)
      },
      deleteProduct(id){
        store.dispatch('deleteProduct',id)
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
