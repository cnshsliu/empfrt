<script lang="ts">
	import type { Template } from '$lib/types';
	import { session } from '$app/stores';
	import TemplatePreview from './_TemplatePreview.svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	export let templates: Template[];
	export let mouseover_objid: string = '';
	function setMouseOverObjid(objid: string) {
		mouseover_objid = objid;
	}
	function setMouseFocus() {}
	export let deleteTemplate;
</script>

{#if templates.length === 0}
	<div class="article-preview">No templates are here... yet.</div>
{:else}
	<div>
		{#each templates as template (template._id)}
			<div
				class="container kfk_template_list_item"
				transition:scale|local={{ start: 0.7 }}
				animate:flip={{ duration: 200 }}
				on:focus={() => setMouseFocus()}
				on:mouseover={() => setMouseOverObjid(template.tplid)}
			>
				<TemplatePreview {template} {mouseover_objid} {deleteTemplate} />
			</div>
		{/each}
	</div>
{/if}
