<script lang="ts">
	import { _, mtcDate } from '$lib/i18n';
	import * as api from '$lib/api';
	import { goto } from '$app/navigation';
	import Parser from '$lib/parser';
	import CommentEntry from '$lib/CommentEntry.svelte';
	import ProcessTrack from '$lib/ProcessTrack.svelte';
	import TransferWork from './_transfer.svelte';
	import { Container, Row, Col, Icon } from 'sveltestrap';
	import { onMount } from 'svelte';
	import { FormGroup, Input, Label, InputGroup, InputGroupText } from 'sveltestrap';
	import { StatusClass, StatusLabel } from '$lib/status';
	import { Button } from 'sveltestrap';
	import { debugOption } from '$lib/empstores';
	import List from '$lib/input/List.svelte';
	import type { User, Work, oneArgFunc } from '$lib/types';
	export let work: Work;
	export let user: User;
	export let delegators: String[];
	export let iframeMode: boolean;
	let showAdhocForm = false;
	let adhocTaskTitle = '';
	let adhocTaskDoer = '';
	let adhocTaskComment = '';
	let comment = '';
	let whichtoChange = '';
	let serverListKey = '';
	let creatingAdhoc = false;
	let adhocTaskDoerConfirmed = false;
	let checkingTimer = null;
	let checkingAdhocResult = [];
	import { getNotificationsContext } from 'svelte-notifications';
	const { addNotification } = getNotificationsContext();

	const onPrint = async function () {};
	let isDebug = $debugOption === 'yes';

	function _sendbackWork() {
		if (checkRequired() === false) return;
		let payload: any = {
			wfid: work.wfid,
			todoid: work.todoid,
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
		if (checkRequired() === false) return;
		let payload: any = {
			wfid: work.wfid,
			todoid: work.todoid,
			comment: comment
		};
		api.post('work/revoke', payload, user.sessionToken);
		goto(iframeMode ? '/work?iframe' : '/work');
	}
	function _toggleAdhoc() {
		adhocTaskDoerConfirmed = false;
		checkingAdhocResult = [];
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
	const checkAdhocTaskDoer = async function (evt, atonce = false) {
		if (adhocTaskDoer.trim().length === 0) return;
		creatingAdhoc = true;

		if (atonce || checkingTimer) {
			clearTimeout(checkingTimer);
			checkingTimer = null;
		}
		checkingTimer = setTimeout(
			async () => {
				checkingAdhocResult = (await api.post(
					'explain/pds',
					{
						wfid: work.wfid,
						pds: adhocTaskDoer
						//teamid:  will use workflow's teamid automatically
						//email: will use workflow's starter automatically
					},
					user.sessionToken
				)) as unknown as any[];
				checkingTimer = null;
			},
			atonce ? 1 : 1000
		);
	};

	const createAdhoc = async function () {
		creatingAdhoc = true;

		let res = await api.post(
			'work/adhoc',
			{
				wfid: work.wfid,
				todoid: work.todoid,
				title: adhocTaskTitle,
				doer: adhocTaskDoer,
				rehearsal: work.rehearsal,
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
			setFadeMessage('Adhoc Task created successfully');
		}
	};
	function checkRequired() {
		let errMsg = '';
		for (let i = 0; i < work.kvarsArr.length; i++) {
			if (work.kvarsArr[i].required) {
				if (work.kvarsArr[i].type === 'checkbox') {
					if (work.kvarsArr[i].value !== true && work.kvarsArr[i].value !== false) {
						errMsg = `${work.kvarsArr[i].label} should hava value`;
						break;
					}
				} else {
					if (!work.kvarsArr[i].value) {
						errMsg = `${work.kvarsArr[i].label} should hava value`;
						break;
					}
				}
			}
		}
		if (errMsg !== '') {
			setFadeMessage(errMsg, 'warning');
			return false;
		}
		return true;
	}
	async function _doneWork(user_choice = null) {
		if (checkRequired() === false) return;
		let payload: any = {
			doer: work.doer,
			todoid: work.todoid,
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
		let ret = await api.post('work/do', payload, user.sessionToken);
		if (ret.error) {
			setFadeMessage(ret.message, 'error');
		} else {
			setFadeMessage('Completed', 'success');
		}
		//goto(iframeMode ? '/work?iframe' : '/work');
		await _refreshWork(work.todoid);
	}

	export async function _refreshWork(todoid) {
		work = (await api.post('work/info', { todoid: todoid }, user.sessionToken)) as unknown as Work;
		comment = '';
	}

	const checkDoable = function () {
		let is_doable =
			(work.doer === user.email ||
				(work.rehearsal && work.wfstarter === user.email) ||
				(delegators && Array.isArray(delegators) && delegators.includes(work.doer))) &&
			work.status === 'ST_RUN';
		return is_doable;
	};
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

{#if work && work.todoid}
	<Container id={'workitem_' + work.todoid} class="mt-3">
		<form>
			<Container class="mt-3 kfk-highlight-2 text-wrap text-break">
				<Icon name="vinyl" />&nbsp;
				{$_('todo.pbo')}
				{#each work.wf.pbo as pbo}
					<a href={pbo} target="_blank">
						{pbo}&nbsp;
						<Icon name="box-arrow-up-right" />
					</a>
				{/each}
			</Container>
			{#if work.instruct}
				<div class="fs-5">
					{$_('todo.instruction')}
					<span class="mt-3 fs-3">
						{@html Parser.base64ToCode(work.instruct, '')}
					</span>
				</div>
			{/if}
			<!--- div class="w-100">
				<iframe id="workInstruction" src="/work/instruct" title="YouTube video" width="100%" />
			</div -->
			<Container class="mt-3 kfk-highlight-2">
				{#if checkDoable() && work.status === 'ST_RUN'}
					{#if work.kvarsArr.length > 0}
						{$_('todo.nodeInput')}
						<Row cols="4">
							{#each work.kvarsArr as kvar, i}
								{#if kvar.breakrow}
									<div class="w-100" />
								{/if}
								<Col>
									{#if isDebug}
										<div class="text-wrap text-break">{JSON.stringify(kvar)}</div>
									{/if}
									<FormGroup>
										<Label>{kvar.label}{kvar.required ? '*' : ''}</Label>
										{#if ['select', 'checkbox', 'radio'].includes(kvar.type) === false}
											<Input
												type={['dt', 'datetime'].includes(kvar.type) ? 'datetime-local' : kvar.type}
												name={kvar.name}
												bind:value={work.kvarsArr[i].value}
												id={kvar.id}
												placeholder={kvar.placeholder}
												required={kvar.required}
											/>
										{:else if kvar.type === 'checkbox'}
											<div class="form-check form-switch">
												<input
													class="form-check-input"
													type="checkbox"
													role="switch"
													bind:checked={kvar.value}
													id={'chk-' + kvar.id ? kvar.id : kvar.name}
												/>
											</div>
										{:else if kvar.type === 'radio'}
											{#each kvar.options as option}
												<Input type="radio" bind:group={kvar.value} value={option} label={option} />
											{/each}
										{:else if kvar.type === 'select'}
											<List
												{kvar}
												{whichtoChange}
												{serverListKey}
												on:changelist={(e) => {
													let tmp = e.detail.split('/');
													if (tmp[0].length > 0) {
														whichtoChange = tmp[0];
														serverListKey = tmp[1];
													}
												}}
											/>
										{/if}
									</FormGroup>
								</Col>
							{/each}
						</Row>
					{/if}
					<input type="hidden" name="todoid" value={work.todoid} />
					{#if work.status === 'ST_RUN'}
						<Input type="textarea" placeholder="Comments: " bind:value={comment} />
					{/if}
					{#if work.status === 'ST_RUN'}
						<Row class="mt-2">
							{#if work.routingOptions.length === 0}
								<Col>
									<Button
										class="w-100"
										color="primary"
										on:click={async (e) => {
											e.preventDefault();
											await _doneWork();
										}}
									>
										{$_('button.done')}
									</Button>
								</Col>
							{/if}
							{#each work.routingOptions as aChoice}
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
						</Row>
					{/if}

					<Row class="mt-2">
						{#if work.returnable}
							<Col>
								<Button
									class="w-100"
									on:click={(e) => {
										e.preventDefault();
										_sendbackWork();
									}}
								>
									{$_('button.sendback')}
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
									{$_('button.revoke')}
								</Button>
							</Col>
						{/if}
						{#if work.status === 'ST_RUN'}
							<Col>
								<Button
									class="w-100"
									color="success"
									on:click={(e) => {
										e.preventDefault();
										_toggleAdhoc();
									}}
								>
									{showAdhocForm ? $_('button.cancel') : $_('button.adhoc')}
								</Button>
							</Col>
						{/if}
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
										on:click={async (e) => {
											e.preventDefault();
											adhocTaskDoer = aUser;
											await checkAdhocTaskDoer(e, true);
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
							<Button
								color="primary"
								on:click={async (e) => {
									e.preventDefault();
									await checkAdhocTaskDoer(e, true);
								}}
							>
								{$_('button.check')}
							</Button>
							{#if adhocTaskDoerConfirmed}
								<Col class="d-flex justify-content-end my-1">
									<Button
										color="primary"
										disabled={creatingAdhoc}
										on:click={async (e) => {
											e.preventDefault();
											await createAdhoc();
										}}
									>
										{$_('button.sendadhoc')}
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
										{$_('button.cancel')}
									</Button>
								</Col>
							{:else if Array.isArray(checkingAdhocResult) && checkingAdhocResult.length > 0}
								There are {checkingAdhocResult.length} users, are you sure to continue?
								{#each checkingAdhocResult as aUser}
									{aUser.cn}({aUser.uid})
								{/each}
								<Button
									class="mt-1"
									color="primary"
									on:click={async (e) => {
										e.preventDefault();
										await createAdhoc();
									}}
								>
									{$_('button.sendadhocConfirm')}
								</Button>
								<Button
									class="mt-1"
									color="secondary"
									on:click={async (e) => {
										e.preventDefault();
										showAdhocForm = false;
									}}
								>
									{$_('button.sendadhocReconsider')}
								</Button>
							{:else}
								There are {checkingAdhocResult.length} users, are you sure to continue?
							{/if}
						</Row>
					{/if}
					<!-- Transfer --->
					<TransferWork {work} {iframeMode} />
				{:else if work.revocable}
					<Row>
						<Col>
							<Button
								class="w-100"
								on:click={(e) => {
									e.preventDefault();
									_revokeWork();
								}}
							>
								{$_('button.revoke')}
							</Button>
						</Col>
					</Row>
				{/if}
			</Container>
		</form>
		{#if work.wf.kvarsArr.length > 0}
			<Container class="mt-3 kfk-highlight-2">
				Workflow Context:
				<Row cols={{ lg: 3, md: 2, xs: 1 }}>
					{#each work.wf.kvarsArr as kvar}
						{#if kvar.breakrow}
							<div class="w-100" />
						{/if}
						<Col>
							<span class="fs-5">
								{#if kvar.label === 'StarterOU'}
									{$_('todo.StarterOU')}
								{:else if kvar.label === 'StarterCN'}
									{$_('todo.StarterCN')}
								{:else if kvar.label === 'Starter'}
									{$_('todo.Starter')}
								{:else}
									{kvar.label}
								{/if}
								:
							</span>
							<span class="kfk-kvar-value-display">
								{kvar.display ? kvar.display : kvar.value}
							</span>
						</Col>
					{/each}
				</Row>
			</Container>
		{/if}
		{#if work.comment}
			<CommentEntry bind:comment={work.comment} />
		{/if}
		{#if work.rehearsal}
			<div class="fs-3">Rehearsal Information:</div>
			<p>Doable: {checkDoable()} status: {work.status} revocable: {work.revocable}</p>
			<p>{work.doer === user.email ? '' : `Rehearsal for ${work.doer}`}</p>
			<div>
				<ul>
					Role: {work.role}
					{#each JSON.parse(Parser.base64ToCode(work.doer_string, '[]')) as aDoer}
						<li>
							{aDoer.cn}({aDoer.uid})
						</li>
					{/each}
				</ul>
			</div>
		{:else}
			<div>
				{work.doer === user.email ? '' : `Delegated by ${work.doer}`}
			</div>
		{/if}
	</Container>
	<ProcessTrack
		{user}
		bind:wf={work.wf}
		bind:wfid={work.wfid}
		bind:workid={work.workid}
		{onPrint}
		{_refreshWork}
		{iframeMode}
	/>
{:else}
	Not found
{/if}
