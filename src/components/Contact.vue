<template>
    <div key="contact_view">
        <transition name="fade" mode="out-in">
            <v-form ref="form" v-if="!sent">
                Send us an email using the below form
                <v-text-field v-model="email" :rules="emailRules" autocomplete="email" label="email address"></v-text-field>
                <v-text-field v-model="body" multi-line label="email body"></v-text-field>
                <v-btn v-if="!busy" class="primary" @click="sendEmail()">send</v-btn>
                <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
            </v-form>
            <span v-else> <v-icon color="green">check</v-icon> Email sent</span>
        </transition>
        <v-snackbar top color="red" v-model="err" dark>
            Error sending mail <v-icon color="white">error</v-icon>
        </v-snackbar>
    </div>
</template>

<script>
export default {
    name: 'Contact',
    mounted:function(){
        document.title = 'Contact'
    },
    data: ()=>{
      return {
          email:'',
          body:'',
          sent:false,
          busy:false,
          emailRules:[
            (v) => !!v || 'E-mail is required',
            (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
          ],
          err:false
      }
  },
  methods:{
      sendEmail(){
          if(this.$refs.form.validate()){
            this.busy = true
            this.$store.dispatch('sendEmail',{email:this.email,body:this.body}).then(resp=>{
                this.busy = false
                if(resp.status === 200){
                    this.sent = true
                }else{
                    this.err = true
                }                
            })
          }
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
