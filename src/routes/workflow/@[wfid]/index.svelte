<script context="module" lang="ts">
	export const ssr = false;
	let TimeTool = null;
	export async function load({ page, fetch, session }) {
		TimeTool = (await import('$lib/TimeTool')).default;
		const wfid = page.params.wfid;
		const workflow = await api.post(
			'workflow/read',
			{ wfid: wfid, withdoc: false },
			session.user.sessionToken
		);

		try {
			return {
				props: {
					workflow: workflow,
					wfid: page.params.wfid,
					user: session.user
				}
			};
		} catch (e) {
			console.error(e);
			return {
				props: {
					workflow: {
						wftitle: 'Not Found'
					},
					wfid: page.params.wfid,
					user: session.user
				}
			};
		}
	}
</script>

<script lang="ts">
	import type { User, Template, Workflow } from '$lib/types';
	import { session } from '$app/stores';
	import ProcessTrack from '$lib/ProcessTrack.svelte';
	import ErrorNotify from '$lib/ErrorNotify.svelte';
	import { goto } from '$app/navigation';
	import { title } from '$lib/title';
	import { filterStorage } from '$lib/empstores';
	import { onMount } from 'svelte';
	import * as api from '$lib/api';
	import { Container, Row, Col, Nav, NavLink, Button } from 'sveltestrap';
	import { ClientPermControl } from '$lib/clientperm';
	export let workflow: Workflow;
	export let wfid: string;
	export let iframeMode = false;

	$title = workflow.wftitle;
	let Designer: any;
	let theDesigner: any;
	onMount(async () => {
		console.log('import Designer...');
		const module = await import('$lib/designer/Designer.svelte');
		Designer = module.default;

		$filterStorage.tplid = workflow.tplid;
		$filterStorage.workTitlePattern = 'wf:' + wfid;
	});

	export let user: User;
	const opWorkflow = (wfid: string, op: string): void => {
		if (op === 'works') {
			user = $session.user;
			user.extra = { input_search: 'wf:' + wfid };
			$session.user = user;
			goto('/work');
		}
		setTimeout(async () => {
			let ret: Workflow = (await api.post(
				'workflow/op',
				{ wfid, op },
				user.sessionToken
			)) as Workflow;
			workflow.status = ret.status;
		}, 1);
	};
	let hasPrintButton = true;
</script>

<svelte:head>
	<title>{workflow.wftitle} • Workflow</title>
</svelte:head>
{#if workflow.wftitle !== 'Not Found'}
	<ProcessTrack
		{user}
		bind:wf={workflow}
		{wfid}
		{TimeTool}
		bind:print={hasPrintButton}
		{iframeMode}
	/>
{:else}
	<ErrorNotify
		title="Error Found"
		subtitle="Workflow not found"
		info={`Workflow ${wfid} does not exist`}
		btnTitle="Back"
		callback={() => {
			goto('/workflow');
		}}
	/>
{/if}

<style>
</style>
