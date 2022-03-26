<script lang="ts">
	import {
		Button,
		TabContent,
		TabPane,
		Container,
		Card,
		CardHeader,
		CardTitle,
		CardBody,
		Row,
		Col,
		NavLink,
		Nav,
		Icon,
		Input
	} from 'sveltestrap';
	import { _, mtcDate } from '$lib/i18n';
	import { printing } from '$lib/Stores';
	import * as api from '$lib/api';
	import DisplayTable from '$lib/display/Table.svelte';
	import CommentEntry from '$lib/CommentEntry.svelte';
	import { StatusClass } from '$lib/status';
	import parser from '$lib/parser';
	import { goto } from '$app/navigation';
	import { Badge } from 'sveltestrap';
	export let wfid;
	export let wf;
	export let workid = 'CURRENT_WORK_UNKNOWN';
	export let iframeMode;
	export let user;
	export let _refreshWork = null;
	export let onPrint;
	function gotoWorkflowMonitor(wfid: string) {
		goto(iframeMode ? `/workflow/@${wfid}/monitor?iframe` : `/workflow/@${wfid}/monitor`);
	}
	async function printWindow() {
		if (onPrint) await onPrint();
		window.print();
	}
	function gotoWorkflow(wfid) {
		goto(`/workflow/@${wfid}`);
	}
	async function gotoWork(todoid) {
		if (_refreshWork) await _refreshWork(todoid);
		else await goto(`/work/@${todoid}`, { noscroll: false });
	}

	let showLog = false;
	let logs = '';
	const onRefreshLog = async (e) => {
		e.preventDefault();
		logs = (await api.post(
			'workflow/readlog',
			{ wfid: wfid },
			user.sessionToken
		)) as unknown as string;
	};
	const onShowLog = async (e) => {
		e.preventDefault();
		showLog = true;
		await onRefreshLog(e);
	};
	const onCloseLog = async (e) => {
		e.preventDefault();
		showLog = false;
	};
</script>

<Container class="mt-5">
	<Container class="mt-1">
		<Row cols={{ lg: 4, md: 2, sm: 1 }}>
			<Col>
				{$_('todo.startat')}: {mtcDate(wf.beginat)}
			</Col>
			<Col>
				{#if wf.status === 'ST_DONE'}
					{$_('todo.doneat')}: {mtcDate(wf.doneat)}
				{:else}
					<span class={StatusClass(wf.status)}>{$_('status.' + wf.status)}</span>
				{/if}
			</Col>
			<Col>{$_('todo.startby')}: {user.email === wf.starter ? 'Me' : wf.starter}</Col>
			{#if $printing === false}
				<Col class="w-100 d-flex justify-content-end">
					<Nav>
						<NavLink
							on:click={(e) => {
								e.preventDefault();
								gotoWorkflowMonitor(wfid);
							}}
							><Icon name="kanban" />&nbsp;
							{$_('todo.monitor')}
						</NavLink>
					</Nav>
				</Col>
			{/if}
		</Row>
	</Container>
	<div class="fs-3 mt-3">
		<hr />
	</div>
	<!-- pre><code>
	{JSON.stringify(wf.history, null, 2)}
	</code></pre -->
	<Container class="my-0">
		{#each wf.history as entry}
			<Row cols="1">
				<div
					class={'col mt-3 border rounded-3 mt-1 pt-0 kfk-work-kvars tnt-work-kvars ' +
						(entry.isCurrent ? 'border-5' : '')}
				>
					<Row>
						<Col class="d-flex border-end col-3 card-header">
							<div class="text-center px-0 w-100">
								{#if workid === entry.workid}
									{#if entry.nodeid === 'ADHOC'}
										<Badge pill color={'light'}>
											<span class="text-primary">Adhoc</span>
										</Badge>
									{/if}
									<Badge pill color={'light'}>
										<span class="text-primary">{$_('status.' + entry.status)}</span>
									</Badge>
								{:else}
									{#if entry.nodeid === 'ADHOC'}
										<Badge pill class="bg-white border border-primary">
											<span class={StatusClass(entry.status)}> ADHOC </span>
										</Badge>
									{/if}
									<Badge pill class="bg-white border border-primary">
										<span class={StatusClass(entry.status)}>
											{$_('status.' + entry.status)}
										</span>
									</Badge>
								{/if}
								{#if entry.doneat}
									<br />{mtcDate(entry.doneat)}
								{/if}
								{#if entry.workDecision}
									<div class="pt-3 text-center fs-2 kfk-kvar-value-display">
										{entry.workDecision}
									</div>
								{/if}
							</div>
						</Col>
						<Col class="col-9">
							<div>
								<Row class="d-flex px-3  py-1 border-bottom">
									<span class="ms-0">
										<span class="fs-5">{entry.title}</span>
									</span>
								</Row>
								<Row class="ms-3 d-flex">
									{#each entry.doers as aDoer}
										<Col class="text-center">
											<div
												on:click|preventDefault={(e) => goto(`/work/@${aDoer.todoid}`)}
												class="clickable btn btn-sm"
											>
												{#if aDoer.status === 'ST_DONE'}
													<div>{@html aDoer.decision ? aDoer.decision : '&nbsp;'}</div>
													{#if aDoer.signature}
														<img src={aDoer.signature} class="kfk-signature" alt={aDoer.cn} />
													{:else}
														<div
															class="user-emoji d-flex align-items-center  justify-content-center"
														>
															<i class="fs-2 text-success bi bi-emoji-sunglasses" alt="Done" />
														</div>
													{/if}
													<div>{aDoer.cn}</div>
													<div>{mtcDate(aDoer.doneat)}</div>
												{:else if aDoer.status === 'ST_IGNORE'}
													<div>&nbsp;</div>
													<div class="user-emoji d-flex align-items-center  justify-content-center">
														<i class="bi text-black-50 bi-emoji-smile-upside-down" alt="Ignored" />
													</div>
													<div>{aDoer.cn}</div>
													<div>&nbsp;</div>
												{:else}
													<div>&nbsp;</div>
													<div class="user-emoji d-flex align-items-center  justify-content-center">
														<i class="bi bi-emoji-expressionless" alt="notdone" />
													</div>
													<div>{aDoer.cn}</div>
													<div>&nbsp;</div>
												{/if}
											</div>
										</Col>
									{/each}
								</Row>
							</div>
						</Col>
					</Row>
					{#if entry.kvarsArr.filter((x) => x.name[0] != '$').length > 0 || (Array.isArray(entry.comment) && entry.comment.length > 0)}
						{#if entry.kvarsArr.filter((x) => x.name[0] != '$').length > 0}
							<Row cols="1" class="kfk-work-kvars tnt-work-kvars">
								<Col class="d-flex">
									<div class="text-nowrap">{$_('todo.nodevars')}</div>
									<div class="ms-3 w-100">
										<Container>
											<Row cols={{ xs: 1, md: 2, lg: 4 }}>
												{#each entry.kvarsArr.filter((x) => x.name[0] != '$') as kvar}
													{#if kvar.type === 'tbl'}
														<Col class="p-2 w-100">
															<div class="fs-5">{kvar.label}</div>
															<DisplayTable {kvar} />
														</Col>
													{:else if kvar.type === 'textarea'}
														<Col class="p-2 w-100">
															<div class="fs-5">{kvar.label}</div>
															<span class="kfk-kvar-value-display">
																{@html parser.newlineToBreak(kvar.value)}
															</span>
														</Col>
													{:else}
														<Col class="p-2">
															<div class="fs-5">{kvar.label}</div>
															<span class="kfk-kvar-value-display">
																{kvar.display ? kvar.display : kvar.value}
															</span>
														</Col>
													{/if}
												{/each}
											</Row>
										</Container>
									</div>
								</Col>
							</Row>
						{/if}
						{#if Array.isArray(entry.comment) && entry.comment.length > 0}
							<Row cols="1" class="border-top">
								<Col class="px-3 d-flex">
									<div class="text-nowrap">{$_('todo.comments')}</div>
									<div class="ps-3">
										<CommentEntry bind:comment={entry.comment} />
									</div>
								</Col>
							</Row>
						{/if}
					{/if}
				</div>
			</Row>
		{/each}
		{#if $printing === false}
			<Row>
				<Col class="w-100 d-flex justify-content-end">
					<NavLink on:click={onShowLog}>
						<Icon name="kanban" />&nbsp;
						{$_('todo.showlog')}
					</NavLink>
					<NavLink on:click={printWindow}>
						<i class="bi bi-printer" alt="Printer" />&nbsp;
						{$_('todo.print')}
					</NavLink>
				</Col>
			</Row>
		{/if}
	</Container>
	{#if showLog}
		<Container>
			<Row cols="1">
				<Col class="w-100 d-flex justify-content-end">
					<Button on:click={onRefreshLog}>
						<i class="bi bi-arrow-clockwise" />
					</Button>
					<Button class="ms-1" on:click={onCloseLog}>
						<i class="bi bi-x" />
					</Button>
				</Col>
				<Col>
					<Input type="textarea" rows={10} value={logs} />
				</Col>
			</Row>
		</Container>
	{/if}
</Container>

<style>
	.local_work_doneby {
		font-weight: bolder;
		color: blue;
	}
	.user-emoji {
		height: 50px;
	}
</style>
