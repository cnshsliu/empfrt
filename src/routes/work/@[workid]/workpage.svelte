<script lang="ts">
	import * as api from '$lib/api';
	import { goto } from '$app/navigation';
	import Parser from '$lib/parser';
	import ProcessTrack from '$lib/ProcessTrack.svelte';
	import { Container, Row, Col, Icon } from 'sveltestrap';
	import { Form, FormGroup, Input, Label } from 'sveltestrap';
	import { Status } from '$lib/status';
	import { Button } from 'sveltestrap';
	import type { User, Work } from '$lib/types';
	export let work: Work;
	export let user: User;
	export let delegators;
	export let iframeMode: boolean;
	export let TimeTool;
	let printProcessTrack = true;
	let comment = '';
	$: is_doable =
		(work.doer === user.email ||
			(delegators && Array.isArray(delegators) && delegators.includes(work.doer))) &&
		work.status === 'ST_RUN';

	function _sendbackWork() {
		let payload = {
			wfid: work.wfid,
			workid: work.workid,
			doer: work.doer,
			comment: comment
		};
		payload.kvars = {};
		for (let i = 0; i < work.kvarsArr.length; i++) {
			payload.kvars[work.kvarsArr[i]['name']] = work.kvarsArr[i];
		}
		api.post('work/sendback', payload, user.sessionToken);
		goto(iframeMode ? '/work?iframe' : '/work');
	}
	function _revokeWork() {
		let payload = {
			wfid: work.wfid,
			workid: work.workid,
			comment: comment
		};
		api.post('work/revoke', payload, user.sessionToken);
		goto(iframeMode ? '/work?iframe' : '/work');
	}
	function showWorkitem(workid: string) {
		goto(iframeMode ? `/work/@${workid}?iframe` : '/work', { replaceState: true });
	}
	function gotoWorkflow(wfid: string) {
		goto(iframeMode ? `/workflow/@${wfid}?iframe` : `/workflow/@${wfid}`, { replaceState: false });
	}
	function _doneWork(user_choice = null) {
		let payload = {
			doer: work.doer,
			workid: work.workid,
			comment: comment
		};
		if (user_choice) {
			payload.route = user_choice;
		}
		payload.kvars = {};
		for (let i = 0; i < work.kvarsArr.length; i++) {
			payload.kvars[work.kvarsArr[i]['name']] = work.kvarsArr[i];
		}
		api.post('work/do', payload, user.sessionToken);
		goto(iframeMode ? '/work?iframe' : '/work');
	}
	import { onMount } from 'svelte';
	const setInstructionHeight = (height) => {
		document.getElementById('workInstruction').height = height;
	};
	onMount(async () => {});
</script>

{#if work && work.workid}
	<Container id={'workitem_' + work.workid} class="mt-3">
		<Form>
			<Container class="mt-3 kfk-highlight-2">
				<Row cols={{ lg: 3, md: 2, sm: 1 }}>
					<Col>
						<Icon name="vinyl" />&nbsp; Primary Business Object:
						<div class="kfk-kvar-value-display">
							<a href={work.wf.pbo} target="_blank">{work.wf.pbo}</a>
						</div>
					</Col>
				</Row>
			</Container>
			<Container class="mt-3 kfk-highlight-2">
				<Row>
					<Col>
						<span class="fw-bold fs-5">Starter:</span>
						<div class="fw-light">{work.wf.starter}</div>
					</Col>
					<Col>
						<span class="fw-bold fs-5">Status:</span>
						<div class="fw-light">{Status[work.status]}</div>
					</Col>
					<Col>
						<span class="fw-bold fs-5">Owner:</span>
						<div class="fw-light">{work.doer}</div>
					</Col>
					<Col>
						{#if work.doneat}
							<span class="fw-bold fs-5">Complete at:</span>
							<div class="fw-light">{work.doneat ? TimeTool.format(work.doneat, 'LLL') : ''}</div>
						{/if}
					</Col>
					<Col />
				</Row>
			</Container>
			<Container class="mt-3 kfk-highlight-2 fs-3">
				{@html Parser.base64ToCode(work.instruct)}
			</Container>
			<!--- div class="w-100">
				<iframe id="workInstruction" src="/work/instruct" title="YouTube video" width="100%" />
			</div -->
			{#if is_doable && work.kvarsArr.length > 0}
				<Container class="mt-3 kfk-highlight-2">
					Node Input:
					<Row cols="4">
						{#each work.kvarsArr as kvar, i}
							{#if kvar.break}
								<div class="w-100" />
							{/if}
							<Col>
								<FormGroup>
									<Label>{kvar.label}</Label>
									{#if kvar.type !== 'select'}
										<Input
											type={kvar.type}
											name={kvar.name}
											bind:value={work.kvarsArr[i].value}
											id={kvar.id}
											placeholder={kvar.placeholder}
										/>
									{:else}
										<Input
											type={kvar.type}
											name={kvar.name}
											id={kvar.id}
											bind:value={work.kvarsArr[i].value}
										>
											{#each kvar.options as option}
												<option>{option}</option>
											{/each}
										</Input>
									{/if}
								</FormGroup>
							</Col>
						{/each}
					</Row>
				</Container>
			{/if}
			{#if is_doable}
				<Container class="mt-3">
					<input type="hidden" name="workid" value={work.workid} />
					{work.doer === user.email ? '' : `Delegated by ${work.doer}`}
					<Input type="textarea" placeholder="Comment" bind:value={comment} />
					<Row cols="6" class="mt-2">
						{#if work.status === 'ST_RUN'}
							{#if work.options.length === 0}
								<Col>
									<Button
										class="w-100"
										color="primary"
										on:click={(e) => {
											e.preventDefault();
											_doneWork();
										}}
									>
										Done
									</Button>
								</Col>
							{/if}
							{#each work.options as aChoice}
								<Col>
									<Button
										class="w-100"
										on:click={(e) => {
											e.preventDefault();
											_doneWork(aChoice);
										}}
									>
										{aChoice}
									</Button>
								</Col>
							{/each}
						{/if}
						{#if work.returnable}
							<Col>
								<Button
									class="w-100"
									on:click={(e) => {
										e.preventDefault();
										_sendbackWork();
									}}
								>
									Sendback
								</Button>
							</Col>
						{:else if work.revocable}
							<Col>
								<Button
									class="w-100"
									on:click={(e) => {
										e.preventDefault();
										_revokeWork();
									}}
								>
									Revoke
								</Button>
							</Col>
						{/if}
					</Row>
				</Container>
			{/if}
		</Form>
		<Container class="mt-3 kfk-highlight-2">
			Workflow Data:
			<Row cols={{ lg: 3, md: 2, sm: 1 }}>
				{#each work.wf.kvarsArr as kvar}
					{#if kvar.break}
						<div class="w-100" />
					{/if}
					<Col>
						<div>{kvar.label}</div>
						<div class="kfk-kvar-value-display">{kvar.value}</div>
					</Col>
				{/each}
			</Row>
		</Container>
		<Container>
			{work.comment}
		</Container>
	</Container>
	<ProcessTrack
		bind:wf={work.wf}
		bind:wfid={work.wfid}
		bind:print={printProcessTrack}
		{TimeTool}
		{iframeMode}
	/>
{:else}
	Not found
{/if}
