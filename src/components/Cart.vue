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
                    <v-card class="ma-3" v-for="item in cart" v-bind:item="item" v-bind:key="item._id">
                        <v-container>
                            <v-layout row>
                                <v-flex xs8>
                                    <strong>{{item.name}}</strong>
                                    <div>
                                        {{item.price/100}}<br>
                                        <v-btn icon @click.native="addcartitem(item)"><v-icon>add</v-icon></v-btn>
                                        {{item.quantity}}
                                        <v-btn icon @click.native="removecartitem(item)"><v-icon>remove</v-icon></v-btn>
                                    </div>
                                </v-flex>
                                <v-flex xs4>
                                    <v-card-media height="100%" :src="item.images[0]" ></v-card-media>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card>
                    <v-card flat class="ma-3">
                        <v-card-text>
                            Subtotal: {{cartSubTotal}}<br>        
                            Shipping: {{cartShipping}}<br>
                            <strong>Total: {{total}}</strong>
                        </v-card-text>
                    </v-card>
                    
                    <v-btn color="primary" @click.native="step = 2">Continue</v-btn>
                </v-stepper-content>
                <v-stepper-content step="2">
                    <v-form ref="form">
                        <v-text-field type="email" v-model="email" name="email" :rules="emailRules" required autocomplete="email" label="email" single-line prepend-icon="email"></v-text-field>
                        <v-text-field type="text" v-model="name" name="name" :rules="reqRules" required autocomplete="name" label="full name" single-line prepend-icon="person"></v-text-field>
                        <v-text-field type="text" v-model="street" name="street" :rules="reqRules":rules="reqRules" required autocomplete="shipping address-line1" label="street" single-line prepend-icon="home"></v-text-field>
                        <v-text-field type="text" v-model="apt" autocomplete="shipping address-line2" label="apt/unit" single-line prepend-icon="home"></v-text-field>
                        <v-text-field type="text" v-model="city" name="city" :rules="reqRules" required autocomplete="shipping address-level2" label="city" single-line prepend-icon="location_city"></v-text-field>
                        <v-text-field type="text" v-model="state" name="state" :rules="reqRules" required autocomplete="shipping address-level1" label="state" single-line prepend-icon="landscape"></v-text-field>
                        <v-text-field type="text" v-model="country" name="country" :rules="reqRules" required autocomplete="shipping country" label="country" single-line prepend-icon="public"></v-text-field>
                        <v-text-field type="text" v-model="zip" name="zip" :rules="reqRules" required autocomplete="shipping postal-code" label="zip" single-line prepend-icon="explore"></v-text-field>
                    </v-form>
                    <v-btn color="primary" @click.native="step = 3">Continue</v-btn>
                </v-stepper-content>
                <v-stepper-content step="3">
                    <p>Order Total: {{total}}</p>
                    <div class="ccinput">
                        <label for="card-element">
                            Credit or debit card
                        </label>
                        <div id="card-element">
                            <!-- a Stripe Element will be inserted here. -->
                        </div>
                        <!-- errors -->
                        <div class="mt-2" id="card-errors" role="alert"></div>
                        <p class="form-errors" v-for="err in errors" :key="err.id">
                            <span @click="step=err.step">{{err.text}}</span>
                        </p>
                        <!-- payment logo -->
                        <img class="mt-2" src="/assets/stripe.png">                            
                        <img class="mt-2" src="/assets/ssl.png">
                    </div>
                    <transition name="fade" mode="out-in">
                        <v-btn color="primary" @click.native="checkout()" v-if="!cartloading">Place Order</v-btn>
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
            country:"",
            emailRules:[
                (v) => !!v || 'E-mail is required',
                (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
            ],
            reqRules:[
                (v) => !!v || 'Field is required',
            ],
            errors:[]
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
        this.errors = []

        if(this.$refs.form.validate()){
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
        }else{
            this.errors.push({id:"vuetifyform",text:"Error in address",step:2})
        }
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
