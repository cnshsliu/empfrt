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
	import CommentEntry from '$lib/CommentEntry.svelte';
	import { StatusClass, StatusLabel } from '$lib/lang';
	import { goto } from '$app/navigation';
	export let wfid;
	export let wf;
	export let workid;
	export let todoid;
	export let TimeTool;
	export let iframeMode;
	export let print = false;
	export let user;
	export let _refreshWork;
	function gotoWorkflowMonitor(wfid: string) {
		goto(iframeMode ? `/workflow/@${wfid}/monitor?iframe` : `/workflow/@${wfid}/monitor`);
	}
	function printWindow() {
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
	<div class="fs-3">
		<Icon name="bar-chart-steps" />
		{#if wf.rehearsal}
			Process Rehearsal <i class="bi-patch-check" />
		{:else}
			Process
		{/if}
		<hr />
	</div>
	<Container class="mt-1">
		<Row>
			<Col>
				<div
					class="clickable text-primary"
					on:click={(e) => {
						e.preventDefault();
						gotoWorkflow(wfid);
					}}
				>
					{wf.wftitle}
				</div>
			</Col>
			<Col class="w-100 d-flex justify-content-end">
				<NavLink
					class="m-0 p-0 fs-6"
					on:click={(e) => {
						e.preventDefault();
						gotoWorkflowMonitor(wfid);
					}}><Icon name="kanban" />&nbsp;Monitor</NavLink
				>
			</Col>
		</Row>
		<Row cols={{ lg: 2, md: 2, sm: 1 }}>
			<Col>Started at: {TimeTool.format(wf.createdAt, 'LLL')}</Col>
			<Col>
				{@html wf.status === 'ST_DONE'
					? `<span class='${StatusClass('ST_DONE')}'>Completed at ${TimeTool.format(
							wf.updatedAt,
							'LLL'
					  )}</span>`
					: `<span class='${StatusClass(wf.status)}'>${StatusLabel(wf.status)}</span>`}
			</Col>
			<Col>Started by: {user.email === wf.starter ? 'Me' : wf.starter}</Col>
		</Row>
	</Container>
	<div class="fs-3 mt-3">
		<Icon name="clock-history" />
		Work log
		<hr />
	</div>
	<Container class="my-0">
		{#each wf.history as entry}
			<Card
				class={'mt-2 ' + (workid === entry.workid ? 'kfk-highlight-current ' : 'kfk-highlight-2 ')}
			>
				<CardHeader>
					<CardTitle>
						<Row cols="1" class="mt-1 pt-3 kfk-work-kvars tnt-work-kvars">
							<Col class="d-flex">
								<div class="w-100">
									<span class="fs-5">{entry.title}</span>
									<sup>
										{#if entry.nodeid === 'ADHOC'}
											/ ADHOC
										{/if}
										/ <span class={StatusClass(entry.status)}>{StatusLabel(entry.status)}</span>
									</sup>
								</div>
								<div class="flex-shringk-1">
									{#if entry.doneat}
										Done at: <br />{TimeTool.format(entry.doneat, 'LLL')}
									{/if}
								</div>
							</Col>
							{#if entry.route}
								<hr />
								<Col>
									<span class="kfk-kvar-key-display">Decision:</span>
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
									<Row cols={{ xs: 1, md: 2, lg: 3 }}>
										{#each entry.kvarsArr as kvar}
											<Col>
												<span class="fs-5">{kvar.label}: </span>
												<span class="kfk-kvar-value-display">{kvar.value}</span>
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
											<sup>{TimeTool.format(aDoer.doneat, 'LLL')}</sup>
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
		{#if print}
			<Row>
				<Col class="d-flex justify-content-end">
					<NavLink on:click={printWindow}>Print</NavLink>
				</Col>
			</Row>
		{/if}
	</Container>
</Container>

<style>
	.local_work_doneby {
		font-weight: bolder;
		color: blue;
	}
</style>
