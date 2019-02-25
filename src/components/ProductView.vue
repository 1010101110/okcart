<template>
    <div v-if="item" key="pv_view">
        <v-layout row wrap>
            <v-flex xs12 sm6>
                <v-container grid-list-sm text-xs-center>
                    <v-layout row wrap>
                        <v-flex xs12>
                            <a :href="item.images[selectedImage]" target="_blank">
                                <v-img
                                    :src="item.images[selectedImage]"
                                    height="400px"
                                    class="clickable"
                                ></v-img>
                            </a>
                        </v-flex>
                        <v-flex xs12>
                            <v-img
                                v-for="(img,i) in item.images" :key="i"
                                :src="img"
                                height="50px"
                                width="50px"
                                class="clickable mx-1 d-inline-flex"
                                contain
                                @click="selectedImage = i"
                            ></v-img>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-flex>
            <v-flex xs12 sm6>
                <v-card class="ma-2">
                    <div class="headline text-xs-center">{{item.name}}</div>
                    <div class="pa-2 mytext">{{item.description}}</div>
                    <v-card-actions>
                        <span>price: {{$store.getters.formatPrice(item.price)}}</span>
                        <span class="px-2" v-if="item.shipping">shipping: {{$store.getters.formatPrice(item.shipping)}}</span>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" v-on:click.native="additemtocart(item)" :disabled="item.stock > 0 ? false:true">{{item.stock > 0 ? "add to cart" : "out of stock"}}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
            <v-flex xs12 v-if="item.selectable_fields && item.selectable_fields.length > 0">
                <div class="headline text-xs-center">Select options</div>
                <v-layout row wrap>
                    <v-flex xs12 sm6 lg4 class="px-2" v-for="v in item.selectable_fields" :key="v">
                        <v-select
                            v-model="v.selected"
                            :items="item.selectable_options.filter(x=>x.type === v.type)"
                            :label="v.name"
                            :error="v.error"
                            item-text="name"
                            :item-disabled="vo => vo.stock < 1"
                            @change="option_selected($event,v)"
                            return-object
                            clearable
                        ></v-select>
                        <v-card v-if="v.selected">
                            <v-img
                                :src="v.selected.images[0]"
                                height="250px"
                                width="250px"
                            ></v-img>
                            <div class="pa-2 mytext">{{v.selected.desc}}</div>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
        <v-snackbar bottom color="deep-purple" v-model="addsnack">
            Added to cart <v-icon color="white">shopping_cart</v-icon>
        </v-snackbar>
        <v-snackbar bottom color="red" v-model="failsnack">
            you are missing a required field <v-icon color="white">error</v-icon>
        </v-snackbar>
    </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'

export default {
    name: 'ProductView',
    mounted:function(){
        document.title = this.item.name

        //structured data for SEO
        let richscript = document.createElement("script")
        richscript.type = "application/ld+json"
        richscript.innerHTML = `
            {
                "@context": "http://schema.org/",
                "@type": "Product",
                "name": "${this.item.name}",
                "image": "${window.location.origin + this.item.images[0]}",
                "description": ${JSON.stringify(this.item.description)},
                "offers": {
                    "@type": "Offer",
                    "availability": "${this.item.stock > 0 ? "http://schema.org/InStock" : "http://schema.org/OutOfStock"}",
                    "price": "${this.item.price / 100}",
                    "priceCurrency": "USD"
                }
            }`
        document.head.appendChild(richscript)
    },
    data:()=>{
        return {
            addsnack:false,
            failsnack:false,
            selectedImage:0,
            selected_fields:[]
        }
    },
    asyncData ({ store, route }) {
        //init the products array
        if(store.getters.products.length < 1){
            return store.dispatch('fetchProducts')
        }
    },
    computed:{
        item: function(){
            return this.$store.getters.product
        }
    },
    methods:{
      option_selected:function(selected_option,selected_field){
          //find if this field was previously selected
          for (let i = 0; i < this.selected_fields.length; i++) {
              const sf = this.selected_fields[i];
              if(sf.name === selected_field.name){
                  //add stock back to the option
                  let found = this.item.selectable_options.filter(x => x.name === sf.selected.name)
                  if(found.length === 1){
                      found[0].stock++
                  }else{
                      console.log('bad options to stock back')
                  }

                  //remove from the selected fields array
                  this.selected_fields.splice(i,1)
              }
          }

          if(selected_option && selected_option.stock){
            selected_option.stock--
            //termporarily store the selected field so we can credit the stock back if it is unselected.
            this.selected_fields.push(cloneDeep(selected_field))
          }
      },
      additemtocart(item){
        //validate selectable fields
        let valid = true
        if(item.selectable_fields){
            item.selectable_fields.forEach(function(v){
                v.error = false
                if(v.required && !v.selected){
                    valid = false
                    v.error = true
                }
            })
        }

        if(valid){
            this.addsnack = true
            this.$store.commit('additemtocart',item);
        }else{
            this.failsnack = true
        }
      }
    }
}
</script>

<style scoped>
.myheight{
    height: calc(85vh - 100px) !important;
}
.mytext{
    white-space: pre-wrap;
}
.clickable{
    cursor:pointer;
}
</style>