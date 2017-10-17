<template>
    <div :key="ad_view">
        <div v-if="authenticated">
            <v-tabs fixed dark>
                <v-tabs-bar class="grey darken-4">
                    <v-tabs-slider></v-tabs-slider>
                    <v-tabs-item href="#products">products</v-tabs-item>
                    <v-tabs-item href="#orders">orders</v-tabs-item>
                    <v-tabs-item href="#settings">settings</v-tabs-item>
                </v-tabs-bar>
                <v-tabs-items>
                    <v-tabs-content id="products">
                        <v-layout row wrap>
                                <v-flex xs12="pa-2">
                                    <v-btn color="primary" @click.native="addProduct()">Add Product</v-btn>
                                </v-flex>
                                <v-flex xs12 sm6 md6 lg4 xl3 class="pa-2" v-for="item in products" :key="item._id">
                                    <div class="pa-2 elevation-5">
                                        <v-text-field disabled v-model="item._id" name="id" label="id"></v-text-field>
                                        <label><input type="checkbox" v-model="item.visible">visible?</label><br>
                                        <label>view order: <input type="number" v-model.number="item.sort"></label>

                                        <v-text-field v-model="item.name" name="name" label="name"></v-text-field>
                                        <v-text-field v-model="item.stock" name="stock" label="stock"></v-text-field>
                                        <v-text-field v-model="item.price" name="price" label="price"></v-text-field>
                                        <v-text-field v-model="item.shipping" name="shipping" label="shipping"></v-text-field>
                                        
                                        <v-text-field v-if="item.images" :value="item.images.join('\n')" @input="item.images = $event.split('\n')"  multi-line name="image" label="image paths"></v-text-field>

                                        <v-text-field multi-line v-model="item.description" name="description" label="description"></v-text-field>

                                        <v-btn icon @click.native="updateProduct(item)"><v-icon>save</v-icon></v-btn>
                                        <v-btn icon @click.native="deleteProduct(item._id)"><v-icon>delete</v-icon></v-btn>
                                    </div>
                                </v-flex>
                        </v-layout>
                    </v-tabs-content>
                    <v-tabs-content id="orders">
                        <v-data-table
                            :headers="orderheaders"
                            :items="orders"
                            class="t"
                        >
                            <template slot="items" scope="props">
                                <td>{{props.item._id}}</td>
                                <td class="text-xs-right">{{new Date(props.item.charge.created*1000).toLocaleString()}}</td>
                                <td class="text-xs-right">{{props.item.email}}</td>
                                <td class="text-xs-right"> 
                                    {{props.item.address.name}}<br>
                                    {{props.item.address.street}} {{props.item.address.apt}}<br>
                                    {{props.item.address.city}} {{props.item.address.state}} {{props.item.address.zip}}<br>
                                    {{props.item.address.country}}
                                </td>
                                <td>
                                    <v-text-field
                                        v-model="props.item.status"
                                        hint="created,shipped,refunded"
                                        persistent-hint
                                    ></v-text-field>
                                </td>
                            </template>
                        </v-data-table>
                    </v-tabs-content>
                    <v-tabs-content id="settings">
                        <v-layout row wrap>
                            <v-flex xs12 sm6 md4 lg3 xl2>
                                <p>nothing here yet... lol</p>
                            </v-flex>
                        </v-layout>
                    </v-tabs-content>
                </v-tabs-items>
            </v-tabs>

            <!-- settings -->
        </div>
        <div v-else>
            <!-- login -->
            <v-text-field v-model="pass" label="Enter password" type="password"></v-text-field>
            <v-btn color="primary" light @click.native="auth()" v-if="!loading">Authenticate</v-btn>
            <v-progress-circular indeterminate primary v-bind:size="70" v-else></v-progress-circular>
        </div>
    </div>
</template>

<script>
import store from './../store.js'
import _ from 'lodash'

export default {
  name: 'Admin',
  data:()=>{return {
      pass:"",
      orderheaders:[
          {text:"ID",value:"_id",align:"left"},
          {text:"created",value:"created"},
          {text:"email",value:"email"},
          {text:"address",value:"address"},
          {text:"status",value:"status"},
      ],
      orderstatus:["created","shipped","refunded"]
  }},
  computed:{
      products: ()=>{
        return _.cloneDeep(store.getters.products);
      },
      orders: ()=>{
          return _.cloneDeep(store.getters.orders);
      },
      authenticated: ()=>{
          return store.getters.authenticated;
      },
      loading: ()=>{
          return store.getters.loading;
      }
  },
  methods:{
      formatPrice(i){
        return store.getters.currency.format(i/100);
      },
      auth(){
        store.dispatch('auth',{pass:this.pass});
      },
      addProduct(){
        store.dispatch('addProduct');
      },
      updateProduct(p){
        store.dispatch('updateProduct',p)
      },
      deleteProduct(id){
        store.dispatch('deleteProduct',id)
      },
      updateOrder(o){
        store.dispatch('updateOrder',o)
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
