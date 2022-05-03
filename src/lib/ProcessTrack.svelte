<script lang="ts">
	import { Button, Row, Col, NavLink, Nav, Icon, Input } from 'sveltestrap';
	import { _, mtcDate } from '$lib/i18n';
	import { printing } from '$lib/Stores';
	import AniIcon from '$lib/AniIcon.svelte';
	import { session } from '$app/stores';
	import { tick } from 'svelte';
	import * as api from '$lib/api';
	import DisplayTable from '$lib/display/Table.svelte';
	//import CommentEntry from '$lib/CommentEntry.svelte';
	import Comments from '$lib/Comments.svelte';
	import CsvDisplay from '$lib/display/CsvDisplay.svelte';
	import { StatusClass } from '$lib/status';
	import parser from '$lib/parser';
	import { goto } from '$app/navigation';
	import { Badge } from 'sveltestrap';
	import { filterStorage } from '$lib/empstores';
	export let wfid;
	export let wf;
	export let workid = 'CURRENT_WORK_UNKNOWN';
	export let iframeMode;
	export let user;
	export let _refreshWork = null;
	export let onPrint;
	export let workJustDone = null;
	function gotoWorkflowMonitor(wfid: string) {
		goto(iframeMode ? `/workflow/${wfid}/monitor?iframe` : `/workflow/${wfid}/monitor`);
	}
	async function printWindow() {
		if (onPrint) await onPrint();
		window.print();
	}
	function gotoWorkflow(wfid) {
		goto(`/workflow/${wfid}`);
	}
	async function gotoWork(todoid) {
		if (_refreshWork) await _refreshWork(todoid);
		else await goto(`/work/${todoid}`, { noscroll: false });
	}

	let showLog = false;
	let serverRunningLogs = '';
	const onRefreshLog = async (e) => {
		e.preventDefault();
		serverRunningLogs = (await api.post(
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

	//刚刚完成的todo，检测到后，更新history中对应todo的状态
	$: workJustDone &&
		(() => {
			for (let i = 0; i < wf.history.length; i++) {
				if (wf.history[i].workid === workJustDone.workid) {
					wf.history[i].justDone = true;
					wf.history[i].status = workJustDone.status;
					wf.history = wf.history;
					break;
				}
			}
		})();
</script>

<div class="m-3 p-3 kfk-highlight-2 text-center position-relative">
	<Row>
		<Col>
			<div class="fs-5">{$_('todo.worklogof')}</div>
			<div
				class="clickable text-primary fs-3 text-center"
				on:click={(e) => {
					e.preventDefault();
					goto(`/workflow/${wfid}`);
				}}
			>
				{wf.wftitle}
			</div>
		</Col>
		{#if $printing === false}
			<Col class="col-auto">
				<Row cols="1">
					<Col class="m-0 p-0">
						<NavLink
							class="kfk-link m-0 p-0"
							on:click={(e) => {
								e.preventDefault();
								gotoWorkflowMonitor(wfid);
							}}
						>
							<AniIcon icon="kanban" ani="aniShake" />
							&nbsp;
							{$_('todo.monitor')}
						</NavLink>
					</Col>
					<Col class="m-0 p-0">
						<NavLink class="kfk-link m-0 p-0" on:click={printWindow}>
							<AniIcon icon="printer" ani="aniShake" />
							&nbsp;
							{$_('todo.print')}
						</NavLink>
					</Col>
					<Col class="m-0 p-0">
						<NavLink class="kfk-link m-0 p-0" on:click={onShowLog}>
							<AniIcon icon="kanban" ani="aniShake" />
							&nbsp;
							{$_('todo.showlog')}
						</NavLink>
					</Col>
					<Col class="m-0 p-0">
						<NavLink
							class="kfk-link m-0 p-0"
							on:click={(e) => {
								e.preventDefault();
								$filterStorage.showprocesstrack = !$filterStorage.showprocesstrack;
							}}
						>
							<AniIcon
								icon={$filterStorage.showprocesstrack ? 'caret-up' : 'caret-right'}
								ani="aniShake"
							/>
							&nbsp;
							{$filterStorage.showprocesstrack ? $_('todo.track.shouqi') : $_('todo.track.dakai')}
						</NavLink>
					</Col>
				</Row>
			</Col>
		{/if}
	</Row>
	{#if $filterStorage.showprocesstrack}
		<Row class="p-3" cols={{ lg: 4, md: 2, sm: 1 }}>
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
		</Row>
		<hr />
		<div class="m-3 p-3">
			{#each wf.history as entry}
				<Row
					class={'mt-2 border rounded-3 pt-0 kfk-trackentry kfk-work-kvars tnt-work-kvars ' +
						(entry.isCurrent ? 'border-3' : '')}
				>
					<Col class="d-flex border-end col-3">
						<div class="text-center px-0 pt-3 w-100">
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
						<div class="text-center">
							<!-- History entry header -->
							<Row class="d-flex px-3  py-1 border-bottom">
								<span class="ms-0">
									<span class="fs-5">{entry.title}</span>
								</span>
							</Row>
							<Row class="ms-3 d-flex">
								{#each entry.doers as aDoer}
									<Col class="text-center">
										<div
											on:click|preventDefault={async (e) => {
												await tick();
												goto(`/work/${aDoer.todoid}`);
											}}
											class="clickable btn btn-sm"
										>
											{#if aDoer.status === 'ST_DONE'}
												<div>{@html aDoer.decision ? aDoer.decision : '&nbsp;'}</div>
												{#if aDoer.signature}
													<img src={aDoer.signature} class="kfk-signature" alt={aDoer.cn} />
												{:else}
													<div class="user-emoji d-flex align-items-center  justify-content-center">
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
								<!-- each doer -->
							</Row>
						</div>
						<div>
							<!-- variables and comment -->
							{#if entry.kvarsArr.filter((x) => x.name[0] != '$').length > 0 || (Array.isArray(entry.comment) && entry.comment.length > 0)}
								{#if entry.kvarsArr.filter((x) => x.name[0] != '$').length > 0}
									<Row
										cols={{ xs: 1, md: 2, lg: 4 }}
										class="kfk-work-kvars tnt-work-kvars border-top"
									>
										{#each entry.kvarsArr.filter((x) => x.name[0] != '$') as kvar}
											<!-- table, textarea width = 100% -->
											<Col
												class={'p-2 border ' +
													(['tbl', 'textarea'].includes(kvar.type) ? 'w-100' : '')}
											>
												{#if kvar.type === 'tbl'}
													<div class="fw-bold">{kvar.label}</div>
													<DisplayTable {kvar} />
												{:else if kvar.type === 'textarea'}
													<div class="fw-bold">{kvar.label}</div>
													<span class="kfk-kvar-value-display">
														{@html parser.newlineToBreak(kvar.value)}
													</span>
												{:else if kvar.type === 'csv'}
													<div class="fw-bold">{kvar.label}</div>
													<CsvDisplay fileId={kvar.value} />
												{:else}
													<div class="fw-bold">{kvar.label}</div>
													<span class="kfk-kvar-value-display">
														{kvar.display ? kvar.display : kvar.value}
													</span>
												{/if}
											</Col>
										{/each}
									</Row>
								{/if}
								<!--
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
							-->
							{/if}
						</div>
					</Col>
				</Row>
			{/each}
		</div>
	{/if}
	<!-- 展开 -->
</div>
{#if showLog}
	<Row class="m-3 p-3" cols="1">
		<Col class="m-0 p-0 d-flex justify-content-end">
			<Button on:click={onRefreshLog}>
				<i class="bi bi-arrow-clockwise" />
			</Button>
			<Button class="ms-1" on:click={onCloseLog}>
				<i class="bi bi-x" />
			</Button>
		</Col>
		<Col class="m-0 p-0">
			<Input type="textarea" rows={10} value={serverRunningLogs} />
		</Col>
	</Row>
{/if}

<style>
	.local_work_doneby {
		font-weight: bolder;
		color: blue;
	}
	.user-emoji {
		height: 50px;
	}
</style>
