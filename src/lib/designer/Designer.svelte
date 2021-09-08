<script lang="ts">
	import type {Template} from '$lib/types';
	import KFK from '$lib/designer/KFK';
	import { onMount } from 'svelte';
	export let template: Template;

	let description:string;
	let jqueryui;
	onMount(async () => {
		description = "This is my template";
		const module = await import('jquery-ui-dist/jquery-ui');
		jqueryui = module.default;
		console.log("onMounting....");
		KFK.init();
	});
</script>

<div id="S1">
	<div id="C1">
			<div id="C9"></div>
			<div id="containerbkg" class="grid1"></div>
			<div id="C3" v-on:focus="KFK.C3GotFocus" v-on:blur="KFK.C3Blur" v-on:mouseover="KFK.focusOnC3">
				Author: {template.author}
				{description}
			</div>
			<div id="selectingrect" class="selectingrect"></div>
	</div>
</div>
