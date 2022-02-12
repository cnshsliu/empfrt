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
		console.log(workflow);
		if (workflow.error) {
			workflow.wftitle = 'Not Found';
		}

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
	import type { User, Template, Workflow, EmpResponse } from '$lib/types';
	import { _ } from '$lib/i18n';
	import WorkFile from '$lib/workfile.svelte';
	import { session } from '$app/stores';
	import ProcessTrack from '$lib/ProcessTrack.svelte';
	import ErrorNotify from '$lib/ErrorNotify.svelte';
	import { goto } from '$app/navigation';
	import { title } from '$lib/title';
	import { printing } from '$lib/Stores';
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
	const onPrint = async function () {
		$printing = true;
		setTimeout(async () => {
			$printing = false;
		}, 3000);
	};
</script>

<svelte:head>
	<title>{workflow.wftitle} • Workflow</title>
</svelte:head>
{#if workflow.wftitle !== 'Not Found'}
	<Container class="mt-3 kfk-highlight-2 text-wrap text-break">
		<WorkFile title={$_('todo.pbo')} forWhat={'workflow'} {workflow} forKey="pbo" />
	</Container>
	<ProcessTrack {user} bind:wf={workflow} {wfid} {iframeMode} {onPrint} />
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
