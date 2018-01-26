<template>
    <div v-if="order.charge" :key="or_view">
        <div id="order">
        <v-layout row wrap>
            <v-flex xs12>
                <h3>Order# {{order._id}}</h3>
                Ordered On: {{new Date(order.charge.created*1000).toLocaleString()}}<br>
                Status: {{order.status}}
            </v-flex>
            <v-flex xx4>
                <h3>Payment</h3>
                <p>                        
                    {{order.charge.source.brand}} {{order.charge.source.last4}}
                </p>
            </v-flex>
            <v-flex xs4>
                <h3>Shipping</h3>
                <p>                        
                    {{order.address.name}}<br>
                    {{order.address.street}} {{order.address.apt}}<br>
                    {{order.address.city}}, {{order.address.state}} {{order.address.zip}}
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
        </v-layout>
        </div>
        <v-btn color="primary" dark v-on:click.native="print()">Print <v-icon>print</v-icon></v-btn>
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
            window.print()        
        }
    }
}
</script>

<style scoped>
#order{
    max-width: 800px;
}

.orderimg{
    height: 100px;
}

@media print {
    #order{
        background-color: white;
        height: 100%;
        width: 100%;
        position: fixed;
        top: 0;
        left: 0;
        margin: 0;
        padding: 15px;
        font-size: 14px;
        line-height: 18px;
        z-index: 2147483647;
    }

    .orderimg{
        display: none;
    }
}
</style>