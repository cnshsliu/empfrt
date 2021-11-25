<script context="module" lang="ts">
	export async function load({ session }) {
		return {
			props: {
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import { whichTabStore } from '$lib/empstores';
	import { get } from 'svelte/store';
	import { title } from '$lib/title';
	import type { EmpResponse, WhichTab } from '$lib/types';
	import DocQuickStart from './docs/_Quickstart.svelte';
	import DocIntroduction from './docs/_Introduction.svelte';
	import {
		Container,
		Row,
		Col,
		Card,
		CardHeader,
		CardTitle,
		CardBody,
		CardText,
		TabContent,
		TabPane,
		CardFooter,
		CardSubtitle,
		Input
	} from 'sveltestrap';
	$title = 'HyperFlow';
	export let user;
	let tplid;

	let whichTab: WhichTab = get(whichTabStore);
	async function showTab(tabId) {
		whichTab = get(whichTabStore);
		if (whichTab) {
			whichTab['home'] = tabId;
			whichTabStore.set(whichTab);
		}
	}

	import { onMount } from 'svelte';
	onMount(async () => {
		if (!whichTab['home']) {
			await showTab('quickstart');
		}
	});
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<Container class="mt-3 text-center">
	<Row cols="1">
		<Col>
			<div class="fs-4">
				Integerate both human works and computer system tasks with <br />Metatocome, <br />a
				Hyper-automation Platform as a Service. <br /> Complicated workflow system can be built with
				any modern language you like,<br />such as Javascript, Java, Python, C# etc.
			</div>
		</Col>
	</Row>
</Container>
<Container class="mt-5">
	<TabContent
		on:tab={(e) => {
			showTab(e.detail);
		}}
	>
		<TabPane
			tabId="introduction"
			tab="Introduction"
			active={!whichTab || whichTab['home'] === 'introduction'}
		>
			<DocIntroduction />
		</TabPane>
		<TabPane
			tabId="quickstart"
			tab="Quick Start"
			active={!whichTab || whichTab['home'] === 'quickstart'}
		>
			<DocQuickStart />
		</TabPane>
		<TabPane
			tabId="devguide"
			tab="Application Developer Guide"
			active={!whichTab || whichTab['home'] === 'devguide'}
		>
			<h2>Quick start</h2>
		</TabPane>
		<TabPane tabId="sdk" tab="SDK" active={!whichTab || whichTab['home'] === 'sdk'}>
			<h2>Quick start</h2>
		</TabPane>
	</TabContent>
</Container>
