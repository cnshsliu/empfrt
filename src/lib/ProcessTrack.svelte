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
	import { Status } from '$lib/status';
	import { goto } from '$app/navigation';
	export let wfid;
	export let wf;
	export let workid;
	export let TimeTool;
	export let iframeMode;
	export let print = false;
	export let user;
	function gotoWorkflowMonitor(wfid: string) {
		goto(iframeMode ? `/workflow/@${wfid}/monitor?iframe` : `/workflow/@${wfid}/monitor`, {
			replaceState: false
		});
	}
	function printWindow() {
		window.print();
	}
	function gotoWorkflow(wfid) {
		goto(`/workflow/@${wfid}`);
	}
	function gotoWork(workid) {
		goto(`/work/@${workid}`);
	}
</script>

<Container class="mt-5">
	<div class="fs-3">
		<Icon name="bar-chart-steps" />
		Process
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
			<Col>Started at: {wf.beginat ? TimeTool.format(wf.begingat, 'LLLL') : ''}</Col>
			<Col>Started by: {wf.starter}</Col>
			<Col>
				{wf.doneat ? 'Completed at ' + TimeTool.format(wf.doneat, 'LLLL') : 'Still running'}
			</Col>
		</Row>
	</Container>
	<div class="fs-3 mt-3">
		<Icon name="clock-history" />
		Work log
		<hr />
	</div>
	<Container class="my-0">
		<div>
			{#each wf.history as entry}
				<Container
					class={'mt-2 ' +
						(workid === entry.workid ? 'kfk-highlight-current ' : 'kfk-highlight-2 ')}
				>
					<Row cols="1" class="mt-1 pt-3 kfk-work-kvars tnt-work-kvars">
						<Col>
							<div
								class="clickable text-primary"
								on:click={(e) => {
									e.preventDefault();
									gotoWork(entry.workid);
								}}
							>
								<b>{entry.title}</b>
								/ {Status[entry.status]} / {entry.nodeid === 'ADHOC' ? 'ADHOC' : ''}
							</div>
						</Col>
						{#if entry.route}
							<Col>
								<span class="kfk-kvar-key-display">Decision:</span>
								<span class="kfk-kvar-value-display">{entry.route}</span>
							</Col>
						{/if}
					</Row>
					{#if entry.kvarsArr.length > 0}
						<Row class="pt-3 kfk-work-kvars tnt-work-kvars">
							<Col>
								<Container>
									<Row cols={{ xs: 4 }}>
										{#each entry.kvarsArr as kvar}
											<Col>
												<Row cols="2">
													<Col><p class="kfk-kvar-key-display text-right">{kvar.label}</p></Col>
													<Col class="kfk-kvar-value-display">{kvar.value}</Col>
												</Row>
											</Col>
										{/each}
									</Row>
								</Container>
							</Col>
						</Row>
					{/if}
					<Row cols="1">
						{#if entry.comment && entry.comment.trim().length > 0}
							<Col>
								<CommentEntry bind:comment={entry.comment} />
							</Col>
						{/if}
						<Col>
							<p class="text-right fs-6 fw-light fst-italic">
								{#each entry.doers as aDoer}
									{#if entry.status === 'ST_DONE' && entry.doneby === aDoer.uid}
										<span class="local_work_doneby">
											{aDoer.cn}({aDoer.uid});&nbsp;
										</span>
									{:else}
										{aDoer.cn}({aDoer.uid});
									{/if}
								{/each}
								at: {TimeTool.format(entry.doneat, 'LLL')}
							</p>
							<p class="text-right fs-6 fw-light fst-italic" />
						</Col>
					</Row>
				</Container>
			{/each}
		</div>
		{#if print}
			<Row>
				<Col class="d-flex justify-content-end"><NavLink on:click={printWindow}>Print</NavLink></Col
				>
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
