<script context="module" lang="ts">
	export const ssr = false;
	export async function load({ page, fetch, session }) {
		const wfid = page.params.wfid;
		const jsonUrl = `/workflow/@${wfid}.json`;
		const res = await fetch(jsonUrl);

		return {
			props: {
				workflow: await res.json(),
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import type { User, Template, Workflow } from '$lib/types';
	import jQuery from 'jquery';
	import { goto } from '$app/navigation';
	import { title } from '$lib/title';
	import { onMount } from 'svelte';
	import * as api from '$lib/api';
	import { Container, Row, Col, Nav, NavLink } from 'sveltestrap';
	import { Icon, Button, Modal, ModalBody, ModalFooter, ModalHeader, Styles } from 'sveltestrap';
	import { enhance } from '$lib/form';
	export let workflow: Workflow;
	export let tpl_mode: string;

	const jq = jQuery;

	$title = workflow.wftitle;
	let Designer: any;
	let theDesigner: any;
	onMount(async () => {
		console.log('import Designer...');
		const module = await import('$lib/designer/Designer.svelte');
		Designer = module.default;
	});

	export let errmsg = '';
	export let user: User;
	const opWorkflow = (wfid: string, op: string): void => {
		setTimeout(async () => {
			let ret = await api.post('workflow/op', { wfid, op }, user.sessionToken);
			workflow.status = ret.status; //eslint-disable-line
		}, 1);
	};
</script>

<Styles />

<svelte:head>
	<title>{workflow.wftitle} • Workflow</title>
</svelte:head>
<div id="designer_topMenu">
	<Container>
		<Row class="mt-1 d-flex justify-content-center">
			<Col class="d-flex justify-content-center">
				<Nav>
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
							<Icon name="play-btn" />
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
							<Icon name="pause-btn" />
							{'STOP'}
						</NavLink>
					{/if}
					{#if ['ST_RUN', 'ST_PAUSE', 'ST_STOP'].indexOf(workflow.status) > -1}
						<NavLink
							class="kfk-link"
							on:click={() => {
								opWorkflow(workflow.wfid, 'restart');
								goto('/workflow');
							}}
						>
							<Icon name="pause-btn" />
							{'RESTART'}
						</NavLink>
					{/if}
				</Nav>
			</Col>
		</Row>
	</Container>
</div>
<svelte:component this={Designer} bind:this={theDesigner} {workflow} />
