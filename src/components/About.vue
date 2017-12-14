<template>
    <div :key="about_view">
        <!-- put your about here - START -->

        <img src="/assets/default.jpg">
        <p>
            Here at my store we like to provide you with stuff.<br>
            We put it up for sale online<br>
            you go onto our site and buy it!!
        </p>

        <!-- put your about here -  END -->
    </div>
</template>

<script>
import store from './../store.js'

export default {
  name: 'About'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
