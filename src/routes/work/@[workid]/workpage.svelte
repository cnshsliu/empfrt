<script lang="ts">
	import * as api from '$lib/api';
	import { goto } from '$app/navigation';
	import Parser from '$lib/parser';
	import CommentEntry from '$lib/CommentEntry.svelte';
	import ProcessTrack from '$lib/ProcessTrack.svelte';
	import { Container, Row, Col, Icon } from 'sveltestrap';
	import { onMount } from 'svelte';
	import { FormGroup, Input, Label, InputGroup, InputGroupText } from 'sveltestrap';
	import { StatusClass, StatusLabel } from '$lib/lang';
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
	let creatingAdhoc = false;
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
		creatingAdhoc = true;

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
		setTimeout(async () => {
			creatingAdhoc = false;
		}, 4000);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
		} else {
			saveOneRecentUser(adhocTaskDoer);
			console.log(res);
			setFadeMessage('Adhoc Task created successfully');
		}
	};
	async function _doneWork(user_choice = null) {
		let payload: any = {
			doer: work.doer,
			workid: work.workid,
			wfid: work.wfid,
			comment: comment
		};
		if (user_choice) {
			payload.route = user_choice;
		}
		payload.kvars = {};
		for (let i = 0; i < work.kvarsArr.length; i++) {
			payload.kvars[work.kvarsArr[i]['name']] = work.kvarsArr[i];
		}
		await api.post('work/do', payload, user.sessionToken);
		//goto(iframeMode ? '/work?iframe' : '/work');
		await _refreshWork(work.workid);
	}
	async function _refreshWork(workid) {
		const res = await fetch(`/work/@${workid}.json`);
		work = await res.json();
		comment = '';
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
				<Icon name="vinyl" />&nbsp; Primary Business Object:
				{#if work.wf.pbo}
					<div class="kfk-kvar-value-display">
						<a href={work.wf.pbo} target="_blank"
							>{work.wf.pbo}&nbsp;
							<Icon name="box-arrow-up-right" />
						</a>
					</div>
				{/if}
			</Container>
			<Container class="mt-3 kfk-highlight-2">
				<Row>
					<Col>
						<span class="fw-bold fs-5">Starter:</span>
						<div class="fw-light">{work.wf.starter}</div>
					</Col>
					<Col>
						<span class="fw-bold fs-5">Status:</span>
						<div class={'fw-light ' + StatusClass(work.status)}>{StatusLabel(work.status)}</div>
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
							{#if kvar.breakrow}
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
					<Input type="textarea" placeholder="Comments: " bind:value={comment} />
					<Row class="mt-2">
						{#if work.status === 'ST_RUN'}
							{#if work.options.length === 0}
								<Col>
									<Button
										class="w-100"
										color="primary"
										on:click={async (e) => {
											e.preventDefault();
											await _doneWork();
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
										on:click={async (e) => {
											e.preventDefault();
											await _doneWork(aChoice);
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
						<Row cols="1" class="mt-2 kfk-highlight-2">
							<div class="fs-3">Add an Adhoc Task</div>
							<Col class="my-1">
								<div class="form-floating">
									<Input
										name="adhoc_task_title"
										id="input-adhoc-title"
										class="form-control"
										bind:value={adhocTaskTitle}
										placeholder="What to do"
									/>
									<label for="input-adhoc-title">Adhoc Task Title</label>
								</div>
							</Col>
							<Col>
								<div class="form-floating">
									<Input
										name="adhoc_task_doer"
										id="input-adhoc-doer"
										class="form-control"
										bind:value={adhocTaskDoer}
										placeholder="Who should do it"
									/>
									<label for="input-adhoc-doer">Who should do it (in PDS format)?</label>
								</div>
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
								<div class="form-floating">
									<Input
										name="adhoc_task_comment"
										id="input-adhoc-comment"
										class="form-control"
										bind:value={adhocTaskComment}
										placeholder="Any extra comments"
									/>
									<label for="input-adhoc-comment">Any extra comments?</label>
								</div>
							</Col>
							<Col class="d-flex justify-content-end my-1">
								<Button
									color="primary"
									disabled={creatingAdhoc}
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
				<Row cols={{ lg: 3, md: 2, xs: 1 }}>
					{#each work.wf.kvarsArr as kvar}
						{#if kvar.breakrow}
							<div class="w-100" />
						{/if}
						<Col>
							<span class="fs-5">{kvar.label}: </span>
							<span class="kfk-kvar-value-display">{kvar.value}</span>
						</Col>
					{/each}
				</Row>
			</Container>
		{/if}
		{#if work.comment}
			<Container>
				<CommentEntry bind:comment={work.comment} />
			</Container>
		{/if}
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
