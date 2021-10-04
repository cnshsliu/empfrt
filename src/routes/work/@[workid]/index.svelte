<script context="module" lang="ts">
	export const ssr = false;
	export async function load({ page, fetch, session }) {
		const workid = page.params.workid;
		const res = await fetch(`/work/@${workid}.json`);
		const res_html = await fetch(`/work/@${workid}/html.json`);

		const theWork = await res.json();
		const theHtml = await res_html.json();

		return {
			props: {
				work: theWork,
				work_html: theHtml.html,
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import jQuery from 'jquery';
	import moment from 'moment';
	import { API_SERVER } from '$lib/Env';
	import { Form, FormGroup, FormText, Input, Label } from 'sveltestrap';
	import type { User, Work } from '$lib/types';
	import { TabContent, TabPane } from 'sveltestrap';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { title } from '$lib/title';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import { Container, Row, Col, Nav, Icon, NavItem, NavLink } from 'sveltestrap';
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
	import { enhance } from '$lib/form';
	export let work: Work;
	export let user: User;

	let radioGroup;

	const jq = jQuery;

	$title = work.title;

	$: work_json_string = JSON.stringify(work, null, 2);
	$: is_workable = work.doer === user.email && work.status === 'ST_RUN';
	let currentTab = 'work';
	let axios_code = `
let res = await axios.post(
  '${API_SERVER}/work/info',
  {workid: '${work.workid}'}, 
  {
    headers: {
      "authorization", 
      'SESSION_TOKEN'
  };
  } 
);
console.log(res);
`;
	let axios_code_get_html = `
let WORKITEM_HTML = await axios.post(
  '${API_SERVER}/work/html',
  {workid: '${work.workid}'}, 
  {
    headers: {
      "authorization", 
      'SESSION_TOKEN'
  };
  } 
);
`;
	let html_example_svelte = `<p>{@html WORKITEM_HTML}</p>`;
	let html_example_jquery = `<p>{@html WORKITEM_HTML}</p>`;
	export let work_html = 'to be implemented';
	const iframe_html_code = `<iframe title="hyperflow_work_${work.workid}"
src="${API_SERVER}/work/iframe/${work.workid}"></iframe>`;

	function _doneWork(user_choice) {
		let payload = {
			doer: user.email,
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
		goto('/work');
	}
	function _sendbackWork() {
		let payload = {
			wfid: work.wfid,
			workid: work.workid,
			doer: user.email
		};
		payload.kvars = {};
		for (let i = 0; i < work.kvarsArr.length; i++) {
			payload.kvars[work.kvarsArr[i]['name']] = work.kvarsArr[i];
		}
		api.post('work/sendback', payload, user.sessionToken);
		goto('/work');
	}
	function _revokeWork() {
		let payload = {
			wfid: work.wfid,
			workid: work.workid
		};
		api.post('work/revoke', payload, user.sessionToken);
		goto('/work');
	}
</script>

<Container>
	<h5>Current state: {currentTab}</h5>
	<TabContent on:tab={(e) => (currentTab = '' + e.detail)}>
		<TabPane tabId="work" tab="Work" active>
			<h3>{work.title}</h3>
			<Container id={'workitem_' + work.workid} class="mt-3">
				<Form>
					<Container class="mt-3 kfk-highlight-2">
						<Row cols={{ lg: 3, md: 2, sm: 1 }}>
							<Col>
								Starter:
								<div class="kfk-kvar-value-display">{work.wf.starter}</div>
							</Col>
							<Col>
								PBO: <div class="kfk-kvar-value-display">
									<a href={work.wf.pbo} target="_blank">{work.wf.pbo}</a>
								</div>
							</Col>
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
					{#if is_workable && work.kvarsArr.length > 0}
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
					{#if is_workable}
						<Container class="mt-3">
							<input type="hidden" name="workid" value={work.workid} />
							<Row cols="6">
								{#if work.status === 'ST_RUN'}
									{#if work.options.length === 0}
										<Col>
											<Button
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
												on:click={(e) => {
													e.preventDefault();
													_doneWork(aChoice);
												}}>{aChoice}</Button
											>
										</Col>
									{/each}
								{/if}
								{#if work.returnable}
									<Col>
										<Button
											on:click={(e) => {
												e.preventDefault();
												_sendbackWork();
											}}
										>
											Sendback
										</Button>
									</Col>
								{/if}
							</Row>
						</Container>
					{:else}
						{#if work.revocable}
							<Container class="mt-3 kfk-highlight-2">
								<Row>
									<Col>
										<Button
											on:click={(e) => {
												e.preventDefault();
												_revokeWork();
											}}
										>
											Revoke
										</Button>
									</Col>
								</Row>
							</Container>
						{/if}
						<Container class="mt-3 kfk-highlight-2">
							<Row>
								<Col>
									Done by: {work.doer}
								</Col>
								<Col>
									at: {work.doneat ? moment(work.doneat).format('LLLL') : ''}
								</Col>
								<Col />
							</Row>
						</Container>
					{/if}
				</Form>
			</Container>
			<Container class="mt-4"><h3>Workflow: {work.wf.wftitle}</h3></Container>
			<Container class="mt-2">
				<Container class="mt-2 ml-5 kfk-highlight-2 ">
					<Row cols={{ lg: 2, md: 2, sm: 1 }}>
						<Col>Started at: {work.wf.beginat ? moment(work.wf.begingat).format('LLLL') : ''}</Col>
						<Col>Started by: {work.wf.starter}</Col>
						<Col
							>Completed at: {work.wf.doneat
								? moment(work.wf.doneat).format('LLLL')
								: 'Still running'}</Col
						>
					</Row>
				</Container>
			</Container>
			<Container class="mt-2">
				<div><h3>Worklogs</h3></div>
				<!--div class="hstack gap-3">
					<div><h3>Worklogs</h3></div>
					<div class="border ms-auto">Second item</div>
					<div class="vr" />
					<div class="border">Third item</div>
				</div-->
			</Container>
			<Container class="mt-0 ml-5">
				{#each work.history as entry}
					<Container class="mt-2 ml-5 kfk-highlight-2 ">
						<Row cols={{ lg: 1, md: 1, sm: 1 }}>
							<Col>
								<div><b>{entry.title}</b></div>
								By: {entry.doer}
								at: {moment(entry.doneat).format('LLLL')}
							</Col>
							{#if entry.route}
								<Col>
									Decision: <b> {entry.route} </b>
								</Col>
							{/if}
						</Row>
						<Row cols={{ lg: 1, md: 1, sm: 1 }}>
							<Col>
								Status: {entry.status}
							</Col>
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
					</Container>
				{/each}
			</Container>
			{@html work_html}
			<code>
				<pre>
			{JSON.stringify(user, null, 2)}
			{JSON.stringify(work, null, 2)}
				</pre>
			</code>
		</TabPane>
		<TabPane tabId="json" tab="JSON">
			<Row class="mt-3">
				<Col>
					<p>
						If you would render workitem in your our application, you may retrieve the workitem data
						in JSON format first. Following we show how to get workitem info from 'work/info'
						endpoint with Axios, you may use any other HTTP client tool.
					</p>
					<p>Check HyperFlow API document for reference.</p>
					<figure>
						<figcaption><h5>Get JSON with Axios</h5></figcaption>
						<pre> <code>
					{axios_code}
						</code> </pre>
					</figure>
				</Col>
			</Row>
			<Row cols="1">
				<Col class="d-flex justify-content-center mt-5">
					<div>The JSON of</div>
				</Col>
				<Col class="d-flex justify-content-center">
					<div><b>{work.workid}</b></div>
				</Col>
			</Row>
			<Row>
				<Col class="d-flex justify-content-center">
					<div>
						<pre>
				{work_json_string}
		</pre>
					</div>
				</Col>
			</Row>
		</TabPane>
		<TabPane tabId="html" tab="HTML">
			<Row class="mt-3">
				<Col>
					If you would embed pre-renderred workitem form in your application page, you may just:
					<ul>
						<li>Get pre-renderred HTML with API.</li>
						<li>Embed the HTML into your page</li>
						<li>Include bootstrape css and hyperflow css into your html</li>
					</ul>
					<p>Check HyperFlow API document for reference.</p>

					<figure>
						<figcaption><h5>Get pre-renderred HTML with Axios</h5></figcaption>
						<pre> <code>
					{axios_code_get_html}
						</code> </pre>
					</figure>
					<figure>
						<figcaption><h5>jQuery example: Embed the HTML into your page</h5></figcaption>
						<pre> <code>
					{html_example_jquery}
						</code> </pre>
					</figure>
					<figure>
						<figcaption><h5>Svelte example: Embed the HTML into your page</h5></figcaption>
						<pre> <code>
					{html_example_svelte}
						</code> </pre>
					</figure>
				</Col>
			</Row>
			<Row cols="1">
				<Col class="d-flex justify-content-center mt-5">
					<div>The HTML of</div>
				</Col>
				<Col class="d-flex justify-content-center">
					<div><b>{work.workid}</b></div>
				</Col>
			</Row>
			<Row>
				<Col class="d-flex justify-content-center">
					<textarea rows="10" cols="50" class="kfk-code-area"> {work_html} </textarea>
				</Col>
			</Row>
		</TabPane>
		<TabPane tabId="iframe" tab="iFrame">
			<Row class="mt-3">
				<Col>
					If you would embed pre-renderred workitem form in your application with iFrame, you may
					just:
					<ul>
						<li>Include an iframe tag with src to workitem url</li>
					</ul>
					<p>Check HyperFlow API document for reference.</p>

					<figure>
						<figcaption><h5>Include an ifrmae into your HTML</h5></figcaption>
						<pre> <code>
                {iframe_html_code}
						</code> </pre>
					</figure>
				</Col>
			</Row>
		</TabPane>
	</TabContent>
</Container>
