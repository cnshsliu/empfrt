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
		Icon
	} from 'sveltestrap';
	import { _, mtcDate } from '$lib/i18n';
	import CommentEntry from '$lib/CommentEntry.svelte';
	import { StatusClass, StatusLabel } from '$lib/status';
	import parser from '$lib/parser';
	import { goto } from '$app/navigation';
	import { Badge } from 'sveltestrap';
	export let wfid;
	export let wf;
	export let workid;
	export let iframeMode;
	export let user;
	export let _refreshWork;
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
</script>

<Container class="mt-5">
	<div class="fs-3 text-center">
		<div
			class="clickable text-primary fs-3 text-center"
			on:click={(e) => {
				e.preventDefault();
				gotoWorkflow(wfid);
			}}
		>
			{wf.wftitle}
		</div>
		<hr />
	</div>
	<Container class="mt-1">
		<Row cols={{ lg: 4, md: 2, sm: 1 }}>
			<Col>
				{$_('todo.startat')}: {mtcDate(wf.beginat)}
			</Col>
			<Col>
				{#if wf.status === 'ST_DONE'}
					{$_('todo.doneat')}: {mtcDate(wf.doneat)}
				{:else}
					<span class={StatusClass(wf.status)}>{StatusLabel(wf.status)}</span>
				{/if}
			</Col>
			<Col>{$_('todo.startby')}: {user.email === wf.starter ? 'Me' : wf.starter}</Col>
			<Col class="w-100 d-flex justify-content-end">
				<NavLink
					class="m-0 p-0 fs-6"
					on:click={(e) => {
						e.preventDefault();
						gotoWorkflowMonitor(wfid);
					}}
					><Icon name="kanban" />&nbsp;
					{$_('todo.monitor')}
				</NavLink>
			</Col>
		</Row>
	</Container>
	<div class="fs-3 mt-3">
		<hr />
	</div>
	<Container class="my-0">
		{#each wf.history as entry}
			<Card
				class={'mt-2 ' +
					(workid === entry.workid ? 'kfk-highlight-track-current ' : 'kfk-highlight-track ')}
			>
				<CardHeader>
					<CardTitle>
						<Row cols="1" class="mt-1 pt-3 kfk-work-kvars tnt-work-kvars">
							<Col class="d-flex">
								<div class="w-100">
									<span class="fs-5">{entry.title}</span>
									<sup>
										{#if workid === entry.workid}
											{#if entry.nodeid === 'ADHOC'}
												<Badge pill color={'light'}>
													<span class="text-primary">Adhoc</span>
												</Badge>
											{/if}
											<Badge pill color={'light'}>
												<span class="text-primary">{StatusLabel(entry.status)}</span>
											</Badge>
										{:else}
											{#if entry.nodeid === 'ADHOC'}
												<Badge pill class="bg-white border border-primary">
													<span class={StatusClass(entry.status)}> ADHOC </span>
												</Badge>
											{/if}
											<Badge pill class="bg-white border border-primary">
												<span class={StatusClass(entry.status)}>
													{StatusLabel(entry.status)}
												</span>
											</Badge>
										{/if}
									</sup>
								</div>
								<div class="flex-shringk-1">
									{#if entry.doneat}
										{$_('todo.doneat')}
										: <br />{mtcDate(entry.doneat)}
									{/if}
								</div>
							</Col>
							{#if entry.route}
								<hr />
								<Col>
									<span class="kfk-kvar-key-display">{$_('todo.decision')}:</span>
									<span class="kfk-kvar-value-display">{entry.route}</span>
								</Col>
							{/if}
						</Row>
					</CardTitle>
				</CardHeader>
				<CardBody>
					{#if entry.kvarsArr.length > 0}
						<Row class="pt-3 kfk-work-kvars tnt-work-kvars">
							<Col>
								<Container>
									<Row cols={{ xs: 1, md: 2, lg: 4 }}>
										{#each entry.kvarsArr as kvar}
											<Col class="p-2">
												<span class="fs-5">{kvar.label} </span><br />
												<span class="kfk-kvar-value-display">
													{#if kvar.type === 'textarea'}
														{@html parser.newlineToBreak(kvar.value)}
													{:else}
														{kvar.display ? kvar.display : kvar.value}
													{/if}
												</span>
											</Col>
										{/each}
									</Row>
								</Container>
							</Col>
						</Row>
					{/if}
					<Row cols="1">
						{#if Array.isArray(entry.comment)}
							<Col>
								<CommentEntry bind:comment={entry.comment} />
							</Col>
						{/if}
						<Col>
							<p class="text-right fs-6 fw-light fst-italic">
								{#each entry.doers as aDoer}
									<a href={`/work/@${aDoer.todoid}`} class="clickable text-primary btn btn-sm">
										{#if aDoer.status === 'ST_DONE'}
											<i class="bi bi-emoji-sunglasses" alt="Done" />{aDoer.cn}({aDoer.uid}); &nbsp;
											<sup>{mtcDate(aDoer.doneat)}</sup>
										{:else if aDoer.status === 'ST_IGNORE'}
											<i
												class="bi bi-emoji-smile-upside-down"
												alt="Ignored"
											/>{aDoer.cn}({aDoer.uid});
										{:else}
											<i class="bi bi-emoji-expressionless" alt="Done" />{aDoer.cn}({aDoer.uid});
										{/if}
									</a>
								{/each}
							</p>
							<p class="text-right fs-6 fw-light fst-italic" />
						</Col>
					</Row>
				</CardBody>
			</Card>
		{/each}
		<Row>
			<Col class="d-flex justify-content-end">
				<NavLink on:click={printWindow}>
					<i class="bi bi-printer" alt="Printer" />&nbsp;
					{$_('todo.print')}
				</NavLink>
			</Col>
		</Row>
	</Container>
</Container>

<style>
	.local_work_doneby {
		font-weight: bolder;
		color: blue;
	}
</style>
