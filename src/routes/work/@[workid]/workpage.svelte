<script lang="ts">
	import moment from 'moment';
	import 'moment/locale/zh-cn';
	import * as api from '$lib/api';
	import { goto } from '$app/navigation';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardBody,
		CardSubtitle,
		CardText,
		Container,
		Row,
		Col,
		Nav,
		Icon,
		NavItem,
		NavLink
	} from 'sveltestrap';
	import { Form, FormGroup, FormText, Input, Label } from 'sveltestrap';
	import { Status } from '$lib/status';
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
	import type { User, Work } from '$lib/types';
	export let work: Work;
	export let user: User;
	export let delegators;
	export let iframeMode: boolean;
	$: is_doable =
		(work.doer === user.email ||
			(delegators && Array.isArray(delegators) && delegators.includes(work.doer))) &&
		work.status === 'ST_RUN';

	function _sendbackWork() {
		let payload = {
			wfid: work.wfid,
			workid: work.workid,
			doer: work.doer
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
			workid: work.workid
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
	function _doneWork(user_choice) {
		let payload = {
			doer: work.doer,
			workid: work.workid
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
						Starter:
						<div class="kfk-kvar-value-display">{work.wf.starter}</div>
					</Col>
					<Col>
						Status: {work.status}
					</Col>
					<Col>
						Owner: {work.doer}
					</Col>
					<Col>
						{#if work.doneat}
							Complete at: {work.doneat ? moment(work.doneat).format('LLLL') : ''}
						{/if}
					</Col>
					<Col />
				</Row>
			</Container>
			<Container class="mt-3 kfk-highlight-2">
				Workflow Data:
				<Row cols={{ lg: 3, md: 2, sm: 1 }}>
					{#each work.wf.kvarsArr as kvar, i}
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
			{#if is_doable && work.kvarsArr.length > 0}
				<Container class="mt-3 kfk-highlight-2">
					Node Input:
					<Row cols={{ lg: 3, md: 2, sm: 1 }}>
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
			<Container class="mt-3">
				{#if is_doable}
					<input type="hidden" name="workid" value={work.workid} />
					{work.doer === user.email ? '' : `Delegated by ${work.doer}`}
					<Row cols="6">
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
				{/if}
			</Container>
		</Form>
	</Container>
	<Container class="mt-4">
		<Card>
			<CardHeader>
				<CardTitle>
					<Row>
						<Col>
							<Icon name="bar-chart-steps" />
							{work.wf.wftitle}
						</Col>
						<Col class="w-100">
							<div class="w-100 text-right">
								<NavLink
									class="m-0 p-0 fs-6"
									on:click={(e) => {
										e.preventDefault();
										gotoWorkflow(work.wfid);
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
						<Col>Started at: {work.wf.beginat ? moment(work.wf.begingat).format('LLLL') : ''}</Col>
						<Col>Started by: {work.wf.starter}</Col>
						<Col>
							{work.wf.doneat
								? 'Completed at ' + moment(work.wf.doneat).format('LLLL')
								: 'Still running'}
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
				{#each work.history as entry}
					<Container class="mt-2 kfk-highlight-2 ">
						<Row cols={{ lg: 1, md: 1, sm: 1 }}>
							<Col>
								<div>
									<a
										class="preview-link kfk-team-id kfk-link"
										href={'#'}
										on:click|preventDefault={() => {
											showWorkitem(entry.workid);
										}}
									>
										<b>{entry.title}</b>
									</a>
									: {Status[entry.status]}
								</div>
							</Col>
							{#if entry.route}
								<Col>
									Decision: <b> {entry.route} </b>
								</Col>
							{/if}
						</Row>
						{#if entry.kvarsArr.length > 0}
							<Row><Col><b>Variables:</b></Col></Row>
							<Row>
								<Col>
									<Container>
										<Row cols={{ lg: 2, md: 1, sm: 1 }}>
											{#each entry.kvarsArr as kvar}
												<Col>
													<div>{kvar.label}</div>
													<div class="kfk-kvar-value-display">{kvar.value}</div>
												</Col>
											{/each}
										</Row>
									</Container>
								</Col>
							</Row>
						{/if}
						<Row>
							<Col class="d-flex align-content-end">
								<div>
									By: {entry.doer}
									at: {moment(entry.doneat).format('LLLL')}
								</div>
							</Col>
						</Row>
					</Container>
				{/each}
			</CardBody>
		</Card>
	</Container>
{:else}
	Not found
{/if}

<style>
	.text-right {
		text-align: right;
	}
</style>
