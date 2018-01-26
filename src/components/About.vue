<template>
    <div :key="about_view" class="about">

	<v-container fluid grid-list-sm>
		<v-layout row wrap>
			<v-flex>
				<h1>About</h1>
				<p>put some stuff here!</p>
			</v-flex>
		</v-layout>
	</v-container>
    </div>
</template>

<script>
export default {
  name: 'About'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
