<template>
    <div v-if="order.charge" :key="or_view">
        <h2>Order Details</h2>
        <div id="order">
        <v-layout row wrap>
            <v-flex xs12>
                Order# {{order._id}}<br>
                Ordered On: {{new Date(order.charge.created*1000).toLocaleString()}}<br>
                Status: {{order.status}}
            </v-flex>
            <v-flex xs12 sm4>
                <h3>Payment</h3>
                <p>                        
                    {{order.charge.source.brand}} {{order.charge.source.last4}}
                </p>
            </v-flex>
            <v-flex xs12 sm4>
                <h3>Shipping</h3>
                <p>                        
                    {{order.address.name}}<br>
                    {{order.address.street}} {{order.address.apt}}<br>
                    {{order.address.city}}, {{order.address.state}} {{order.address.zip}}
                </p>
            </v-flex>
            <v-flex xs12 sm4>
                <h3>Summary</h3>
                <p>
                    Shipping: {{$store.getters.formatPrice(order.shiptotal)}}<br>
                    Total: {{$store.getters.formatPrice(order.total)}}
                </p>
            </v-flex>
            <v-flex xs12>
                <h3>Cart</h3>
                <v-card class="ma-3" v-for="item in order.cart" v-bind:item="item" v-bind:key="item._id">
                    <v-container>
                        <v-layout row>
                            <v-flex xs8>
                                <strong>{{item.quantity}}x {{item.name}}</strong>
                                <div>
                                    {{$store.getters.formatPrice(item.price)}}<br>                                    
                                </div>
                            </v-flex>
                            <v-flex xs4>
                                <img :src="item.images[0]" height="100px">                                
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card>
            </v-flex>
        </v-layout>
        </div>
        <v-btn color="primary" dark v-on:click.native="print()">Print <v-icon>print</v-icon></v-btn>
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
        }
    },
    methods:{
        print:()=>{
            var prtContent = document.getElementById("order");
            var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
            WinPrint.document.write('<html><head><title></title>');
            WinPrint.document.write( "<link rel=\"stylesheet\" href=\"https://unpkg.com/vuetify/dist/vuetify.min.css\" type=\"text/css\" media=\"print\"/>" );
            WinPrint.document.write('</head><body >');
            WinPrint.document.write(prtContent.innerHTML);
            WinPrint.document.write('</body></html>');
            WinPrint.document.close();
            WinPrint.focus();
            WinPrint.print();
            WinPrint.close();            
        }
    }
}
</script>

<style scoped>
#order{
    max-width: 1000px;
}
</style>