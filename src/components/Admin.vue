<template>
    <div key="ad_view">
        <div v-if="authenticated">

            <v-tabs fixed-tabs color="secondary" dark>
                <v-tab key="products">products</v-tab>
                <v-tab key="orders">orders</v-tab>
                <v-tab key="assets">assets</v-tab>

                <v-tab-item key="products">

                    <v-btn color="primary" @click.native="addProduct()">Add Product</v-btn>
                    <v-text-field v-model="productsearch" placeholder="Search" prepend-icon="search" single-line hide-details></v-text-field>
                    <v-data-table
                        :headers="productheaders"
                        :items="products"
                        item-key="_id"
                        :search="productsearch"
                        hide-actions
                        expand
                    >
                        <template slot="items" scope="props">
                            <tr @click="props.expanded = !props.expanded">
                                <td class="text-xs-right">{{props.item.sort}}</td>
                                <td class="text-xs-right">{{props.item.name}}</td>
                                <td class="text-xs-right">{{props.item.stock}}</td>
                                <td class="text-xs-right">{{props.item.price}}</td>
                                <td class="text-xs-right">{{props.item.visible}}</td>
                            </tr>
                        </template>
                        <template slot="expand" scope="props">
                            <v-card class="pa-3">
                                <v-text-field disabled v-model="props.item._id" name="id" label="id"></v-text-field>
                                <v-switch label="Visible" @click.native="$forceUpdate()" v-model="props.item.visible" light></v-switch>
                                <v-text-field label="Sort Order" type="number" v-model.number="props.item.sort"></v-text-field>
                                <v-text-field v-model="props.item.name" name="name" label="name"></v-text-field>
                                <v-text-field v-model="props.item.stock" name="stock" label="stock"></v-text-field>
                                <v-text-field v-model="props.item.price" name="price" label="price"></v-text-field>
                                <v-text-field v-model="props.item.shipping" name="shipping" label="shipping"></v-text-field>

                                <v-textarea v-if="props.item.images" :value="props.item.images.join('\n')" @input="props.item.images = $event.split('\n')"  name="image" label="image paths"></v-textarea>

                                <v-textarea v-model="props.item.description" name="description" label="description"></v-textarea>

                                <span class="subheading">Selectable Fields <v-btn icon @click="addField(props.item)"> <v-icon>add</v-icon> </v-btn></span>
                                <v-card class="pa-2 my-2 elevation-4" v-if="props.item.selectable_fields" v-for="(v,index) in props.item.selectable_fields" :key="v">
                                    <v-text-field label="name" v-model="v.name"></v-text-field>
                                    <v-text-field label="type" v-model="v.type"></v-text-field>
                                    <v-checkbox label="required" v-model="v.required"></v-checkbox>
                                    <v-tooltip top>
                                        <span>Delete field</span>
                                        <v-btn icon @click.native="deleteField(props.item,index)" slot="activator"><v-icon>delete</v-icon></v-btn>
                                    </v-tooltip>
                                </v-card>

                                <br>

                                <span class="subheading">Selectable Options <v-btn icon @click="addOption(props.item)"> <v-icon>add</v-icon> </v-btn> </span>
                                <v-card class="pa-2 my-2 elevation-4" v-if="props.item.selectable_options" v-for="(vo,index) in props.item.selectable_options" :key="vo">
                                    <v-text-field label="name" v-model="vo.name"></v-text-field>
                                    <v-text-field label="type" v-model="vo.type"></v-text-field>
                                    <v-text-field label="stock" type="number" v-model="vo.stock"></v-text-field>
                                    <v-textarea v-if="vo.images" :value="vo.images.join('\n')" @input="vo.images = $event.split('\n')" label="image paths"></v-textarea>
                                    <v-textarea v-model="vo.desc" label="description"></v-textarea>
                                    <v-tooltip top>
                                        <span>Delete option</span>
                                        <v-btn icon @click.native="deleteOption(props.item,index)" slot="activator"><v-icon>delete</v-icon></v-btn>
                                    </v-tooltip>
                                </v-card>

                                <br>

                                <v-tooltip top>
                                    <span>Update Product</span>
                                    <v-btn icon @click.native="updateProduct(props.item)" slot="activator"><v-icon>save</v-icon></v-btn>
                                </v-tooltip>
                                <v-tooltip top>
                                    <span>Delete Product</span>
                                    <v-btn icon @click.native="deleteProduct(props.item._id)" slot="activator"><v-icon>delete</v-icon></v-btn>
                                </v-tooltip>
                            </v-card>
                        </template>
                    </v-data-table>
                </v-tab-item>
                <v-tab-item key="orders">
                    <v-text-field v-model="ordersearch" placeholder="Search" prepend-icon="search" single-line hide-details></v-text-field>
                    <v-data-table
                        :headers="orderheaders"
                        :items="orders"
                        item-key="_id"
                        :pagination.sync="orderpagination"
                        :search="ordersearch"
                        hide-actions
                        expand
                    >
                        <template slot="items" scope="props">
                            <tr @click="props.expanded = !props.expanded">
                                <td class="text-xs-right">{{new Date(props.item.createdOn).toLocaleString()}}</td>
                                <td class="text-xs-right">{{props.item.status}}</td>
                                <td class="text-xs-right">{{$store.getters.formatPrice(props.item.total)}}</td>
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
                            <v-card class="pa-3 grey lighten-4">
                                <v-layout row wrap>
                                    <v-flex xs12 sm6 lg4 class="px-1">
                                        <v-select
                                                :items="orderstatus"
                                                v-model="props.item.status"
                                                label="status"
                                        ></v-select>
                                    </v-flex>
                                    <v-flex xs12 sm6 lg4 class="px-1">
                                        <v-text-field
                                            v-model="props.item.trackingnum"
                                            name="trackingnum"
                                            label="tracking number"
                                        ></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm6 lg4 class="px-1">
                                        <v-text-field
                                            v-model="props.item.trackingco"
                                            name="trackingco"
                                            label="tracking company"
                                        ></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 class="px-1">
                                        <v-textarea name="comment" label="Order Comments" v-model="props.item.comment"></v-textarea>
                                    </v-flex>
                                    <v-flex xs12>
                                        <v-tooltip top>
                                            <span>Update Order</span>
                                            <v-btn icon @click.native="updateOrder(props.item)" slot="activator"><v-icon>save</v-icon></v-btn>
                                        </v-tooltip>
                                        <v-tooltip top>
                                            <span>Order Details</span>
                                            <v-btn icon :href="'/order/' + props.item._id" slot="activator"><v-icon>receipt</v-icon></v-btn>
                                        </v-tooltip>
                                    </v-flex>
                                </v-layout>
                            </v-card>
                        </template>
                    </v-data-table>
                </v-tab-item>
                <v-tab-item key="assets">
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
                </v-tab-item>
            </v-tabs>
        </div>
        <div v-else>
            <!-- login -->
            <v-text-field v-model="pass" @keyup.13="auth()" placeholder="Enter password" type="password"></v-text-field>
            <v-btn color="primary" dark @click.native="auth()" v-if="!loading">Authenticate</v-btn>
            <v-progress-circular indeterminate primary v-bind:size="70" v-else></v-progress-circular>
        </div>
        <v-snackbar top color="deep-purple" v-model="snack">
            {{snackt}} <v-icon color="white">save</v-icon>
        </v-snackbar>
    </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'

export default {
    name: 'Admin',
    mounted:function(){
        document.title = this.$store.state.store_name
    },
  data:()=>{return {
      pass:"",
      productheaders:[
          {text:"View Order",value:"sort"},
          {text:"Name",value:"name"},
          {text:"Stock",value:"stock"},
          {text:"Price",value:"price"},
          {text:"Visibile",value:"visible"},
      ],
      orderheaders:[
          {text:"order date",value:"createdOn"},
          {text:"status",value:"status"},
          {text:"total",value:"total"},
          {text:"email",value:"email"},
          {text:"address",value:"address"},
      ],
      orderpagination:{
          sortBy:'createdOn',
          descending:true,
          rowsPerPage:50
      },
      orderstatus:["created","shipped","refunded"],
      ordersearch:"",
      productsearch:"",
      drag:false,
      droptimeout:null,
      uploadedfiles:[],
      busy:false,
      snack:false,
      snackt:""
  }},
  computed:{
      products(){
          return cloneDeep(this.$store.getters.products);
      },
      orders(){
          return cloneDeep(this.$store.getters.orders);
      },
      authenticated(){
          return this.$store.getters.authenticated;
      },
      loading(){
          return this.$store.getters.loading;
      }
  },
  methods:{
      auth(){
        this.$store.dispatch('auth',{pass:this.pass});
      },
      addProduct(){
        let mythis = this
        this.$store.dispatch('addProduct')
        .then(function(){
            mythis.snackt = "new product added"
            mythis.snack = true
        })
      },
      addField(item){
          if(!item.selectable_fields){
              this.$set(item,"selectable_fields",[])
          }
          item.selectable_fields.push({})
          this.$forceUpdate()
      },
      deleteField(item,index){
          item.selectable_fields.splice(index,index+1)
          this.$forceUpdate()
      },
      addOption(item){
          if(!item.selectable_options){
              this.$set(item,"selectable_options",[])
          }
          item.selectable_options.push({images:["/assets/default.jpg"]})
          this.$forceUpdate()
      },
      deleteOption(item,index){
          item.selectable_options.splice(index,index+1)
          this.$forceUpdate()
      },
      updateProduct(p){
        let mythis = this
        this.$store.dispatch('updateProduct',p)
        .then(function(){
            mythis.snackt = "product updated"
            mythis.snack = true
        })
      },
      deleteProduct(id){
        let mythis = this
        this.$store.dispatch('deleteProduct',id)
        .then(function(){
            mythis.snackt = "product deleted"
            mythis.snack = true
        })
      },
      updateOrder(o){
        let mythis = this
        this.$store.dispatch('updateOrder',o)
        .then(function(){
            mythis.snackt = "order updated"
            mythis.snack = true
        })
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
          this.$store.dispatch('uploadFiles',formData)
          .then(resp=>{
              self.busy = false
              self.uploadedfiles = self.uploadedfiles.concat(resp.data)
          })
          .catch(error=>{
              console.log(error)
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
