<script context="module">
	import { browser, dev } from '$app/env';

	// we don't need any JS on this page, though we'll load
	// it in dev so that we get hot module replacement...
	export const hydrate = dev;

	// ...but if the client-side router is already loaded
	// (i.e. we came here from elsewhere in the app), use it
	export const router = browser;

	// since there's no dynamic data here, we can prerender
	// it so that it gets served as a static asset in prod
	export const prerender = true;
</script>

<ul class="list-group list-group-flush">
	<li class="list-group-item">An item</li>
	<li class="list-group-item">A second item</li>
	<li class="list-group-item">A third item</li>
	<li class="list-group-item">A fourth item</li>
	<li class="list-group-item">And a fifth one</li>
</ul>

<style>
	.content {
		width: 100%;
	}
</style>
