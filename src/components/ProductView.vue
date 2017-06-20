<template>
    <div v-if="item" :key="pv_view">
        <v-layout row wrap>
            <v-flex xs12 sm6>
                <v-carousel class="myheight">
                    <v-carousel-item v-for="(img,i) in item.image" v-bind:src="img" :key="i"></v-carousel-item>
                </v-carousel>
            </v-flex>
            <v-flex xs12 sm6>
                <v-card class="ma-2">
                    <v-card-title>
                        <router-link :to="{ name: 'product', params: { name: item.name }}">{{item.name}}</router-link>
                    </v-card-title>
                    <v-card-text>
                        {{item.description}}
                    </v-card-text>
                    <v-card-row actions class="grey lighten-4 mt-0">
                        <span>{{item.stock > 0 ? formatPrice(item.price) : "out of stock"}}</span>
                        <v-spacer></v-spacer>
                        <v-btn v-on:click.native="additemtocart(item)" :disabled="item.stock > 0 ? false:true">add to cart</v-btn>
                    </v-card-row>
                </v-card>
            </v-flex>
        </v-layout>
    </div>
</template>

<script>
import store from './../store.js'

export default {
    name: 'ProductView',
    computed:{
        item:()=>{
            return store.getters.product;
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

<style scoped>
.myheight{
    height: calc(85vh - 100px) !important;
}
</style>