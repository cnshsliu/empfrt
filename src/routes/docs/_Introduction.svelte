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

<div class="content">
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

	<p>
		Once you have a Metatocome user account (<a href="/register">register now</a>), you may create a
		workflow template, start it, manage it (monitor it, pause it, resume it or stop it). The
		workflow will run through nodes in your designed template, dispatch node tasks to human or
		system, receive feedback from human or system, decide what should be the next step depending on
		the feedback or the returning result of embedded script codes. Repeat these steps until it come
		to the template's END node.
	</p>

	<p>
		Besides administration tools for administators, Metatocme also provides Out-of-the-box <a
			href="/work"
		>
			worklist and work form
		</a> user interface for normal end-users to check their worklist and do their assigned works. Evern
		so, enterprise developers may find it is necessary to provide end-users their own applications which
		take Metatocome as the core automation engine in their organizaiton. Compared with a human's body
		which has complicated functionality and sensing organs and cells which are all connected with human's
		nervous system, an organization also has complicated functionalities, systems, applicaitons, departments
		and people, Metatocome acts as the neural system of organization to linkup all these parts, dispatch
		right task to the right participant at the right time.
	</p>

	<p>
		Metatocome provides restful APIs and SDKs for developers. There used to be backend developers'
		(normally, Java developers) privilege to develop enterprise-level workflow applications, with
		Metatocome, any developer using any modern computer language can develop advanced enterprise
		applications. For example, a frontend Web developers can quickly complete a full-fledged
		workflow based application with any web development technology they familiar and Metatocome
		Javascript SDK, mobile developers can also build enterprise-level workflow applications easily
		with appropriate SDK or APIs. see <a href="">Application Developer Guide</a> for details.
	</p>
	<div class="text-center">
		<img src="/help/architecture.svg" alt="hyper_automation_illustration" />
	</div>

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
