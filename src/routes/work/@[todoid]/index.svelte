<script context="module" lang="ts">
	import { post } from '$lib/utils';
	import { Button } from 'sveltestrap';
	export const ssr = false;
	let TimeTool = null;
	export async function load({ page, fetch, session }) {
		TimeTool = (await import('$lib/TimeTool')).default;
		let todoid = page.params.todoid;
		let iframeMode = false;
		if (page.query.has('iframe')) {
			iframeMode = true;
		}
		const res = await fetch(`/work/@${todoid}.json`);

		const theWork = await res.json();
		let delegators = [];
		try {
			let delegations = await post('/delegation/today');
			delegators = (delegations as unknown as any[]).map((x) => x.delegator);
			if (delegators.includes(session.user.email) === false) {
				delegators.push(session.user.email);
			}
		} catch (e) {
			console.error(e);
		}

		return {
			props: {
				todoid: todoid,
				work: theWork,
				iframeMode: iframeMode,
				user: session.user,
				delegators: delegators
			}
		};
	}
</script>

<script lang="ts">
	import { _, mtcDate } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import Confirm from '$lib/confirm.svelte';
	import * as api from '$lib/api';
	import type { User, Work } from '$lib/types';
	import { title } from '$lib/title';
	import { onMount } from 'svelte';
	import WorkPage from './workpage.svelte';
	import ErrorNotify from '$lib/ErrorNotify.svelte';
	import { StatusClass, StatusLabel } from '$lib/status';
	import { Container, Row, Col } from 'sveltestrap';
	export let work: Work;
	export let user: User;
	export let delegators: any[];
	export let todoid;

	let radioGroup;
	let theConfirm;

	let browser_locale = window.navigator.language;
	console.log(browser_locale);

	$title = work.title;

	export let iframeMode;

	onMount(() => {
		//console.log('work onMount', JSON.stringify(work, null, 2));
	});
</script>

{#if work && work.doer}
	<Container class="mt-2">
		<div class="d-flex">
			<div class="flex-shrink-0">
				<h3>
					{work.title}
					<sup>
						{work.nodeid === 'ADHOC' ? '/ adhoc' : ''}
						{#if work.rehearsal}
							/ <i class="bi-patch-check" /> Rehearsal
						{/if}
					</sup>
				</h3>
			</div>
			<div class="mx-3 align-self-center flex-grow-1">
				{TimeTool.fromNow(work.createdAt)}
			</div>
			{#if work.rehearsal}
				<div class="mx-3 align-self-center flex-grow-1">
					<Button
						class="btn-xs"
						on:click={async (e) => {
							e.preventDefault();
							console.log('restart then destroy', work.wfid);
							theConfirm.title = $_('confirm.title.areyousure');
							theConfirm.body = $_('confirm.body.restartthendestroy');
							theConfirm.buttons = [$_('confirm.button.confirm')];
							theConfirm.callbacks = [
								async () => {
									api
										.post('workflow/restart/then/destroy', { wfid: work.wfid }, user.sessionToken)
										.then((res) => {
											goto('/work');
										});
								}
							];
							theConfirm.toggle();
						}}
					>
						{$_('todo.restartrehearsal')}
					</Button>
				</div>
			{/if}
			{#if work.rehearsal || (work.wf.starter === user.email && work.from_nodeid === 'start')}
				<div class="mx-3 align-self-center flex-grow-1">
					<Button
						class="btn-xs"
						on:click={async (e) => {
							e.preventDefault();
							theConfirm.title = $_('confirm.title.areyousure');
							theConfirm.body = $_('confirm.body.cancelworkflowatfirststep');
							theConfirm.buttons = [$_('confirm.button.confirm')];
							theConfirm.callbacks = [
								async () => {
									api
										.post('workflow/op', { wfid: work.wfid, op: 'destroy' }, user.sessionToken)
										.then((res) => {
											goto('/work');
										});
								}
							];
							theConfirm.toggle();
						}}
					>
						{$_('todo.cancelworkflowatfirststep')}
					</Button>
				</div>
			{/if}
		</div>
	</Container>
	<Container class="mt-3 kfk-highlight-2">
		<Row>
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
				<span class="fw-bold fs-5">
					{$_('todo.owner')}
				</span>
				<div class="fw-light">{work.doer}</div>
			</Col>
			<Col>
				{#if work.doneat}
					<span class="fw-bold fs-5">
						{$_('todo.doneat')}
					</span>

					<div class="fw-light">{mtcDate(work.doneat)}</div>
				{/if}
			</Col>
			<Col />
		</Row>
		<WorkPage {work} {user} {iframeMode} {delegators} />
	</Container>
{:else}
	<ErrorNotify
		title="Error Found"
		subtitle="Work does not exist"
		info={`Work ${todoid} does not exist`}
		btnTitle="Back"
		callback={() => {
			goto('/work');
		}}
	/>
{/if}
<Confirm bind:this={theConfirm} />
