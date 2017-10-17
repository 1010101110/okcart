<template>
    <div v-if="item" :key="pv_view">
        <v-layout row wrap>
            <v-flex xs12 sm6>
                <v-carousel class="myheight">
                    <v-carousel-item v-for="(img,i) in item.images" v-bind:src="img" :key="i"></v-carousel-item>
                </v-carousel>
            </v-flex>
            <v-flex xs12 sm6>
                <v-card class="ma-2">
                    <v-card-title>
                        <h5>{{item.name}}</h5>
                    </v-card-title>
                    <v-card-text>
                        <v-text-field
                            multi-line
                            readonly
                            auto-grow
                            v-model="item.description"
                        >
                        </v-text-field>
                    </v-card-text>
                    <v-card-row actions>
                        <span>{{item.stock > 0 ? "" : "out of stock"}}</span>
                        <v-spacer></v-spacer>
                        <span>price: {{formatPrice(item.price)}}</span>
                        <v-spacer></v-spacer>
                        <span v-if="item.shipping">shipping: {{formatPrice(item.shipping)}}</span>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" v-on:click.native="additemtocart(item)" :disabled="item.stock > 0 ? false:true">add to cart</v-btn>
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