<script context="module" lang="ts">
	export const ssr = false;
	export async function load({ page, fetch, session }) {
		const wfid = page.params.wfid;
		const res = await fetch(`/workflow/@${wfid}.json`);

		try {
			return {
				props: {
					workflow: await res.json(),
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
	import { filterStore } from '$lib/empstores';
	import ErrorNotify from '$lib/ErrorNotify.svelte';
	import { goto } from '$app/navigation';
	import { title } from '$lib/title';
	import { onMount } from 'svelte';
	import * as api from '$lib/api';
	import { Row, Col, Nav, NavLink } from 'sveltestrap';
	import { Icon } from 'sveltestrap';
	import { ClientPermControl } from '$lib/clientperm';
	export let workflow: Workflow;
	export let wfid: string;

	$title = workflow.wftitle;
	let Designer: any;
	let theDesigner: any;
	onMount(async () => {
		console.log('import Designer...');
		const module = await import('$lib/designer/Designer.svelte');
		Designer = module.default;
	});

	export let user: User;
	const opWorkflow = (wfid: string, op: string): void => {
		if (op === 'works') {
			$filterStore.workTitlePattern = 'wf:' + wfid;
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
</script>

<svelte:head>
	<title>{workflow.wftitle} • Workflow</title>
</svelte:head>
<div id="designer-topMenu">
	<Row class="mt-1 d-flex justify-content-center">
		<Col class="d-flex justify-content-center">
			<Nav>
				<NavLink
					class="kfk-link"
					on:click={() => {
						opWorkflow(workflow.wfid, 'works');
					}}
				>
					<Icon name="list-check" />
					{'Works'}
				</NavLink>
				{#if ClientPermControl(user.perms, user.email, 'workflow', workflow, 'update')}
					{#if workflow.status === 'ST_RUN'}
						<NavLink
							class="kfk-link"
							on:click={() => {
								opWorkflow(workflow.wfid, 'pause');
							}}
						>
							<Icon name="pause-btn" />
							{'PAUSE'}
						</NavLink>
					{/if}
					{#if workflow.status === 'ST_PAUSE'}
						<NavLink
							class="kfk-link"
							on:click={() => {
								opWorkflow(workflow.wfid, 'resume');
							}}
						>
							<Icon name="arrow-counterclockwise" />
							{'RESUME'}
						</NavLink>
					{/if}
					{#if ['ST_RUN', 'ST_PAUSE'].indexOf(workflow.status) > -1}
						<NavLink
							class="kfk-link"
							on:click={() => {
								opWorkflow(workflow.wfid, 'stop');
							}}
						>
							<Icon name="slash-square" />
							{'STOP'}
						</NavLink>
					{/if}
					{#if ['ST_RUN', 'ST_PAUSE', 'ST_STOP'].indexOf(workflow.status) > -1}
						<NavLink
							class="kfk-link"
							on:click={(e) => {
								e.preventDefault();
								opWorkflow(workflow.wfid, 'restart');
								goto('/workflow');
							}}
						>
							<Icon name="caret-right-square" />
							{'RESTART'}
						</NavLink>
					{/if}
				{:else}
					{#if workflow.status === 'ST_RUN'}
						<NavLink class="kfk-link" disabled>
							<Icon name="pause-btn" />
							{'PAUSE'}
						</NavLink>
					{/if}
					{#if workflow.status === 'ST_PAUSE'}
						<NavLink class="kfk-link" disabled>
							<Icon name="arrow-counterclockwise" />
							{'RESUME'}
						</NavLink>
					{/if}
					{#if ['ST_RUN', 'ST_PAUSE'].indexOf(workflow.status) > -1}
						<NavLink class="kfk-link" disabled>
							<Icon name="slash-square" />
							{'STOP'}
						</NavLink>
					{/if}
					{#if ['ST_RUN', 'ST_PAUSE', 'ST_STOP'].indexOf(workflow.status) > -1}
						<NavLink class="kfk-link" disabled>
							<Icon name="caret-right-square" />
							{'RESTART'}
						</NavLink>
					{/if}
				{/if}
			</Nav>
		</Col>
	</Row>
</div>
{#if workflow.wftitle !== 'Not Found'}
	<svelte:component this={Designer} bind:this={theDesigner} {workflow} />
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
