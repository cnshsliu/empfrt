<script lang="ts">
	import type { Workflow } from '$lib/types';
	import { session } from '$app/stores';
	import WorkflowPreview from './_WorkflowPreview.svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	export let theTplid: string;
	export let workflows: Workflow[];
	export let mouseover_objid: string = '';
	function setMouseOverObjid(objid: string) {
		mouseover_objid = objid;
	}
	function setMouseFocus() {}
	export let opWorkflow: { (wfid: string, op: string): void };
</script>

{#if workflows.length === 0}
	{#if theTplid && theTplid !== 'null'}
		<div class="article-preview">No workflows for template {theTplid} yet.</div>
	{:else}
		<div class="article-preview">No workflows are here... yet. {theTplid}</div>
	{/if}
{:else}
	<div>
		{#each workflows as workflow (workflow._id)}
			<div
				class="container kfk_workflow_list_item"
				transition:scale|local={{ start: 0.7 }}
				animate:flip={{ duration: 200 }}
				on:focus={() => setMouseFocus()}
				on:mouseover={() => setMouseOverObjid(workflow.wfid)}
			>
				<WorkflowPreview {workflow} {mouseover_objid} {opWorkflow} />
			</div>
		{/each}
	</div>
{/if}
