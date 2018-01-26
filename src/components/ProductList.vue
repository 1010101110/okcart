<template>
    <div :key="pl_view">
	<h3>There are delays in CARDI seeds shipment, ETA February </h3>
        <v-layout row wrap>
            <v-flex xs12 sm6 md4 lg4 xl3 v-for="item in products" :key="item._id">
                <v-card v-if="item.visible" class="ma-2">
                    <v-card-title>
                        <router-link :to="`product/${$store.getters.makeLink(item.name)}`">{{item.name}}</router-link>
                    </v-card-title>
                    <v-card-media :src="item.images[0]" height="200px"></v-card-media>
                    <v-card-actions class="mt-0">
                        <span>{{item.stock > 0 ? $store.getters.formatPrice(item.price) : "out of stock"}}</span>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" v-on:click.native="additemtocart(item)" :disabled="item.stock > 0 ? false:true">add to cart</v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
        <v-snackbar bottom color="accent" :timeout="2000" dark v-model="addsnack">
            item added to cart
        </v-snackbar>
    </div>
</template>

<script>
export default {
  name: 'ProductList',
    data:()=>{
        return {
            addsnack:false
        }
    },
  asyncData ({ store, route }) {
      //init the products array
      return store.dispatch('fetchProducts')
  },
  computed:{
      products(){
        return this.$store.getters.products.filter((p)=>{return p.visible === true});
      }
  },
  methods:{
      additemtocart(item){
        this.addsnack = true
        this.$store.commit('additemtocart',item);
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
