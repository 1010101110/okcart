<template>
<!--just pasted, need to remap all data / functions-->
        <div :key="pl_view">
            <md-layout :md-gutter="8">
                <md-layout class="grid-item" md-flex-xsmall="50" md-flex-small="50" md-flex-medium="33" md-flex-large="20" md-flex-xlarge="20" v-for="item in products" :key="item._id">
                    <md-card>
                        <md-card-media>
                            <img :src="item.image" :alt="item.name">
                        </md-card-media>
                        <span class="text-center">
                            <span class="md-body-2"><router-link :to="{ name: 'product', params: { name: item.name }}">{{item.name}}</router-link></span> <br />
                            <span class="md-caption">{{item.stock > 0 ? "$ "+ item.price/100 : "out of stock"}}</span>
                        </span>
                        <md-button v-on:click.native="additemtocart(item)" :disabled="item.stock > 0 ? false:true">add to cart</md-button>
                    </md-card>
                </md-layout>
            </md-layout>

            <!--popup-->
            <md-snackbar md-position="bottom center" ref="overcartlimit">
                <span>you have enough of that in your cart</span>
                <md-button class="md-accent" md-theme="light-blue" @click.native="$refs.snackbar.close()">x</md-button>
            </md-snackbar>
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
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.grid-item {
    margin-top: 5px;
}
</style>
