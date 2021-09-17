<script lang="ts">
	import type { Template } from '$lib/types';
	import { session } from '$app/stores';
	import TemplatePreview from './_TemplatePreview.svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	export let templates: Template[];
</script>

{#if templates.length === 0}
	<div class="article-preview">No templates are here... yet.</div>
{:else}
	<div>
		{#each templates as template (template._id)}
			<div class="todo" transition:scale|local={{ start: 0.7 }} animate:flip={{ duration: 200 }}>
				<TemplatePreview {template} />
			</div>
		{/each}
	</div>
{/if}
