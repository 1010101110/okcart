<template>
    <div :key="ct_view">
        <div v-if="cartIsEmpty">
            <h3 class="text-xs-center">your cart is empty</h3>
        </div>
        <div v-else>
            <v-stepper v-model="step">
                <v-stepper-header>
                    <v-stepper-step step="1" :complete="step > 1" editable>Items</v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step step="2" :complete="step > 2" editable>Address</v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step step="3" editable>Payment</v-stepper-step>
                </v-stepper-header>
                <v-stepper-content step="1">
                    <v-card horizontal class="ma-3" v-for="(item,index) in cart" v-bind:item="item" v-bind:index="index" v-bind:key="item._id">
                        <v-card-column class="grey lighten-4">
                            <v-card-row>
                                <v-spacer></v-spacer>
                                <v-card-text class="text-xs-right">
                                    <strong>{{item.name}}</strong>
                                    <div>
                                        {{item.price/100}}<br>
                                        <v-btn icon @click.native="addcartitem(item)"><v-icon>add</v-icon></v-btn>
                                        {{item.quantity}}
                                        <v-btn icon @click.native="removecartitem(item)"><v-icon>remove</v-icon></v-btn>
                                    </div>
                                </v-card-text>
                            </v-card-row>
                        </v-card-column>
                        <v-card-row :img="item.image[0]" height="125px"></v-card-row>
                    </v-card>
                    <v-card horizontal class="ma-3">
                        <v-card-column class="grey lighten-4">
                            <v-card-row>
                                <v-spacer></v-spacer>
                                <v-card-text class="text-xs-right">
                                    Subtotal: {{cartSubTotal}}<br>        
                                    Shipping: {{cartShipping}}<br>
                                    <strong>Total: {{total}}</strong>
                                </v-card-text>
                            </v-card-row>
                        </v-card-column>
                        <v-card-row height="125px" class="grey lighten-4"></v-card-row>
                    </v-card>
                    
                    <v-btn primary @click.native="step = 2" light>Continue</v-btn>
                </v-stepper-content>
                <v-stepper-content step="2">
                    <v-text-field type="email" v-model="email" error name="email" v-validate data-vv-name="email" data-vv-rules="required|email" autocomplete="email" label="email" single-line prepend-icon="email"></v-text-field>
                    <v-text-field type="text" v-model="name" name="name" v-validate data-vv-name="name" data-vv-rules="required" autocomplete="name" label="full name" single-line prepend-icon="person"></v-text-field>
                    <v-text-field type="text" v-model="street" name="street" v-validate data-vv-name="street" data-vv-rules="required" autocomplete="shipping address-line1" label="street" single-line prepend-icon="home"></v-text-field>
                    <v-text-field type="text" v-model="apt" autocomplete="shipping address-line2" label="apt/unit" single-line prepend-icon="home"></v-text-field>
                    <v-text-field type="text" v-model="city" name="city" v-validate data-vv-name="city" data-vv-rules="required" autocomplete="shipping address-level2" label="city" single-line prepend-icon="location_city"></v-text-field>
                    <v-text-field type="text" v-model="state" name="state" v-validate data-vv-name="state" data-vv-rules="required" autocomplete="shipping address-level1" label="state" single-line prepend-icon="landscape"></v-text-field>
                    <v-text-field type="text" v-model="country" name="country" v-validate data-vv-name="country" data-vv-rules="required" autocomplete="shipping country" label="country" single-line prepend-icon="public"></v-text-field>
                    <v-text-field type="text" v-model="zip" name="zip" v-validate data-vv-name="zip" data-vv-rules="required" autocomplete="shipping postal-code" label="zip" single-line prepend-icon="explore"></v-text-field>
                    <!--
                        per vuetify there will be a new field for forms(waiting for new component 6/2/2017)
                        autocomplete and validation is broken
                        errors.has('field')
                    -->
                    <v-btn primary @click.native="step = 3" light>Continue</v-btn>
                </v-stepper-content>
                <v-stepper-content step="3">
                    <div class="ccinput">
                        <label for="card-element">
                            Credit or debit card
                        </label>
                        <div id="card-element">
                            <!-- a Stripe Element will be inserted here. -->
                        </div>                            
                    </div>
                    <div class="ccinput">
                        <div id="card-errors" role="alert"></div>
                        <p class="form-errors" v-for="err in errors.all()">{{err}}</p>
                    </div>
                    <transition name="fade" mode="out-in">
                        <v-btn primary light @click.native="checkout()" v-if="!cartloading">Place Order</v-btn>
                        <v-progress-circular indeterminate primary v-bind:size="70" v-else></v-progress-circular>
                    </transition>
                </v-stepper-content>
            </v-stepper>
        </div>
    </div>
</template>

<script>
import store from './../store.js'

//stripe objects
var stripe = Stripe('pk_test_GhV0QqLp9vthn8RTrVlfDiF9');
var elements = stripe.elements();

//stripe credit card iframe
var card = elements.create('card',{
    hidePostalCode: true,
    style:{
        base:{
            fontSize: '16px'
        }
    }
});

//show stripe errors
card.on('change', (event)=>{
    var errorElement = document.querySelector('#card-errors');
    if(event.error){
        errorElement.textContent = event.error.message;
    }else{
        errorElement.textContent = "";
    }
});

export default {
  name: 'cart',
  data: function(){ 
        return {
            step:1,
            email:"",
            name:"",
            street:"",
            apt:"",
            city:"",
            state:"",
            zip:"",
            country:""
        }
    },
  mounted:()=>{    
    if(!store.getters.cartIsEmpty){
        // mount stripe iframe into the DOM
        card.mount('#card-element');
        //clear any old errors
        document.querySelector('#card-errors').textContent = "";
    }
  },
  computed:{
    cart: ()=>{
        return store.getters.cart;
    },
    cartIsEmpty: ()=>{
        return store.getters.cartIsEmpty;
    },
    cartSubTotal: ()=>{
        return store.getters.cartSubTotal;
    },
    cartloading: ()=>{
        return store.getters.loading;
    },
    emailval: ()=>{
        return errors.first('email');
    },
    total: ()=>{
        return store.getters.cartTotal;
    },
    cartShipping: ()=>{
        return store.getters.cartShipping;
    }
  },
  methods:{
    addcartitem(item){
        store.commit('additemtocart',item);
    },
    removecartitem(item){
        store.commit("removeitemfromcart",item);
    },
    deletecartitem(item){
        store.commit("deleteitemfromcart",item);
    },
    checkout(){
        //clear existing errors?
        this.errors.clear();

        //validate form (shipping tab)        
        this.$validator.validateAll().then(()=>{
            //validate card (payment tab)
            stripe.createToken(card).then((result)=>{
                if(result.error){
                    document.querySelector('#card-errors').textContent = result.error.message;
                }else{                    
                    //ok looks good, lets send to the server to create the charge
                    store.dispatch('checkout',{
                        token:result.token,
                        email:this.email,
                        address:{
                            name:this.name,
                            street:this.street,
                            apt:this.apt,
                            city:this.city,
                            state:this.state,
                            zip:this.zip,
                            country:this.country
                        }
                    });
                }
            })            
        }).catch(()=>{
            //should show errors reactively
            console.log('form failed validation')
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ccinput {
    width:100%;
    min-width: 300px;
    min-height: 48px;
    padding-top: 16px;
    margin: 4px 0 24px;
}
#card-errors {
    color: #eb1c26;
}
.form-errors {
    color: #eb1c26;
}
</style>
