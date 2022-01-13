<script lang="ts">
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	let tplid;
</script>

<svelte:head>
	<title>Metatocome Documents</title>
</svelte:head>
<iframe
	title="help"
	src="https://cnshsliu.github.io/mtcdocs/"
	frameBorder="0"
	style="width:100%; background: #FFFFFF;"
	height="100%"
	width="100%"
/>

<style>
	iframe {
		display: block; /* iframes are inline by default */
		background: #000;
		border: none; /* Reset default border */
		height: 100vh; /* Viewport-relative units */
		width: 100vw;
	}
</style>
