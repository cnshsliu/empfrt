<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import Counter from '$lib/Counter.svelte';
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	import { session } from '$app/stores';
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<div class="container">
	<pre>
      {JSON.stringify($session, null, 2)}
  </pre>
</div>

<style>
	.container {
		margin: 0 auto;
		max-width: 850px;
	}
	pre {
		background-color: #000000;
		color: #fff;
		border-radius: 0.4em;
		padding: 2em;
	}
</style>
