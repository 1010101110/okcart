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
                    <v-card-row>
                        <div class="headline text-xs-center">{{item.name}}</div>                    
                        <v-spacer></v-spacer>
                        <v-text-field
                            multi-line
                            box
                            readonly
                            auto-grow
                            v-model="item.description"
                        >
                        </v-text-field>
                        <v-spacer></v-spacer>
                        <span class="pa-2">{{item.stock > 0 ? "" : "out of stock"}}</span>
                        <v-spacer></v-spacer>
                        <span class="pa-2">price: {{$store.getters.formatPrice(item.price)}}</span>
                        <v-spacer></v-spacer>
                        <span class="pa-2" v-if="item.shipping">shipping: {{$store.getters.formatPrice(item.shipping)}}</span>
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
      }
    }
}
</script>

<style scoped>
.myheight{
    height: calc(85vh - 100px) !important;
}
</style>