<template>
    <div key="policy_view" class="about">
			<v-container fluid grid-list-sm>
				<v-layout row wrap>
					<v-flex>
						<h1> Privacy Notice </h1>
						This privacy notice applies solely to information collected by {{client.storeName}}. It will notify you of the following:<br><br>

						What personally identifiable information is collected from you through the website, how it is used and with whom it may be shared.<br>
						What choices are available to you regarding the use of your data.<br>
						The security procedures in place to protect the misuse of your information.<br>
						How you can correct any inaccuracies in the information.<br>

						<h3> Information Collection, Use, and Sharing </h3>
						We are the sole owners of the information collected on this site. We only have access to/collect information that you voluntarily give us via email or other direct contact from you. We will not sell or rent this information to anyone.

						We will use your information to respond to you, regarding the reason you contacted us. We will not share your information with any third party outside of our organization, other than as necessary to fulfill your request, e.g. to ship an order.

						Unless you ask us not to, we may contact you via email in the future to tell you about specials, new products or services, or changes to this privacy policy.

						<h3> Your Access to and Control Over Information </h3>
						You may opt out of any future contacts from us at any time. You can do the following at any time by contacting us via the email address or phone number given on our website:

						See what data we have about you, if any.
						Change/correct any data we have about you.
						Have us delete any data we have about you.
						Express any concern you have about our use of your data.

						<h3> Orders </h3>
						We request information from you on our order form. To buy from us, you must provide contact information (like name and shipping address) and financial information (like credit card number, expiration date). This information is used for billing purposes and to fill your orders. If we have trouble processing an order, we'll use this information to contact you.

						<h3> Security </h3>
						We take precautions to protect your information. When you submit sensitive information via the website, your information is protected both online and offline.

						Wherever we collect sensitive information (such as credit card data), that information is encrypted and transmitted to us in a secure way. You can verify this by looking for a lock icon in the address bar and looking for "https" at the beginning of the address of the Web page.

						While we use encryption to protect sensitive information transmitted online, we also protect your information offline. Only employees who need the information to perform a specific job (for example, billing or customer service) are granted access to personally identifiable information. The computers/servers in which we store personally identifiable information are kept in a secure environment.<br><br>

						If you feel that we are not abiding by this privacy policy, you should contact us immediately via email {{client.storeURL + '/contact'}}.


						<h1>Return and Refund policy</h1>
						As all of our products are perishable we do not accept returns.<br>

						Refunds may be accepted within 30 days of purchase. Once we have determined the validity of your refund via email, pictures, and shipping information we will refund the transaction back to your original payment method.<br><br>

						If you have any questions about the policy or are ready to open an investigation contact us via email {{client.storeURL + '/contact'}}.
					</v-flex>
				</v-layout>
			</v-container>
    </div>
</template>

<script>
import client from './../../config-c'

export default {
	name: 'Policy',
	client: client
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
