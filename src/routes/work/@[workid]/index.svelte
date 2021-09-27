<script context="module" lang="ts">
	export const ssr = false;
	export async function load({ page, fetch, session }) {
		const workid = page.params.workid;
		const res = await fetch(`/work/@${workid}.json`);
		const res_html = await fetch(`/work/@${workid}/html.json`);

		const theWork = await res.json();
		const theHtml = await res_html.json();
		console.log(theHtml);

		return {
			props: {
				work: theWork,
				work_html: theHtml.html,
				user: session.user,
				token: session.user.sessionToken
			}
		};
	}
</script>

<script lang="ts">
	import jQuery from 'jquery';
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

	let radioGroup;

	const jq = jQuery;

	$title = work.title;

	$: work_json_string = JSON.stringify(work, null, 2);
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
src="${API_SERVER}/work/iframe/${work.workid}">
</iframe>`;
</script>

<Container>
	<h5>Current state: {currentTab}</h5>
	<TabContent on:tab={(e) => (currentTab = '' + e.detail)}>
		<TabPane tabId="work" tab="Work" active>
			<Container id={'workitem_' + work.workid}>
				<Form>
					<Row cols={{ lg: 3, md: 2, sm: 1 }}>
						{#each work.kvarsArr as kvar (kvar.name)}
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
											value={kvar.value}
											id={kvar.id}
											placeholder={kvar.placeholder}
										/>
									{:else}
										<Input type={kvar.type} name={kvar.name} id={kvar.id} value={kvar.value}>
											{#each kvar.options as option}
												<option>{option}</option>
											{/each}
										</Input>
									{/if}
								</FormGroup>
							</Col>
						{/each}
						<Col>
							<FormGroup>
								<Label for="exampleSelect">Select</Label>
								<Input type="select" name="select" id="exampleSelect" value="4">
									AAA<option value="3" selected>1</option>
									<option>2</option>
									<option>3</option>
									<option>4</option>
									<option>5</option>
								</Input>
							</FormGroup>
						</Col>
					</Row>
					<input type="hidden" name="workid" value={work.workid} />
					<Button color="primary">Do it</Button>
					<Button>Sendback</Button>
					<Button>Sendback</Button>
				</Form>
			</Container>
			{@html work_html}
			{JSON.stringify(work.kvarsArr, null, 2)}
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
