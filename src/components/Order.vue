<template>
    <div v-if="order.payment.transaction" key="or_view">
        <div id="order">
        <v-layout id="oc" row wrap>
            <v-flex xs12>
                <div class="headline">Order# {{order._id}}</div>
            </v-flex>
            <v-flex xs12>
                <p class="px-3">{{new Date(order.payment.transaction.createdAt).toLocaleString()}}</p>
            </v-flex>
            <v-flex xs12>
                <h3>Status</h3>
                <p class="px-3">{{order.status}} <span v-if="order.trackingco"> {{order.trackingco +  ' ' + order.trackingnum}} </span></p>
            </v-flex>
            <v-flex xs4>
                <h3>Payment</h3>
                <p>
                    <img :src="paymentimg(order.payment.transaction)"> <br>
                    {{paymentdetail(order.payment.transaction)}}
                </p>
            </v-flex>
            <v-flex xs4>
                <h3>Address</h3>
                <p>
                    {{order.address.name}}<br>
                    {{order.address.street}}<br>
                    {{order.address.apt}}<br v-if="order.address.apt">
                    {{order.address.city}}, {{order.address.state}} {{order.address.zip}}<br>
                    {{order.address.country}}
                </p>
            </v-flex>
            <v-flex xs4>
                <h3>Summary</h3>
                <p>
                    Shipping: {{$store.getters.formatPrice(order.shiptotal)}}<br>
                    Total: {{$store.getters.formatPrice(order.total)}}
                </p>
            </v-flex>
            <v-flex xs12>
                <h3>Cart</h3>
            </v-flex>
            <v-flex xs12>
                <v-card flat class="ma-3" v-for="item in order.cart" v-bind:item="item" v-bind:key="item._id">
                    <v-layout row>
                        <v-flex xs8>
                            <strong>{{item.name}}</strong>
                            <div>
                                <div v-if="item.selectable_fields" v-for="v in item.selectable_fields" :key="v">
                                    {{v.selected.name}}
                                </div>
                            </div>
                            <div>
                                {{$store.getters.formatPrice(item.price)}}<br>
                                Qty: {{item.quantity}}
                            </div>
                        </v-flex>
                        <v-flex xs4>
                            <img :src="item.images[0]" class="orderimg">
                        </v-flex>
                    </v-layout>
                </v-card>
            </v-flex>
            <v-flex xs12>
                <h3>Customer Comment</h3>
                <div class="mytext"> {{order.comment}} </div>
            </v-flex>
        </v-layout>
        </div>
        <a @click="print" class="v-btn theme--dark primary">Print<v-icon class="ml-1">print</v-icon> </a>
    </div>
</template>

<script>
export default {
    name: 'Order',
    asyncData ({ store,route }) {
        //get order data
        return store.dispatch('fetchOrder', route.params.id);
    },
    computed:{
        order(){
            return this.$store.getters.order;
        }
    },
    methods:{
        print(){
            const prtHtml = document.getElementById('order').innerHTML;

            // Open the print window
            const WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');

            WinPrint.document.write(`<!DOCTYPE html>
            <html>
            <head>
                <link href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' rel="stylesheet">
                <link href="https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.min.css" rel="stylesheet">
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
                <style>
                    #el{
                        margin: 25px;
                    }
                    .orderimg{
                        display: none;
                    }
                <\/style>
            </head>
            <body>
                <div id="el">
                    <v-app>
                        ${prtHtml}
                    </v-app>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/vue"><\/script>
                <script src="https://cdn.jsdelivr.net/npm/vuetify"><\/script>
                <script>
                    new Vue({
                        el: '#app',
                        mounted: function(){
                            window.print()
                            window.close()
                        }
                    })
                <\/script>
            </body>
            </html>`);

            WinPrint.document.close();
            WinPrint.focus();
        },
        paymentdetail(transaction){
            let ret = ""

            switch(transaction.paymentInstrumentType){
                case "credit_card":
                    ret = transaction.creditCard.last4
                    break
                case "paypal_account":
                    ret = transaction.paypalAccount.payerEmail
                    break
                case "android_pay_card":
                    ret - transaction.androidPayCard.sourceCardLast4
                    break
            }

            return ret
        },
        paymentimg(transaction){
            let ret = ""

            switch(transaction.paymentInstrumentType){
                case "credit_card":
                    ret = transaction.creditCard.imageUrl
                    break
                case "paypal_account":
                    ret = transaction.paypalAccount.imageUrl
                    break
                case "android_pay_card":
                    ret = transaction.androidPayCard.imageUrl
                    break
            }

            return ret
        }
    }
}
</script>

<style scoped>
    #oc{
        max-width: 800px;
    }

    .orderimg{
        height: 100px;
    }

    .mytext{
        white-space: pre-wrap;
    }
</style>