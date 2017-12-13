<template>
    <div :key="ad_view">
        <div v-if="authenticated">
            <v-tabs fixed>
                <v-tabs-bar color="secondary" dark>
                    <v-tabs-slider></v-tabs-slider>
                    <v-tabs-item href="#products">products</v-tabs-item>
                    <v-tabs-item href="#orders">orders</v-tabs-item>
                    <v-tabs-item href="#assets">assets</v-tabs-item>
                </v-tabs-bar>
                <v-tabs-items>
                    <v-tabs-content id="products">
                        <v-btn color="primary" @click.native="addProduct()">Add Product</v-btn>
                        <v-data-table
                            :headers="productheaders"
                            :items="products"
                            item-key="_id"
                            hide-actions
                            expand
                        >
                            <template slot="items" scope="props">
                                <tr @click="props.expanded = !props.expanded">
                                    <td class="text-xs-right">{{props.item.sort}}</td>
                                    <td class="text-xs-right">{{props.item._id}}</td>
                                    <td class="text-xs-right">{{props.item.name}}</td>                                    
                                    <td class="text-xs-right">{{props.item.visible}}</td>
                                </tr>
                            </template>
                            <template slot="expand" scope="props">
                                <v-card class="pa-2">
                                    <v-text-field disabled v-model="props.item._id" name="id" label="id"></v-text-field>
                                    <label><input type="checkbox" v-model="props.item.visible">visible?</label><br>
                                    <label>view order: <input type="number" v-model.number="props.item.sort"></label>

                                    <v-text-field v-model="props.item.name" name="name" label="name"></v-text-field>
                                    <v-text-field v-model="props.item.stock" name="stock" label="stock"></v-text-field>
                                    <v-text-field v-model="props.item.price" name="price" label="price"></v-text-field>
                                    <v-text-field v-model="props.item.shipping" name="shipping" label="shipping"></v-text-field>
                                    
                                    <v-text-field v-if="props.item.images" :value="props.item.images.join('\n')" @input="props.item.images = $event.split('\n')"  multi-line name="image" label="image paths"></v-text-field>

                                    <v-text-field multi-line v-model="props.item.description" name="description" label="description"></v-text-field>

                                    <v-btn icon @click.native="updateProduct(props.item)"><v-icon>save</v-icon></v-btn>
                                    <v-btn icon @click.native="deleteProduct(props.item._id)"><v-icon>delete</v-icon></v-btn>
                                </v-card>
                            </template>
                        </v-data-table>
                    </v-tabs-content>
                    <v-tabs-content id="orders">
                        <v-data-table
                            :headers="orderheaders"
                            :items="orders"
                            item-key="_id"
                            hide-actions
                            expand
                        >
                            <template slot="items" scope="props">
                                <tr @click="props.expanded = !props.expanded">
                                    <td class="text-xs-right">{{new Date(props.item.charge.created*1000).toLocaleString()}}</td>
                                    <td class="text-xs-right">{{props.item._id}}</td>                                    
                                    <td class="text-xs-right">{{props.item.email}}</td>
                                    <td class="text-xs-right"> 
                                        {{props.item.address.name}}<br>
                                        {{props.item.address.street}} {{props.item.address.apt}}<br>
                                        {{props.item.address.city}} {{props.item.address.state}} {{props.item.address.zip}}<br>
                                        {{props.item.address.country}}
                                    </td>
                                </tr>
                            </template>
                            <template slot="expand" scope="props">
                                <v-card class="pa-2">
                                    <v-layout row wrap>
                                        <v-flex xs12>
                                            <v-select
                                                    :items="orderstatus"
                                                    v-model="props.item.status"
                                                    label="status"
                                            ></v-select>
                                        </v-flex>
                                        <v-flex xs12 sm6>
                                            <v-text-field
                                                v-model="props.item.trackingnum"
                                                name="trackingnum"
                                                label="tracking number"
                                            ></v-text-field>
                                        </v-flex>
                                        <v-flex xs12 sm6>
                                            <v-text-field
                                                v-model="props.item.trackingco"
                                                name="trackingco"
                                                label="tracking company"
                                            ></v-text-field>
                                        </v-flex>
                                        <v-flex xs12>
                                            <v-btn icon @click.native="updateOrder(props.item)"><v-icon>save</v-icon></v-btn>
                                        </v-flex>
                                    </v-layout>                                
                                </v-card>
                            </template>
                        </v-data-table>
                    </v-tabs-content>
                    <v-tabs-content id="assets">
                        <v-layout row wrap>
                            <v-flex xs12 sm6 offset-sm3>                                 
                                <v-icon>folder</v-icon> click or drop files in the box to upload
                                <v-card :class="{primary:drag,grey:!drag}" @dragover.stop.prevent="imagedragover" class="ma-3 text-xs-center">
                                    <input type="file" multiple class="fileinput" @change="fileinput">
                                </v-card>
                                <v-progress-circular v-if="busy" indeterminate color="primary"></v-progress-circular>                                                                
                                <h5 v-if="uploadedfiles.length">Uploaded assets:</h5>
                                <p v-for="(item,index) in uploadedfiles" :key="index">
                                    {{item}}
                                </p>
                            </v-flex>
                        </v-layout>
                    </v-tabs-content>
                </v-tabs-items>
            </v-tabs>
        </div>
        <div v-else>
            <!-- login -->
            <v-text-field v-model="pass" @keyup.13="auth()" label="Enter password" type="password"></v-text-field>
            <v-btn color="primary" dark @click.native="auth()" v-if="!loading">Authenticate</v-btn>
            <v-progress-circular indeterminate primary v-bind:size="70" v-else></v-progress-circular>
        </div>
    </div>
</template>

<script>
import store from './../store.js'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'Admin',
  data:()=>{return {
      pass:"",
      productheaders:[
          {text:"View Order",value:"sort"},
          {text:"_id",value:"id"},
          {text:"Name",value:"name"},          
          {text:"Visibile",value:"visible"},
      ],
      orderheaders:[
          {text:"created",value:"created"},
          {text:"id",value:"id"},          
          {text:"email",value:"email"},
          {text:"address",value:"address"},
      ],
      orderstatus:["created","shipped","refunded"],
      drag:false,
      droptimeout:null,
      uploadedfiles:[],
      busy:false
  }},
  computed:{
      products: ()=>{
          return cloneDeep(store.getters.products);
      },
      orders: ()=>{
          return cloneDeep(store.getters.orders);
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
      },
      imagedragover(e){
          var self = this
          self.drag = true

          if(self.droptimeout){
              clearTimeout(self.droptimeout)
          }
          self.droptimeout = setTimeout(function() {
              self.drag = false
          }, 100);
      },
      fileinput(e){
          var formData = new FormData()
          var files = e.target.files
          //exit if no files
          if(!files.length) return
          //show busy
          var self = this
          self.busy = true

          //put files into formdata
          for (var y = 0; y < files.length; y++) {
              var f = files[y];
              formData.append('uploads[]',f,f.name)
          }

          //upload
          store.dispatch('uploadFiles',formData).then(resp=>{
              self.busy = false
              var paths = JSON.parse(resp.bodyText)
              self.uploadedfiles = self.uploadedfiles.concat(paths)
          })
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .fileinput{
        opacity: 0;
        width: 100%;
        height: 200px;
        cursor: pointer;
    }
</style>
