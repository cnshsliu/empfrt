<script context="module">
	import { browser, dev } from '$app/env';

	// we don't need any JS on this page, though we'll load
	// it in dev so that we get hot module replacement...
	export const hydrate = dev;

	// ...but if the client-side router is already loaded
	// (i.e. we came here from elsewhere in the app), use it
	export const router = browser;

	// since there's no dynamic data here, we can prerender
	// it so that it gets served as a static asset in prod
	export const prerender = true;
	import { Card, CardBody, CardText, CardTitle } from 'sveltestrap';
</script>

<div id="saas" class="content">
	<h1>Playaround with Metatocome SaaS</h1>

	<p>
		Metatocome is a Wokflow Management PaaS service which which can be used to disptach tasks to
		human and computer systems, beyond the concept of workflow management system, Metatocome is a
		Hyper-automation system which can be used to automate everything in an organizaiton that can be
		auomated.
	</p>
	<div class="text-center">
		<img src="/help/hyper_automation_illustration.svg" alt="hyper_automation_illustration" />
	</div>

	<!-- TODO lose the @next! -->
	<pre>npm init svelte@next</pre>
	<img src="/help/architecture.svg" alt="hyper_automation_illustration" />
	<p>
		Once you have a Metatocome user account (<a href="/register">register now</a>), you may create a
		workflow template, start it, manage it (monitor it, pause it, resume it or stop it). The
		workflow will run through nodes in your designed template, dispatch node tasks to human or
		system, receive feedback from human or system, decide what should be the next step depending on
		the feedback or the returning result of embedded script codes. Repeat these steps until it come
		to the template's END node.
	</p>
	<p>
		The page you're looking at is purely static HTML, with no client-side interactivity needed.
		Because of that, we don't need to load any JavaScript. Try viewing the page's source, or opening
		the devtools network panel and reloading.
	</p>

	<p>
		The <a href="/todos">TODOs</a> page illustrates SvelteKit's data loading and form handling. Try using
		it with JavaScript disabled!
	</p>
	<Card>
		<CardBody>
			<CardTitle>Step 1: get your Metatocome account ready</CardTitle>
			<CardText>Register your user account: <a href="/register">click here</a></CardText>
			<p>
				The <a href="/todos">TODOs</a> page illustrates SvelteKit's data loading and form handling. Try
				using it with JavaScript disabled!
			</p>
			<CardTitle>Step 2: design a workflow</CardTitle>
			<CardText>Design a workflow template: <a href="/template">click here</a></CardText>
			<CardTitle>Step 3:</CardTitle>
			<CardText>Design a workflow template: <a href="/template">click here</a></CardText>
		</CardBody>
	</Card>
</div>

<style>
	.content {
		width: 100%;
	}
</style>
