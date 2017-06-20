<template>
    <div :key="pl_view">
        <v-layout row wrap>
            <v-flex xs12 sm6 md4 lg3 xl2 v-for="item in products" :key="item._id">
                <v-card class="ma-2">
                    <v-card-row class="grey lighten-4 mt-0">
                        <v-card-title>
                            <router-link :to="{ name: 'product', params: { name: item.name }}">{{item.name}}</router-link>
                        </v-card-title>
                    </v-card-row>
                    <v-card-row :img="item.image" height="200px"></v-card-row>
                    <v-card-row actions class="grey lighten-4 mt-0">
                        <span>{{item.stock > 0 ? formatPrice(item.price) : "out of stock"}}</span>
                        <v-spacer></v-spacer>
                        <v-btn primary light v-on:click.native="additemtocart(item)" :disabled="item.stock > 0 ? false:true">add to cart</v-btn>
                    </v-card-row>
                </v-card>
            </v-flex>
        </v-layout>
    </div>
</template>

<script>
import store from './../store.js'

export default {
  name: 'ProductList',
  computed:{
      products: ()=>{
        return store.getters.products;
      }
  },
  methods:{
      additemtocart(item){
        store.commit('additemtocart',item);
      },
      formatPrice(i){
        return store.getters.currency.format(i/100);
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card__title a{
    text-decoration: none;
}
</style>
