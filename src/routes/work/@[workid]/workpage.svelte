<script lang="ts">
	import * as api from '$lib/api';
	import { goto } from '$app/navigation';
	import Parser from '$lib/parser';
	import CommentEntry from '$lib/CommentEntry.svelte';
	import ProcessTrack from '$lib/ProcessTrack.svelte';
	import { Container, Row, Col, Icon } from 'sveltestrap';
	import { onMount } from 'svelte';
	import { FormGroup, Input, Label, InputGroup, InputGroupText } from 'sveltestrap';
	import { Status } from '$lib/status';
	import { Button } from 'sveltestrap';
	import type { User, Work, oneArgFunc } from '$lib/types';
	export let work: Work;
	export let user: User;
	export let delegators: String[];
	export let iframeMode: boolean;
	export let TimeTool: any;
	let showAdhocForm = false;
	let printProcessTrack = true;
	let adhocTaskTitle = '';
	let adhocTaskDoer = '';
	let adhocTaskComment = '';
	let comment = '';
	import { getNotificationsContext } from 'svelte-notifications';
	const { addNotification } = getNotificationsContext();
	$: is_doable =
		(work.doer === user.email ||
			(delegators && Array.isArray(delegators) && delegators.includes(work.doer))) &&
		work.status === 'ST_RUN';

	function _sendbackWork() {
		let payload: any = {
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
		let payload: any = {
			wfid: work.wfid,
			workid: work.workid,
			comment: comment
		};
		api.post('work/revoke', payload, user.sessionToken);
		goto(iframeMode ? '/work?iframe' : '/work');
	}
	function _toggleAdhoc() {
		showAdhocForm = !showAdhocForm;
	}
	function setFadeMessage(message: string, type = 'warning', pos = 'bottom-right', time = 2000) {
		(addNotification as oneArgFunc)({
			text: message,
			position: pos,
			type: type,
			removeAfter: time
		});
	}
	const createAdhoc = async function () {
		console.log(adhocTaskTitle);
		console.log(adhocTaskDoer);
		console.log(adhocTaskComment);

		let res = await api.post(
			'work/adhoc',
			{
				wfid: work.wfid,
				workid: work.workid,
				title: adhocTaskTitle,
				doer: adhocTaskDoer,
				comment: adhocTaskComment
			},
			user.sessionToken
		);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
		} else {
			saveOneRecentUser(adhocTaskDoer);
			console.log(res);
		}
	};
	function _doneWork(user_choice = null) {
		let payload: any = {
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

	let recentUsers = [];
	onMount(async () => {
		if (localStorage) {
			recentUsers = JSON.parse(localStorage.getItem('recentUsers') ?? JSON.stringify([]));
		}
	});
	const saveOneRecentUser = function (user) {
		let tmp = recentUsers.indexOf(user);
		if (tmp > -1) {
			recentUsers.splice(tmp, 1);
		}
		recentUsers.unshift(user);
		if (recentUsers.length > 10) {
			recentUsers.splice(10);
		}
		localStorage.setItem('recentUsers', JSON.stringify(recentUsers));
		recentUsers = recentUsers;
	};
</script>

{#if work && work.workid}
	<Container id={'workitem_' + work.workid} class="mt-3">
		<form>
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
			{#if work.instruct}
				<div class="fs-4">Instruction:</div>
				<Container class="mt-3 kfk-highlight-2 fs-3">
					{@html Parser.base64ToCode(work.instruct)}
				</Container>
			{/if}
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
					<Row class="mt-2">
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
						<Col>
							<Button
								class="w-100"
								color="success"
								on:click={(e) => {
									e.preventDefault();
									_toggleAdhoc();
								}}
							>
								{showAdhocForm ? 'Cancel' : 'New Adhoc'}
							</Button>
						</Col>
					</Row>
					{#if showAdhocForm}
						<div class="fs-3">Add an Adhoc Task</div>
						<Row cols="1" class="mt-2 kfk-highlight-2">
							<Col class="my-1">
								<InputGroup>
									<InputGroupText>Task:</InputGroupText>
									<Input
										name="adhoc_task_title"
										bind:value={adhocTaskTitle}
										placeholder="What to do"
									/>
								</InputGroup>
							</Col>
							<Col>
								<InputGroup>
									<InputGroupText>By</InputGroupText>
									<Input
										name="adhoc_task_doer"
										bind:value={adhocTaskDoer}
										placeholder="Who should do it"
									/>
								</InputGroup>
							</Col>
							<Container class="mt-2">
								<span>Recent started:</span>
								{#each recentUsers as aUser}
									<Button
										class="mx-1 badge bg-info text-dark"
										on:click={(e) => {
											e.preventDefault();
											adhocTaskDoer = aUser;
										}}
									>
										{aUser}
									</Button>
								{/each}
							</Container>
							<Col class="my-1">
								<InputGroup>
									<InputGroupText>Note:</InputGroupText>
									<Input
										name="adhoc_task_comment"
										bind:value={adhocTaskComment}
										placeholder="Any notes to say"
									/>
								</InputGroup>
							</Col>
							<Col class="d-flex justify-content-end my-1">
								<Button
									color="primary"
									on:click={async (e) => {
										e.preventDefault();
										await createAdhoc();
									}}
								>
									Send it out
								</Button>
								<Button
									color="secondary"
									class="mx-1"
									on:click={async (e) => {
										e.preventDefault();
										showAdhocForm = false;
									}}
								>
									Cancel
								</Button>
							</Col>
						</Row>
					{/if}
				</Container>
			{/if}
		</form>
		{#if work.wf.kvarsArr.length > 0}
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
		{/if}
		<Container>
			{#if work.comment && work.comment.trim().length > 0}
				<CommentEntry bind:comment={work.comment} />
			{/if}
		</Container>
	</Container>
	<ProcessTrack
		{user}
		bind:wf={work.wf}
		bind:wfid={work.wfid}
		bind:workid={work.workid}
		bind:print={printProcessTrack}
		{TimeTool}
		{iframeMode}
	/>
{:else}
	Not found
{/if}
