<script context="module" lang="ts">
	export const ssr = false;
	export async function load({ page, fetch, session }) {
		const wfid = page.params.wfid;
		const workflow = await api.post(
			'workflow/read',
			{ wfid: wfid, withdoc: true },
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
	import type { User, Template, Workflow, EmpResponse } from '$lib/types';
	import { session } from '$app/stores';
	import AniIcon from '$lib/AniIcon.svelte';
	import { filterStorage } from '$lib/empstores';
	import Notifier from '$lib/notifier.svelte';
	import ErrorNotify from '$lib/ErrorNotify.svelte';
	import { goto } from '$app/navigation';
	import { title } from '$lib/title';
	import { onMount } from 'svelte';
	import * as api from '$lib/api';
	import { InputGroup, Button, Row, Col, Nav, NavLink, InputGroupText } from 'sveltestrap';
	import { Icon } from 'sveltestrap';
	import { ClientPermControl } from '$lib/clientperm';
	export let workflow: Workflow;
	export let wfid: string;

	let theNotifier;
	let showRenameForm = false;

	$title = workflow.wftitle;
	let Designer: any;
	let theDesigner: any;
	onMount(async () => {
		const module = await import('$lib/designer/Designer.svelte');
		Designer = module.default;
	});

	export let user: User;
	const opWorkflow = (wfid: string, op: string): void => {
		if (op === 'works') {
			$filterStorage.workTitlePattern = 'wf:' + wfid;
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
					<AniIcon icon="list-check" ani="aniShake" />
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
							<AniIcon icon="pause-btn" ani="aniShake" />
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
							<AniIcon icon="arrow-counterclockwise" ani="aniShake" />
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
							<AniIcon icon="slash-square" ani="aniShake" />
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
							<AniIcon icon="caret-right-square" ani="aniShake" />
							{'RESTART'}
						</NavLink>
					{/if}
					<NavLink
						class="kfk-link"
						on:click={(e) => {
							e.preventDefault();
							showRenameForm = !showRenameForm;
						}}
					>
						<AniIcon icon="pen" ani="aniShake" />
						{'Rename'}
					</NavLink>
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
	{#if showRenameForm}
		<Row class="mt-1 d-flex justify-content-center">
			<InputGroup>
				<InputGroupText>Rename it to :</InputGroupText>
				<input bind:value={workflow.wftitle} class="form-control" />
				<Button
					on:click={async (e) => {
						e.preventDefault();
						try {
							let res = await api.post(
								'workflow/set/title',
								{
									wfid: workflow.wfid,
									wftitle: workflow.wftitle
								},
								user.sessionToken
							);
							if (res.error) {
								theNotifier.setFadeMessage(res.message, 'warning');
							} else {
								theNotifier.setFadeMessage('Success', 'success');
							}
						} catch (err) {
							theNotifier.setFadeMessage(err.message, 'error');
						}
					}}
					>Rename it
				</Button>
			</InputGroup>
		</Row>
	{/if}
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
<Notifier bind:this={theNotifier} />
