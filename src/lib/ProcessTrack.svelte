<script lang="ts">
	import {
		Button,
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
	import { Status } from '$lib/status';
	import { goto } from '$app/navigation';
	export let wfid;
	export let wf;
	export let TimeTool;
	export let iframeMode;
	export let print = false;
	function gotoWorkflow(wfid: string) {
		goto(iframeMode ? `/workflow/@${wfid}/monitor?iframe` : `/workflow/@${wfid}/monitor`, {
			replaceState: false
		});
	}
	function printWindow() {
		window.print();
	}
</script>

<Container class="mt-4">
	<Card>
		<CardHeader>
			<CardTitle>
				<Row>
					<Col>
						<Icon name="bar-chart-steps" />
						{wf.wftitle}
					</Col>
					<Col class="w-100">
						<div class="w-100 text-right">
							<NavLink
								class="m-0 p-0 fs-6"
								on:click={(e) => {
									e.preventDefault();
									gotoWorkflow(wfid);
								}}><Icon name="kanban" />&nbsp;Monitor</NavLink
							>
						</div>
					</Col>
				</Row>
			</CardTitle>
		</CardHeader>
		<CardBody>
			<Container class="mt-2 ml-5 kfk-highlight-2 ">
				<Row cols={{ lg: 2, md: 2, sm: 1 }}>
					<Col>Started at: {wf.beginat ? TimeTool.format(wf.begingat, 'LLLL') : ''}</Col>
					<Col>Started by: {wf.starter}</Col>
					<Col>
						{wf.doneat ? 'Completed at ' + TimeTool.format(wf.doneat, 'LLLL') : 'Still running'}
					</Col>
				</Row>
			</Container>
		</CardBody>
	</Card>
</Container>
<Container class="my-5">
	<Card>
		<CardHeader>
			<CardTitle>
				<Icon name="clock-history" />&nbsp; Work Track:
			</CardTitle>
		</CardHeader>
		<CardBody>
			<div>
				{#each wf.history as entry}
					<Container class="mt-2 kfk-highlight-2 ">
						<Row cols={{ sm: 2 }} class="mt-1 pt-3 kfk-work-kvars tnt-work-kvars">
							<Col>
								<b>{entry.title}</b>
								: {Status[entry.status]}
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
						<Row>
							<Col>
								<p class="text-right fs-6 fw-light fst-italic">
									{#each entry.doers as aDoer}
										{#if entry.status === 'ST_DONE' && entry.doneby === aDoer.uid}
											<span class="work_doneby">
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
		</CardBody>
	</Card>
	<Row>
		<Col class="d-flex justify-content-end"><NavLink on:click={printWindow}>Print</NavLink></Col>
	</Row>
</Container>

<style>
	.work_doneby {
		font-weight: bolder;
		color: blue;
	}
</style>
