<template>
    <div :key="pl_view">
        <v-layout row wrap>
            <v-flex xs12 sm6 md4 lg3 xl2 v-for="item in products" :key="item._id">
                <v-card v-if="item.visible" class="ma-2">
                    <v-card-title>
                        <router-link :to="{ name: 'product', params: { name: item.name }}">{{item.name}}</router-link>
                    </v-card-title>
                    <v-card-media :src="item.images[0]" height="200px"></v-card-media>
                    <v-card-actions class="mt-0">
                        <span>{{item.stock > 0 ? formatPrice(item.price) : "out of stock"}}</span>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" v-on:click.native="additemtocart(item)" :disabled="item.stock > 0 ? false:true">add to cart</v-btn>
                    </v-card-actions>
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
        return store.getters.products.filter((p)=>{return p.visible === true});
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
