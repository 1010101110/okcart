<template>
    <div v-if="order" :key="pv_view">
        <h1>Thanks for your order!</h1>
        <p>A confirmation email has been sent for your records.</p>
        <div>
            <md-list>
                <md-list-item>
                    <span>Stripe Payment referrence: {{order.id}}</span>
                </md-list-item>
                <md-list-item>
                    <span>Payment Time: {{new Date(order.created*1000).toLocaleString()}}</span>
                </md-list-item>
            </md-list>
        </div>
    </div>
</template>

<script>
import store from './../store.js'

export default {
    name: 'Order',
    created () {
        //reset products (this is kinda unrelated to order, but easiest place to put it)
        store.dispatch('fetchProducts');
        //get order data
        store.dispatch('fetchOrder',store.state.route.params.id);
    },
    computed:{
        order:()=>{
            return store.getters.order;
        }
    }
}
</script>

<style scoped>

</style>