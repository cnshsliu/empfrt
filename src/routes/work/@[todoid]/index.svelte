<script context="module" lang="ts">
	import { post } from '$lib/utils';
	export const ssr = false;
	let TimeTool = null;
	export async function load({ page, fetch, session }) {
		TimeTool = (await import('$lib/TimeTool')).default;
		let todoid = page.params.todoid;
		let iframeMode = false;
		if (page.query.has('iframe')) {
			iframeMode = true;
		}
		const res = await fetch(`/work/@${todoid}.json`);
		const res_html = await fetch(`/work/@${todoid}/html.json`);

		const theWork = await res.json();
		const theHtml = await res_html.json();
		let delegators = [];
		try {
			let delegations = await post('/delegation/today');
			delegators = delegations.map((x) => x.delegator);
			if (delegators.includes(session.user.email) === false) {
				delegators.push(session.user.email);
			}
		} catch (e) {
			console.error(e);
		}

		return {
			props: {
				work: theWork,
				iframeMode: iframeMode,
				work_html: theHtml.html,
				user: session.user,
				delegators: delegators
			}
		};
	}
</script>

<script lang="ts">
	import { API_SERVER, MTC_SERVER } from '$lib/Env';
	import { _, mtcDate } from '$lib/i18n';
	import type { User, Work } from '$lib/types';
	import { TabContent, TabPane } from 'sveltestrap';
	import { title } from '$lib/title';
	import { onMount } from 'svelte';
	import WorkPage from './workpage.svelte';
	import { StatusClass, StatusLabel } from '$lib/status';
	import { Container, Row, Col } from 'sveltestrap';
	import { ClientPermControl } from '$lib/clientperm';
	export let work: Work;
	export let user: User;

	let radioGroup;
	let printing = false;

	let browser_locale = window.navigator.userLanguage || window.navigator.language;
	console.log(browser_locale);

	$title = work.title;

	$: work_json_string = JSON.stringify(work, null, 2);
	let axios_code = `
let res = await axios.post(
  '${API_SERVER}/work/info',
  {todoid: '${work.todoid}'}, 
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
  {todoid: '${work.todoid}'}, 
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
	const iframe_src = `${MTC_SERVER}/work/@${work.todoid}?iframe`;
	const iframe_html_code = `<iframe title="hyperflow_work_${work.todoid}"
	src="${iframe_src}"></iframe>`;

	export let iframeMode;

	onMount(() => {
		console.log('work onMount');
	});
</script>

<Container class="mt-2">
	<div class="d-flex">
		<div class="flex-shrink-0">
			<h3>
				{work.title}
				<sup>
					{work.nodeid === 'ADHOC' ? '/ adhoc' : ''}
					{#if work.rehearsal}
						/ <i class="bi-patch-check" /> Rehearsal
					{/if}
				</sup>
			</h3>
		</div>
		<div class="mx-3 align-self-center flex-grow-1">
			{TimeTool.fromNow(work.createdAt)}
		</div>
	</div>
</Container>
<Container class="mt-3 kfk-highlight-2">
	<Row>
		<!--Col>
						<span class="fw-bold fs-5">Starter:</span>
						<div class="fw-light">{work.wf.starter}</div>
					</Col-->
		<Col>
			<span class="fw-bold fs-5">
				{$_('todo.status')}
			</span>
			<div class={'fw-light ' + StatusClass(work.status)}>{StatusLabel(work.status)}</div>
		</Col>
		<Col>
			<span class="fw-bold fs-5">
				{$_('todo.owner')}
			</span>
			<div class="fw-light">{work.doer}</div>
		</Col>
		<Col>
			{#if work.doneat}
				<span class="fw-bold fs-5">
					{$_('todo.doneat')}
				</span>

				<div class="fw-light">{mtcDate(work.doneat)}</div>
			{/if}
		</Col>
		<Col />
	</Row>
	<WorkPage {work} {user} {iframeMode} />
</Container>
<Container class="mt-5">
	{#if printing === false && ClientPermControl(user.perms, user.email, '*', '', 'admin') && iframeMode === false}
		<TabContent>
			<TabPane tabId="developer" tab="For Developers" active />
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
						<div><b>{work.todoid}</b></div>
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
						<div><b>{work.todoid}</b></div>
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
	{/if}
</Container>
