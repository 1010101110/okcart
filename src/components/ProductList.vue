<template>
    <div key="pl_view">
        <v-layout row wrap>
            <v-flex xs12 sm6 md4 lg4 xl3 v-for="item in products" :key="item._id">
                <v-card v-if="item.visible" class="ma-2">
                    <v-card-title>
                        <router-link :to="`product/${$store.getters.makeLink(item.name)}`">{{item.name}}</router-link>
                    </v-card-title>
                    <router-link :to="`product/${$store.getters.makeLink(item.name)}`">
                        <v-img :src="item.images[0]" height="250px"></v-img>
                    </router-link>
                    <v-card-actions class="mt-0">
                        <span>{{item.stock > 0 ? $store.getters.formatPrice(parseInt(item.price) + parseInt(item.shipping)) : "out of stock"}}</span>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" v-if="item.selectable_fields && item.selectable_fields.length" v-on:click.native="go(`product/${$store.getters.makeLink(item.name)}`)">details</v-btn>
                        <v-btn color="primary" v-else v-on:click.native="additemtocart(item)" :disabled="item.stock > 0 ? false:true">add to cart</v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
            <v-flex xs12>
                <v-card class="ma-2 pa-2">
                    Want to know when we update stock or release new items?<br>
                    Join the <a href="https://goo.gl/forms/iOYdI5K6A7A44SVI2">mailing list</a>
                <v-card>
            </v-flex>
        </v-layout>
        <v-snackbar top color="deep-purple" v-model="addsnack" dark>
            Added to cart <v-icon color="white">shopping_cart</v-icon>
        </v-snackbar>
    </div>
</template>

<script>
export default {
    name: 'ProductList',
    mounted:function(){
        document.title = this.$store.state.store_name
    },
    data:()=>{
        return {
            addsnack:false
        }
    },
  asyncData ({ store, route }) {
      //init the products array
      if(store.getters.products.length < 1){
          return store.dispatch('fetchProducts')
      }
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
      },
      go(href){
          this.$router.push(href)
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
