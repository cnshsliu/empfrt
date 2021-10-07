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
					<a
						class="btn btn-sm"
						href={'#'}
						on:click|preventDefault={() => opWorkflow(workflow.wfid, 'pause')}
					>
						<NavLink
							class="kfk-link"
							on:click={() => {
								opWorkflow(
									workflow.wfid,
									workflow.status === 'ST_RUN'
										? 'pause'
										: workflow.status === 'ST_PAUSE'
										? 'resume'
										: 'unknown'
								);
							}}
						>
							<Icon
								name={workflow.status === 'ST_RUN'
									? 'pause-btn'
									: workflow.status === 'ST_PAUSE'
									? 'play-btn'
									: ''}
							/>
							{workflow.status === 'ST_RUN'
								? 'PAUSE'
								: workflow.status === 'ST_PAUSE'
								? 'RESUME'
								: ''}
						</NavLink>
					</a></Nav
				>
			</Col>
		</Row>
	</Container>
</div>
<svelte:component this={Designer} bind:this={theDesigner} {workflow} />
