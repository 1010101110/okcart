<template>
    <div v-if="order" :key="or_view">
        <h3>Order Details</h3>
        <div id="order">
        <v-layout row wrap>
            <v-flex xs12 sm8>
                Order# {{order._id}}<br>
                Ordered On: {{new Date(order.created*1000).toDateString()}}
            </v-flex>
            <v-flex sm4 class="hidden-xs-only">
                <v-btn icon v-on:click.native="window.print()"><v-icon>print</v-icon></v-btn>
            </v-flex>
            <v-flex xs12 sm4>
                <h6>Payment</h6>
                <p>                        
                    {{order.source.brand}} {{order.source.last4}}
                </p>
            </v-flex>
            <v-flex xs12 sm4>
                <h6>Shipping</h6>
                <p>                        
                    {{order.address.name}}<br>
                    {{order.address.street}} {{order.address.apt}}<br>
                    {{order.address.city}}, {{order.address.state}} {{order.address.zip}}
                </p>
            </v-flex>
            <v-flex xs12 sm4>
                <h6>Summary</h6>
                <p>
                    Shipping: free<br>
                    Total: {{total}}
                </p>
            </v-flex>
            <v-flex xs12>
                <v-card horizontal class="ma-2" v-for="(item,index) in order.cart" v-bind:item="item" v-bind:index="index" v-bind:key="item._id">
                    <v-card-column class="grey lighten-4">
                        <v-card-row>
                            <v-spacer></v-spacer>
                            <v-card-text class="text-xs-right">
                                <strong>{{item.name}}</strong>
                                <div>
                                    {{item.quantity}}x {{item.price/100}}                                    
                                </div>
                            </v-card-text>
                        </v-card-row>
                    </v-card-column>
                    <v-card-row :img="item.image[0]" height="125px"></v-card-row>
                </v-card>
            </v-flex>
        </v-layout>
        </div>
</template>

<script>
import store from './../store.js'

export default {
    name: 'Order',
    created () {
        //get order data
        store.dispatch('fetchOrder',store.state.route.params.id);
    },
    computed:{
        order:()=>{
            return store.getters.order;
        },
        total:()=>{
            return store.getters.orderTotal;
        }
    }
}
</script>

<style scoped>
#order{
    max-width: 1000px;
}
</style>