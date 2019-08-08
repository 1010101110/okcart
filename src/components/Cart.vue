<template>
    <div style="max-width:1200px;" key="ct_view">
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
                    <v-stepper-step step="3" @click.native="step = 3" editable>Payment</v-stepper-step>
                </v-stepper-header>
                <v-stepper-content step="1">
                    <v-card class="ma-3 pa-1 elevation-3" v-for="item in cart" v-bind:item="item" v-bind:key="item._id">
                        <v-layout row>
                            <v-flex>
                                <v-img height="120px" width="120px" :src="item.images[0]"></v-img>
                            </v-flex>

                            <v-flex>
                                <strong>{{item.name}}</strong>
                                <div>
                                    <div v-if="item.selectable_fields" v-for="v in item.selectable_fields" :key="v">
                                        {{v.selected.name}}
                                    </div>
                                </div>
                                <div>
                                    {{$store.getters.formatPrice(item.price)}}<br>
                                    <v-btn icon @click.native="addcartitem(item)"><v-icon>add</v-icon></v-btn>
                                    {{item.quantity}}
                                    <v-btn icon @click.native="removecartitem(item)"><v-icon>remove</v-icon></v-btn>
                                </div>
                            </v-flex>
                            <v-spacer></v-spacer>
                        </v-layout>
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
                        <v-text-field type="text" v-model="street" name="street" :rules="reqRules" required autocomplete="shipping address-line1" label="street" single-line prepend-icon="home"></v-text-field>
                        <v-text-field type="text" v-model="apt" autocomplete="shipping address-line2" label="apt/unit" single-line prepend-icon="home"></v-text-field>
                        <v-text-field type="text" v-model="city" name="city" :rules="reqRules" required autocomplete="shipping address-level2" label="city" single-line prepend-icon="location_city"></v-text-field>
                        <v-text-field type="text" v-model="state" name="state" :rules="reqRules" required autocomplete="shipping address-level1" label="state" single-line prepend-icon="landscape"></v-text-field>
                        <v-text-field type="text" v-model="country" name="country" :rules="reqRules" required autocomplete="shipping country" label="country" single-line prepend-icon="public"></v-text-field>
                        <v-text-field type="text" v-model="zip" name="zip" :rules="reqRules" required autocomplete="shipping postal-code" label="zip" single-line prepend-icon="explore"></v-text-field>
                    </v-form>
                    <v-btn color="primary" @click.native="step = 3">Continue</v-btn>
                </v-stepper-content>
                <v-stepper-content step="3">
                    <v-card flat class="mb-3">
                        <v-card-text>
                            Subtotal: {{cartSubTotal}}<br>
                            Shipping: {{cartShipping}}<br>
                            <strong>Total: {{total}}</strong>
                        </v-card-text>
                    </v-card>

                    <div id="dropin-container"></div>

                    <div id="card-errors">
                        <p v-for="err in errors" :key="err.id">{{err.text}}</p>
                    </div>

                    <v-textarea name="comment" label="Order Comments or Special Instructions" multi-line v-model="comment"></v-textarea>

                    <transition name="fade" mode="out-in">
                        <v-btn large color="accent" @click.native="checkout()" v-if="!cartloading">Place Order</v-btn>
                        <v-progress-circular indeterminate primary :size="50" v-else></v-progress-circular>
                    </transition>

                    <br><br>

                    <a target="_blank" href="/policy">Refund,Return,Privacy Policy</a>
                </v-stepper-content>
            </v-stepper>
        </div>
        <v-snackbar bottom color="red darken-2" v-model="addsnack">
            Error placing order
        </v-snackbar>
    </div>
</template>

<script>
import client from './../../config-c'
import dropin from 'braintree-web-drop-in'

export default {
  name: 'cart',
    mounted:function(){
        document.title = 'Cart'
    },
  data: () => {
        return {
            dropinst:null,
            step:1,
            email:"",
            name:"",
            street:"",
            apt:"",
            city:"",
            state:"",
            zip:"",
            country:"",
            comment:"",
            emailRules:[
                (v) => !!v || 'E-mail is required',
                (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
            ],
            reqRules:[
                (v) => !!v || 'Field is required',
            ],
            errors:[],
            addsnack:false
        }
    },
  computed:{
    cart(){
        return this.$store.getters.cart;
    },
    cartIsEmpty(){
        return this.$store.getters.cartIsEmpty;
    },
    cartSubTotal(){
        return this.$store.getters.formatPrice(this.$store.getters.cartSubTotal);
    },
    cartloading(){
        return this.$store.getters.loading;
    },
    total(){
        return this.$store.getters.formatPrice(this.$store.getters.cartTotal);
    },
    cartShipping(){
        return this.$store.getters.formatPrice(this.$store.getters.cartShipping);
    }
  },
  watch:{
      step:function (val) {
          //when navigated to payment page, init the payment form
          if(val === 3){
            //init braintree
            if(this.$store.getters.cartTotal > 0 && !this.dropinst){
                dropin.create({
                    authorization: client.brainAuth,
                    selector: '#dropin-container',
                    paypal:{
                        flow: 'checkout',
                        amount: this.$store.getters.cartTotal,
                        currency: client.currency
                    },
                    googlePay: {
                        merchantId: client.googleMerchantId,
                        transactionInfo:{
                            totalPriceStatus: 'FINAL',
                            totalPrice: this.$store.getters.cartTotal,
                            currencyCode: 'USD'
                        }
                    }
                }, (err,instance)=>{
                    if(err){
                        this.errors.push({id:"dropin",text:"Error in payment form",step:3})
                        console.log(err)
                    } else {
                        this.dropinst = instance
                    }
                })
            }
          }
      }
  },
  methods:{
    addcartitem(item){
        this.$store.commit('additemtocart',item);
    },
    removecartitem(item){
        this.$store.commit("removeitemfromcart",item);
    },
    deletecartitem(item){
        this.$store.commit("deleteitemfromcart",item);
    },
    checkout(){
        //reset errors
        this.errors = []

        //vaidate address form
        if(this.$refs.form.validate()){
            //if the total is 0$ don't do payment request
            if(this.$store.getters.cartTotal == 0){
                this.$store.dispatch('checkout',{
                    nonce:null,
                    email:this.email,
                    comment:this.comment,
                    address:{
                        name:this.name,
                        street:this.street,
                        apt:this.apt,
                        city:this.city,
                        state:this.state,
                        zip:this.zip,
                        country:this.country
                    },
                    router:this.$router
                })
            } else {
                //braintree request
                this.dropinst.requestPaymentMethod((err,payload)=>{
                    if(err){
                        this.errors.push({id:"payment",text:"Error in payment",step:3})
                        this.addsnack = true
                        console.log(err)
                    }else{
                        this.$store.dispatch('checkout',{
                            nonce:payload.nonce,
                            email:this.email,
                            comment:this.comment,
                            address:{
                                name:this.name,
                                street:this.street,
                                apt:this.apt,
                                city:this.city,
                                state:this.state,
                                zip:this.zip,
                                country:this.country
                            },
                            router:this.$router
                        })
                    }
                })
            }
        }else{
            this.errors.push({id:"address",text:"Error in address",step:2})
            this.addsnack = true
        }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#card-errors {
    color: #eb1c26;
}
.form-errors {
    color: #eb1c26;
}
[data-braintree-id="methods-label"] {
  visibility: hidden !important;
}
</style>
