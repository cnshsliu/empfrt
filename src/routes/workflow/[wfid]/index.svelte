<script context="module" lang="ts">
	export async function load({ url, params, fetch, session }) {
		let showComment = false;
		if (url.searchParams.has('showComment') && url.searchParams.get('showComment') == 'true') {
			console.log('showCOmmnent....');
			showComment = true;
		}
		let wfid = params.wfid;
		if (wfid && wfid.charAt(0) === '@') wfid = wfid.substring(1);
		const workflow = await api.post(
			'workflow/read',
			{ wfid: wfid, withdoc: false },
			session.user.sessionToken
		);
		if (workflow.error) {
			workflow.wftitle = 'Not Found';
		}

		try {
			return {
				props: {
					workflow: workflow,
					wfid: params.wfid,
					user: session.user,
					showComment: showComment
				}
			};
		} catch (e) {
			console.error(e);
			return {
				props: {
					workflow: {
						wftitle: 'Not Found'
					},
					wfid: params.wfid,
					user: session.user
				}
			};
		}
	}
</script>

<script lang="ts">
	import type { User, Template, Workflow, EmpResponse } from '$lib/types';
	import { _, locale } from '$lib/i18n';
	import WorkFile from '$lib/workfile.svelte';
	import Comments from '$lib/Comments.svelte';
	import { session } from '$app/stores';
	import ProcessTrack from '$lib/ProcessTrack.svelte';
	import ErrorNotify from '$lib/ErrorNotify.svelte';
	import { goto } from '$app/navigation';
	import { title } from '$lib/title';
	import { printing } from '$lib/Stores';
	import { filterStorage } from '$lib/empstores';
	import { onMount } from 'svelte';
	import * as api from '$lib/api';
	import { Container, Input, Row, Col, Nav, NavLink, Button } from 'sveltestrap';
	import { ClientPermControl } from '$lib/clientperm';
	export let workflow: Workflow;
	export let wfid: string;
	export let iframeMode = false;
	export let showComment = false;

	$title = workflow.wftitle;
	let theDesigner: any;
	let pointToOrigin = '';
	let comments = [];

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

	let logs = '';
	const refreshLog = async function () {
		logs = (await api.post(
			'/workflow/readlog',
			{ wfid: wfid },
			user.sessionToken
		)) as unknown as string;
	};
	onMount(async () => {
		$filterStorage.tplid = workflow.tplid;
		//$filterStorage.workTitlePattern = 'wf:' + wfid;
		if ($session.comment_wfid === wfid) {
			comments = $session.comments;
		} else {
			let cmtRes = await api.post('comment/workflow/load', { wfid: wfid }, user.sessionToken);
			if (cmtRes.error) {
				console.log(cmtRes.message);
				delete $session.comment_wfid;
				delete $session.comments;
			} else {
				comments = cmtRes as any;
				console.log(comments);
				//session.comment_wfid = theWork.wfid;
				//session.comments = theWork.comments;
			}
		}
	});
</script>

<svelte:head>
	<title>{workflow.wftitle} • Workflow</title>
</svelte:head>
{#if workflow.wftitle !== 'Not Found'}
	<Container class="mt-3 kfk-highlight-2 text-wrap text-break">
		<WorkFile title={$_('todo.pbo')} forWhat={'workflow'} {workflow} forKey="pbo" />
	</Container>
	{#if showComment && workflow.allowdiscuss}
		<div class="mt-2 ms-5 p-2" id="todo_comments">
			<span class="fs-3">{workflow.wftitle}</span>
			<Comments bind:comments bind:pointToOrigin />
		</div>
	{/if}
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
