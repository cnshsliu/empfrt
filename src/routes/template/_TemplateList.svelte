<script lang="ts">
	import type { Template } from '$lib/types';
	import { session } from '$app/stores';
	import TemplatePreview from './_TemplatePreview.svelte';

	export let templates: Template[];
</script>

{#if templates.length === 0}
	<div class="article-preview">No templates are here... yet.</div>
{:else}
	<div>
		{#each templates as template (template._id)}
			<TemplatePreview {template} />
		{/each}
	</div>
{/if}
