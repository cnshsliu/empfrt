<script context="module" lang="ts">
	import { post } from '$lib/utils';
	import * as api from '$lib/api';
	import { Button } from 'sveltestrap';
	let TimeTool = null;
	export async function load({ params, url, fetch, session }) {
		TimeTool = (await import('$lib/TimeTool')).default;
		let searchParams = url.searchPaarms;
		let todoid = params.todoid;
		if (todoid && todoid.charAt(0) === '@') todoid = todoid.substring(1);
		let anchor = url.searchParams.get('anchor');
		const res = await fetch(`/work/${todoid}.json`);

		const theWork = await res.json();
		let delegators = [];
		if (theWork && theWork.wf) {
			theWork.wf.history.map((x) => {
				x.isCurrent = x.workid === theWork.workid;
				x.classname = 'col mt-3 kfk-highlight-track' + (x.isCurrent ? '-current' : '');
				return x;
			});
			theWork.routingOptions.sort();
			try {
				let delegations = await api.post('/delegation/to/me/today', {}, session.user.sessionToken);
				delegators = (delegations as unknown as any[]).map((x) => x.delegator);
				if (delegators.includes(session.user.email) === false) {
					delegators.push(session.user.email);
				}
			} catch (e) {
				console.error(e);
			}
			//console.log('Load workflow comments...');
			if (session.comment_wfid === theWork.wfid) {
				//console.log('use session comments');
				theWork.comments = session.comments;
			} else {
				let cmtRes = await api.post(
					'comment/workflow/load',
					{ wfid: theWork.wfid },
					session.user.sessionToken,
				);
				if (cmtRes.error) {
					console.log(cmtRes.message);
					delete session.comment_wfid;
					delete session.comments;
				} else {
					theWork.comments = cmtRes as any;
					//session.comment_wfid = theWork.wfid;
					//session.comments = theWork.comments;
				}
			}
		}

		return {
			props: {
				todoid: todoid,
				work: theWork,
				user: session.user,
				delegators: delegators,
				anchor: anchor,
			},
		};
	}
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import { _, mtcDate } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import Confirm from '$lib/confirm.svelte';
	import Avatar from '$lib/display/Avatar.svelte';
	import type { User, Work } from '$lib/types';
	import { title } from '$lib/title';
	import { onMount, onDestroy } from 'svelte';
	import {
		printing,
		notifyMessage,
		worklistChangeFlag,
		delayLoadOnMount,
		forcePreDelete,
		mtcConfirm,
		mtcConfirmReset,
	} from '$lib/Stores';
	import { version } from '$lib/empstores';
	import WorkPage from './workpage.svelte';
	import ErrorNotify from '$lib/ErrorNotify.svelte';
	import { StatusClass, StatusLabel } from '$lib/status';
	import { Container, Row, Col } from 'sveltestrap';
	export let work: Work;
	export let user: User;
	export let delegators: any[];
	export let todoid;

	export let anchor;

	let radioGroup;

	$title = work.title;

	onMount(async () => {
		let findAnchorInterval = null;
		let findAnchorCount = 0;
		if (anchor) {
			findAnchorInterval = setInterval(() => {
				let elem = document.querySelector(`#${anchor}`);
				if (elem) {
					elem.scrollIntoView(true);
					clearInterval(findAnchorInterval);
				} else {
					findAnchorCount++;
					if (findAnchorCount >= 5) {
						let elem = document.querySelector(`todo_comments`);
						if (elem) elem.scrollIntoView(true);
						clearInterval(findAnchorInterval);
					}
				}
			}, 1000);
		}
		let needReload = false;
		if ($version) {
			if (work && work.version && $version !== work.version) {
				console.log('You need to reload1', 'version:', $version, 'work.version', work.version);
				needReload = true;
			}
		} else {
			console.log('You need to reload2');
			needReload = true;
		}
		if (needReload) {
			setTimeout(async () => {
				$mtcConfirm = {
					title: $_('confirm.title.needReload') + 'hello',
					body: $_('confirm.body.needReload'),
					buttons: [$_('confirm.button.confirm')],
					callbacks: [
						async () => {
							$version = work.version;
							window.location.reload();
							mtcConfirmReset();
						},
					],
				};
			}, 1000);
		}
	});
	onDestroy(async () => {
		//console.log('Delete comment buffer');
		delete $session.comment_wfid;
		delete $session.comments;
	});
</script>

{#if work && work.doer}
	<Container class={'mt-2 ' + ($printing ? 'nodisplay' : '')}>
		<div class="d-flex row">
			<div class="col flex-shrink-0" id="todo_title_area">
				<h3>
					{work.title}
					<sup>
						{work.nodeid === 'ADHOC' ? '/ adhoc' : ''}
						{#if work.rehearsal}
							/ <i class="bi-patch-check" />
							Rehearsal
						{/if}
					</sup>
				</h3>
				<div class="mx-3 align-self-center flex-grow-1">
					{TimeTool.fromNow(work.createdAt)}
				</div>
			</div>
			{#if work.rehearsal}
				<div class="col-auto mx-3 align-self-center">
					<Button
						class="btn-xs"
						on:click={async (e) => {
							e.preventDefault();
							$mtcConfirm = {
								title: $_('confirm.title.areyousure'),
								body: $_('confirm.body.restartthendestroy'),
								buttons: [$_('confirm.button.confirm')],
								callbacks: [
									async () => {
										api
											.post('workflow/restart/then/destroy', { wfid: work.wfid }, user.sessionToken)
											.then((res) => {
												api.removeCacheByPath('work/search');
												$worklistChangeFlag++;
												$forcePreDelete = true;
												$delayLoadOnMount = 3000;
												goto('/work');
											});
										mtcConfirmReset();
									},
								],
							};
						}}>
						{$_('todo.restartrehearsal')}
					</Button>
				</div>
			{/if}
			{#if work.rehearsal || (work.wf.starter === user.email && work.from_nodeid === 'start')}
				<div class="col-auto mx-3 align-self-center">
					<Button
						class="btn-xs"
						on:click={async (e) => {
							e.preventDefault();
							$mtcConfirm = {
								title: $_('confirm.title.areyousure'),
								body: $_('confirm.body.cancelworkflowatfirststep'),
								buttons: [$_('confirm.button.confirm')],
								callbacks: [
									async () => {
										api
											.post('workflow/op', { wfid: work.wfid, op: 'destroy' }, user.sessionToken)
											.then((res) => {
												api.removeCacheByPath('work/search');
												$worklistChangeFlag++;
												$forcePreDelete = true;
												$delayLoadOnMount = 3000;
												goto('/work');
											});
										mtcConfirmReset();
									},
								],
							};
						}}>
						{$_('todo.cancelworkflowatfirststep')}
					</Button>
				</div>
			{/if}
		</div>
	</Container>
	<div class="m-3 p-3 kfk-highlight-2">
		<Row cols={{ lg: 4, md: 2, xs: 1 }} class={$printing ? 'nodisplay' : ''}>
			<!--Col>
						<span class="fw-bold fs-5">Starter:</span>
						<div class="fw-light">{work.wf.starter}</div>
					</Col-->
			<Col>
				<span class="fw-bold fs-5">
					{$_('todo.status')}
				</span>
				<div class={'fw-light ' + StatusClass(work.status)}>{StatusLabel(work.status)}</div>
			</Col>
			<Col>
				<Row>
					<Col class="col-auto">
						<span class="fw-bold fs-5">
							{$_('todo.owner')}
						</span>
						<div class="fw-light">{work.doerCN}</div>
					</Col><Col>
						<Avatar email={work.doer} uname={work.doerCN} style={'avatar50-round25'} />
					</Col>
				</Row>
			</Col>
			<Col>
				{#if work.doneat}
					<span class="fw-bold fs-5">
						{$_('todo.doneat')}
					</span>
					<div class="fw-light">{mtcDate(work.doneat)}</div>
				{/if}
			</Col>
			<Col>
				{#if work.wf && work.wf.kvars && work.wf.kvars.starterCN}
					<Row>
						<Col class="col-auto">
							<span class="fw-bold fs-5">
								{$_('todo.StarterCN')}
							</span>
							<div class="fw-light">{work.wf.kvars.starterCN.value}</div>
						</Col><Col>
							<Avatar
								email={work.wf.starter}
								uname={work.wf.kvars.starterCN.value}
								style={'avatar50-round25'} />
						</Col>
					</Row>
				{/if}
			</Col>
		</Row>
	</div>
	<WorkPage
		{work}
		{delegators}
		on:statusChanged={(e) => {
			work.status = e.detail.status;
			work.doneat = e.detail.doneat;
		}} />
{:else}
	<ErrorNotify
		title="Error Found"
		subtitle="Work does not exist"
		info={`Work ${todoid} does not exist`}
		btnTitle="Back"
		callback={() => {
			goto('/work');
		}} />
{/if}
