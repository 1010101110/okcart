<template>
    <div :key="contact_view">
        <v-form ref="form">
            Send us an email if you need some help with ordering or have a question.
            <v-text-field v-model="email" :rules="emailRules" autocomplete="email" label="email address"></v-text-field>
            <v-text-field v-model="body" multi-line label="email body"></v-text-field>
            <v-btn v-if="!busy && !sent" class="primary" @click="sendEmail()">send</v-btn>
            <v-progress-circular v-else-if="busy" indeterminate color="primary"></v-progress-circular>
            <span v-else-if="sent">Email sent</span>
        </v-form>
    </div>
</template>

<script>
import store from './../store.js'

export default {
  name: 'Contact',
  data: ()=>{
      return {
          email:'',
          body:'',
          sent:false,
          busy:false,
          emailRules:[
            (v) => !!v || 'E-mail is required',
            (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
          ]
      }
  },
  methods:{
      sendEmail(){
          if(this.$refs.form.validate()){
            this.busy = true
            store.dispatch('sendEmail',{email:this.email,body:this.body}).then(ok=>{
                this.busy = false
                this.sent = ok
            })
          }
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
