<script context="module" lang="ts">
	import moment from 'moment';
	import 'moment/locale/zh-cn.js';
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
	import { flip } from 'svelte/animate';
	import { title } from '$lib/title';
	import { Status } from '$lib/status';
	import { goto } from '$app/navigation';
	import WorkPage from './workpage.svelte';
	import * as api from '$lib/api';
	import { Container, Row, Col, Nav, Icon, NavItem, NavLink } from 'sveltestrap';
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
	import { enhance } from '$lib/form';
	export let work: Work;
	export let user: User;
	export let mode: string;

	let radioGroup;

	const jq = jQuery;
	moment.locale('zh-CN');
	let browser_locale = window.navigator.userLanguage || window.navigator.language;

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
	const iframe_html_code = `<iframe title="hyperflow_work_${work.workid}"
src="${EMP_SERVER}/work/iframe/${work.workid}"></iframe>`;

	let iframe = true;
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
	<WorkPage {work} {user} {iframe} />
</Container>
