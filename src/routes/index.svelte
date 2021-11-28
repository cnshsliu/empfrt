<script context="module" lang="ts">
	export const ssr = false;
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
	import type { WhichTab } from '$lib/types';
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
<main>
	<div class="bd-masthead mb-3" id="content">
		<div class="container px-4 px-md-3">
			<div class="row align-items-lg-center">
				<div class="col-8 mx-auto col-md-4 order-md-2 col-lg-5">
					<img
						alt="mtc"
						src="/metatocome.png"
						width="600"
						height="533"
						class="img-fluid mb-3 mb-md-0"
					/>
				</div>
				<div class="col-md-8 order-md-1 col-lg-7 text-center text-md-start">
					<h1 class="mb-3">Develop advanced Hyper-Automation applications with Metatocome</h1>
					<p class="lead mb-4">
						Metatocome is a Hyper-Automation engine online service which can be used to automate
						everything in an organization that can be automated. Developers can build advanced
						wokflow based applications that dispatch tasks to both human and computer systems with
						any modern computer languages.
					</p>

					<div class="d-flex flex-column flex-md-row">
						<a
							href="/docs/5.1/getting-started/introduction/"
							class="btn btn-lg btn-bd-primary mb-3 me-md-3"
						>
							Get started
						</a>
						{#if user}
							<a href="/seeitwork" class="btn btn-lg btn-outline-secondary mb-3">
								See it works now.
							</a>
						{:else}
							<a href="/register" class="btn btn-lg btn-outline-secondary mb-3"> Sign up </a>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="container masthead-followup px-4 px-md-3">
		<section class="row mt-5 pb-md-4 align-items-stretch">
			<div class="col-12 col-md-6 col-lg-3 pb-3">
				<div class="card h-100">
					<div class="card-body">
						<h5 class="card-title text-primary text-opacity-75">
							<i class="fs-1 bi-cpu" /> <span class="fs-1">E</span>ngine
						</h5>
						<hr />
						<!-- h6 class="card-subtitle mb-2 text-muted">Card subtitle</h6 -->
						<p class="card-text">
							Metatocome's core component is an advanced Workflow Engine running in the cloud.
							Developers can design, run, monitor workflow processes on this site, or develop fully
							customized UIs with the support of Metatocome APIs.
						</p>
					</div>
				</div>
			</div>
			<div class="col-12 col-md-6 col-lg-3 pb-3 ps-md-3">
				<div class="card h-100">
					<div class="card-body">
						<h5 class="card-title text-primary text-opacity-75">
							<i class="fs-1 bi-diamond-half" /> <span class="fs-1">H</span>yper
						</h5>
						<hr />
						<!-- h6 class="card-subtitle mb-2 text-muted">Card subtitle</h6 -->
						<p class="card-text">
							Metatocome can automate the process of any sort of entities, no matter they are human
							or computer system, from a integrated enterprise perspective. these entities take the
							role of "workers", Staff get their work instructions from worklist, system provide API
							endpoints Metatocome engine will call.
						</p>
					</div>
				</div>
			</div>
			<div class="col-12 col-md-6 col-lg-3 pb-3 ps-md-3">
				<div class="card h-100">
					<div class="card-body">
						<h5 class="card-title text-primary text-opacity-75">
							<i class="fs-1 bi-emoji-sunglasses" /> <span class="fs-1">E</span>asy
						</h5>
						<hr />
						<!-- h6 class="card-subtitle mb-2 text-muted">Card subtitle</h6 -->
						<p class="card-text">
							Integrate workflow into your application, web-based, iOS or Android APP, with SDK of
							any modern computer language.
						</p>
					</div>
				</div>
			</div>
			<div class="col-12 col-md-6 col-lg-3 pb-3 ps-md-3">
				<div class="card h-100">
					<div class="card-body">
						<h5 class="card-title text-primary text-opacity-75">
							<i class="fs-1 bi bi-file-earmark-lock" /> <span class="fs-1">S</span>ecure
						</h5>
						<hr />
						<!-- h6 class="card-subtitle mb-2 text-muted">Card subtitle</h6 -->
						<p class="card-text">
							Metatocome take the role of a pure collaboration engine running separatedly from other
							systems, and has separated authentication, and access control from enterprise's
							internal IT system. Metatocome use resource URI to refer to any internal or external
							IT resources.
						</p>
					</div>
				</div>
			</div>
		</section>
		<section class="row mt-5 pb-md-4 align-items-center">
			<div class="col-md-6">
				<div class="masthead-followup-icon d-inline-block mb-2 text-white bg-success">
					<i class="mx-2 bi-code" style="font-size: 2rem;" />
				</div>
				<span class="display-5 fw-normal ms-3">Demo Project</span>
				<p class="lead fw-normal">
					Clone Metatocome demo client application, use it as boilerplate of your own project or
					just play around with it.
				</p>
				<a class="btn btn-lg btn-outline-primary mb-3" href="/docs/5.1/getting-started/download/">
					Read more about demo application
				</a>
			</div>
			<div class="col-md-6 ps-md-5">
				<div class="highlight">
					<pre
						tabindex="0"
						class="chroma">
						<code class="language-sh" data-lang="sh">
							git clone https://github.com/liukehong/metatocomeapp
					</code></pre>
				</div>
			</div>
		</section>

		<section class="row mt-5 pb-md-4 align-items-center">
			<div class="col-12">
				<div class="masthead-followup-icon d-inline-block mb-2 text-white bg-primary">
					<i class="mx-2 bi-info-square-fill" style="font-size: 2rem;" />
				</div>
				<span class="display-5 fw-normal ms-3"> Help & Docs </span>
				<p class="lead fw-normal">
					Documents for developers, administrators, or users are ready in our libraries. Sometimes,
					you may find our Discord room is helpful.
				</p>
				<a href="https://icons.getbootstrap.com/" class="btn btn-lg btn-outline-primary mb-3">
					Quick start
				</a>
				<a href="https://icons.getbootstrap.com/" class="btn btn-lg btn-outline-primary mb-3">
					More docs
				</a>
				<a href="https://icons.getbootstrap.com/" class="btn btn-lg btn-outline-primary mb-3">
					Discord room
				</a>
			</div>
		</section>

		<section class="row mt-5 pb-md-4 align-items-stretch">
			<div class="col-12 text-center fs-1">Price Tiers</div>
			<div class="col-12 col-md-6 col-lg-3 pb-3">
				<div class="card h-100">
					<div class="card-body">
						<h5 class="card-title">Free Tier</h5>
						<div class="card-subtitle mb-2 text-primary">
							<span class="fs-6">$</span>
							<span class="fs-3">0</span>
							<span class="fs-6">/Month</span>
						</div>
						<div class="fs-6">forever</div>
						<hr />
						<p class="fs-6 mt-3">for small team</p>
						<p class="fs-4">&lt;5 users</p>
						<p class="fs-4">&lt;1000 tasks/month</p>
						<a href="https://icons.getbootstrap.com/" class="btn btn-lg btn-outline-primary mb-3">
							Start Free
						</a>
					</div>
				</div>
			</div>
			<div class="col-12 col-md-6 col-lg-3 pb-3">
				<div class="card h-100">
					<div class="card-body">
						<h5 class="card-title">Tier 1</h5>
						<div class="card-subtitle mb-2 text-primary">
							<span class="fs-6">$</span>
							<span class="fs-3">1000</span>
							<span class="fs-6">/Month</span>
						</div>
						<div class="fs-6">for now</div>
						<hr />
						<p class="fs-6 mt-3">for small team</p>
						<p class="fs-4">&lt;5 users</p>
						<p class="fs-4">&lt;200 tasks/month</p>
						<a href="https://icons.getbootstrap.com/" class="btn btn-lg btn-outline-primary mb-3">
							Start Free
						</a>
					</div>
				</div>
			</div>
			<div class="col-12 col-md-6 col-lg-3 pb-3">
				<div class="card h-100">
					<div class="card-body">
						<h5 class="card-title">Tier 2</h5>
						<div class="card-subtitle mb-2 text-primary">
							<span class="fs-6">$</span>
							<span class="fs-3">2000</span>
							<span class="fs-6">/Month</span>
						</div>
						<div class="fs-6">for now</div>
						<hr />
						<p class="fs-6 mt-3">for small team</p>
						<p class="fs-4">&lt;5 users</p>
						<p class="fs-4">&lt;200 tasks/month</p>
						<a href="https://icons.getbootstrap.com/" class="btn btn-lg btn-outline-primary mb-3">
							Start Free
						</a>
					</div>
				</div>
			</div>
			<div class="col-12 col-md-6 col-lg-3 pb-3">
				<div class="card h-100">
					<div class="card-body">
						<h5 class="card-title">Tier 3</h5>
						<div class="card-subtitle mb-2 text-primary">
							<span class="fs-6">$</span>
							<span class="fs-3">10000</span>
							<span class="fs-6">/Year</span>
						</div>
						<div class="fs-6">for now</div>
						<hr />
						<p class="fs-6 mt-3">for small team</p>
						<p class="fs-4">&lt;5 users</p>
						<p class="fs-4">&lt;200 tasks/month</p>
						<a href="https://icons.getbootstrap.com/" class="btn btn-lg btn-outline-primary mb-3">
							Start Free
						</a>
					</div>
				</div>
			</div>
			<div class="col-12 pb-3">
				<div class="card h-100">
					<div class="card-body">
						<h5 class="card-title">Private Deployment</h5>
						<p>
							We could deploy Metatocome full stack to your own server, no matter it's on cloud or
							on premise
						</p>
						<a href="https://icons.getbootstrap.com/" class="btn btn-lg btn-outline-primary mb-3">
							Contact us for details
						</a>
					</div>
				</div>
			</div>
		</section>

		<section class="row my-5 pb-md-4 align-items-center">
			<div class="col-12">
				<div class="d-inline-block mb-2 text-white bg-info">
					<i class="bi-piggy-bank mx-2" style="font-size: 2rem;" />
				</div>
				<span class="display-5 fw-normal ms-3"> Referral Program </span>
				<p class="lead fw-normal">
					Join our referral program to get 10% of paied tier subscription for 3 years, or 5% of
					private deployment order you refer to us.
				</p>
				<p>
					Send your referrer code to your known friends, once they register their account on
					metatocome.com, they could provid your referrer code to us, within 3 years, at the end of
					each subscription period, we will reward 10% of the subscription order value to you.
				</p>
				<p>
					If it's a private deployment, you will get your 5% order value reward right after the
					client pay.
				</p>
				<a href="https://themes.getbootstrap.com/" class="btn btn-lg btn-outline-primary mb-3">
					Get your referrer code
				</a>
			</div>
		</section>
	</div>
</main>
