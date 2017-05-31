<template>
    <div :key="ct_view">
        <md-tabs class="md-transparent">
        <div v-if="cartIsEmpty">
            <md-tab md-label="Cart" md-icon="shopping_cart">
                <span class="md-title">Your Cart is Empty</span>
            </md-tab>
        </div>
        <div v-else>
            <md-tab md-label="Cart" md-icon="shopping_cart">
                <md-list>
                    <md-list-item v-for="(item,index) in cart" v-bind:item="item" v-bind:index="index" v-bind:key="item._id">
                        <md-avatar class="md-large">
                            <img :src="item.image" :alt="item.name">
                        </md-avatar>
                        <div class="md-list-text-container">
                            <span>
                                {{item.name}} $ {{ item.price / 100 }}
                            </span>
                            <span>                                            
                                <md-button class="md-icon-button md-dense" v-on:click.native="addcartitem(item)">
                                    <md-icon>add</md-icon>
                                </md-button>
                                <span class="qty">{{item.quantity}}</span>
                                <md-button class="md-icon-button md-dense" v-on:click.native="removecartitem(item)">
                                    <md-icon>remove</md-icon>
                                </md-button>
                            </span>
                        </div>
                        <md-button class="md-icon-button md-list-action" v-on:click.native="deletecartitem(item)"><md-icon>delete</md-icon></md-button>
                        <md-divider class="md-inset"></md-divider>
                    </md-list-item>
                    <md-list-item>
                        <span>Subtotal: {{cartSubTotal}}</span>
                    </md-list-item>
                </md-list>
            </md-tab>
            <md-tab md-label="Shipping" md-icon="local_shipping">
                <md-input-container :class="{'md-input-invalid': errors.has('email')}">
                    <md-icon>email</md-icon>
                    <label>Email</label>
                    <md-input type="email" v-model="email" name="email" v-validate data-vv-name="email" data-vv-rules="required|email" autocomplete="email"></md-input>
                </md-input-container>
                <md-input-container :class="{'md-input-invalid': errors.has('name')}">
                    <md-icon>person</md-icon>
                    <label>Name</label>
                    <md-input type="text" v-model="name" name="name" v-validate data-vv-name="name" data-vv-rules="required" autocomplete="name"></md-input>
                </md-input-container>
                <md-input-container :class="{'md-input-invalid': errors.has('street')}">
                    <md-icon>home</md-icon>
                    <label>Street</label>
                    <md-input type="text" v-model="street" name="street" v-validate data-vv-name="street" data-vv-rules="required" autocomplete="shipping address-line1"></md-input>
                </md-input-container>
                <md-input-container>
                    <md-icon>home</md-icon>
                    <label>Apt/Unit</label>
                    <md-input v-model="apt" type="text" autocomplete="shipping address-line2"></md-input>
                </md-input-container>
                <md-input-container :class="{'md-input-invalid': errors.has('city')}">
                    <md-icon>location_city</md-icon>
                    <label>City</label>
                    <md-input type="text" v-model="city" name="city" v-validate data-vv-name="city" data-vv-rules="required" autocomplete="shipping address-level2"></md-input>
                </md-input-container>
                <md-input-container :class="{'md-input-invalid': errors.has('state')}">
                    <md-icon>landscape</md-icon>
                    <label>State</label>
                    <md-input type="text" v-model="state" name="state" v-validate data-vv-name="state" data-vv-rules="required" autocomplete="shipping address-level1"></md-input>
                </md-input-container>
                <md-input-container :class="{'md-input-invalid': errors.has('zip')}">
                    <md-icon>casino</md-icon>
                    <label>Zip</label>
                    <md-input type="text" v-model="zip" name="zip" v-validate data-vv-name="zip" data-vv-rules="required" autocomplete="shipping postal-code"></md-input>
                </md-input-container>
            </md-tab>
            <md-tab md-label="Payment" md-icon="credit_card">
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
                <div class="ccinput">
                    <transition name="fade" mode="out-in">
                        <md-button v-if="!cartloading" class="md-primary md-raised"  v-on:click.native="checkout()">Pay {{cartSubTotal}}</md-button>
                        <md-spinner v-else md-indeterminate class="md-accent"></md-spinner>
                    </transition>
                </div>
            </md-tab>                    
        </div>
        </md-tabs>
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
            email:"",
            name:"",
            street:"",
            apt:"",
            city:"",
            state:"",
            zip:""
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
        return store.getters.cartloading;
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
                            street:this.street,
                            apt:this.apt,
                            city:this.city,
                            state:this.state,
                            zip:this.zip
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
.qty {
    display: inline-block;
    padding-top: 9px;
}
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
.md-tab {
    max-width: 800px;
}
</style>
