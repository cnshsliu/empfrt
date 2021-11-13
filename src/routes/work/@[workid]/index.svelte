<script context="module" lang="ts">
	import moment from 'moment';
	import 'moment/locale/zh-cn';
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
	import { API_SERVER, EMP_SERVER } from '$lib/Env';
	import type { User, Work } from '$lib/types';
	import { TabContent, TabPane } from 'sveltestrap';
	import { scale } from 'svelte/transition';
	import { get } from 'svelte/store';
	import type { WhichTab } from '$lib/types';
	import { whichTabStore } from '$lib/empstores';
	import Parser from '$lib/parser';
	import { flip } from 'svelte/animate';
	import { title } from '$lib/title';
	import { Status } from '$lib/status';
	import { goto } from '$app/navigation';
	import WorkPage from './workpage.svelte';
	import * as api from '$lib/api';
	import { Container, Row, Col, Nav, Icon, NavItem, NavLink } from 'sveltestrap';
	import { ClientPermControl } from '$lib/clientperm';
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
	import { enhance } from '$lib/form';
	export let work: Work;
	export let user: User;
	export let mode: string;

	let radioGroup;

	const jq = jQuery;
	moment.locale('zh-CN');
	console.log(moment([2007, 0, 29]).toNow());
	let browser_locale = window.navigator.userLanguage || window.navigator.language;
	console.log(browser_locale);

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
	const iframe_src = `${EMP_SERVER}/work/@${work.workid}/iframe`;
	const iframe_html_code = `<iframe title="hyperflow_work_${work.workid}"
	src="${iframe_src}"></iframe>`;

	console.log('Mode=', mode);
	let iframe = false;
</script>

<Container>
	<div class="d-flex">
		<div class="flex-shrink-0">
			<h1>{work.title}</h1>
		</div>
		<div class="mx-5 align-self-center flex-grow-1">
			{moment(work.createdAt).toNow()}
		</div>
	</div>
</Container>
<Container>
	{#if ClientPermControl(user.perms, user.email, '*', '', 'admin')}
		<TabContent on:tab={(e) => (currentTab = '' + e.detail)}>
			<TabPane tabId="work" tab="Work" active>
				<WorkPage {work} {user} {iframe} />
			</TabPane>
			<TabPane tabId="json" tab="JSON">
				<Row class="mt-3">
					<Col>
						<p>
							If you would render workitem in your our application, you may retrieve the workitem
							data in JSON format first. Following we show how to get workitem info from 'work/info'
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
							Like below:
						</figure>
						<iframe style="width: 540px; height: 1170px;" title="hyperflow_work" src={iframe_src} />
					</Col>
				</Row>
			</TabPane>
		</TabContent>
	{:else}
		<WorkPage {work} {user} {iframe} />
	{/if}
</Container>
