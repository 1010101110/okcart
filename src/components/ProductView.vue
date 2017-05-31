<template>
        <div v-if="product" :key="pv_view">
            <h1>{{product.name}}</h1>
            <img class="productimage" :src="product.image" :alt="product.name">
            <br>
            <span class="text-center">
                <span class="md-body-2">{{product.name}}</span> <br />
                <span class="md-caption">{{product.stock > 0 ? "$"+ product.price/100 : "out of stock"}}</span>
            </span>
            <md-button v-on:click.native="additemtocart(product)" :disabled="product.stock > 0 ? false:true">add to cart</md-button>
        </div>
</template>

<script>
import store from './../store.js'

export default {
    name: 'ProductView',
    computed:{
        product:()=>{
            return store.getters.product
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
.productimage {
    max-width: 50%;
    max-height: 50%;
}

</style>