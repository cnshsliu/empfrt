<script context="module" lang="ts">
	let TimeTool = null;
	export async function load({ page, fetch, session }) {
		TimeTool = (await import('$lib/TimeTool')).default;
		try {
			return {
				props: {
					user: session.user
				}
			};
		} catch (err) {
			return {
				props: {
					user: session.user
				}
			};
		}
	}
</script>

<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import Parser from '$lib/parser';
	import { onMount } from 'svelte';
	import RemoteTable from './RemoteTable.svelte';
	import ErrorProcessor from '$lib/errorProcessor';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import type { WhichTab } from '$lib/types';
	import { whichTabStore } from '$lib/empstores';
	import { filterStore } from '$lib/empstores';
	import { ClientPermControl } from '$lib/clientperm';
	import { TabContent, Badge, Fade, Card, TabPane, FormGroup, Label, Input } from 'sveltestrap';
	import type { User } from '$lib/types';
	import { session } from '$app/stores';
	import { Container, Row, Col, Icon, Button, Nav, NavLink } from 'sveltestrap';
	import { enhance } from '$lib/form';
	export let menu_has_form = false;
	export let user: User;
	export let lastSearchCondition: string = '';
	export let form_status = { create: false, search: false, sort: false, import: false };
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	$: token = user.sessionToken;
	let theRemoteTable;
	function hide_all_form() {
		Object.keys(form_status).forEach((key) => {
			form_status[key] = false;
		});
		menu_has_form = false;
	}
	function show_form(form_name: string) {
		hide_all_form();
		form_status[form_name] = true;
		menu_has_form = true;
	}

	let files;
	let tplidImport;

	let urls = {
		create: `${API_SERVER}/template/create`,
		search: `${API_SERVER}/template/search`
	};

	function upload(e) {
		e.preventDefault();
		if (ClientPermControl(user.perms, user.email, 'template', '', 'create') === false) {
			setFadeMessage("You don't have upload permission");
			return;
		}
		const formData = new FormData();
		formData.append('tplid', tplidImport);
		formData.append('file', files[0]);
		const upload = fetch(`${API_SERVER}/template/import`, {
			method: 'POST',
			headers: {
				Authorization: user.sessionToken
			},
			body: formData
		})
			.then((response) => response.json())
			.then(async (result) => {
				console.log('Success:', result);
				//templates = [result, ...templates];
				theRemoteTable.rows = [result, ...theRemoteTable.rows];
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
	let allTags: any = {
		org: [],
		mine: []
	};
	let whichTab: WhichTab = get(whichTabStore);
	async function showTab(tabId) {
		whichTab = get(whichTabStore);
		if (whichTab) {
			whichTab['template'] = tabId;
			whichTabStore.set(whichTab);
		}
		if (tabId === 'tags') {
			await reloadTags();
		}
	}

	export async function reloadTags() {
		console.log('update my tags');
		allTags.org = await api.post('tag/org', {}, user.sessionToken);
		allTags.mine = await api.post('tag/list', { objtype: 'template' }, user.sessionToken);
		console.log(allTags);
	}

	let fade_message = '';
	let fade_timer: any;
	function setFadeMessage(message: string, time = 2000) {
		fade_message = message;
		if (fade_timer) clearTimeout(fade_timer);
		fade_timer = setTimeout(() => {
			fade_message = '';
		}, time);
	}
	let recentTemplates = [];

	let currentTag = '';
	const useThisTag = function (tag) {
		currentTag = tag;
		$filterStore.tplTag = tag;
		console.log('Use this tag', new Date());
		theRemoteTable.tag = tag;
		theRemoteTable.refresh();
		console.log(tag);
	};
	onMount(() => {
		if (localStorage) {
			recentTemplates = JSON.parse(localStorage.getItem('recentTemplates') ?? JSON.stringify([]));
		}
		currentTag = $filterStore.tplTag;
		useThisTag(currentTag);
	});
</script>

<Container class="mt-1">
	<div class="d-flex">
		<div class="flex-shrink-0 fs-3">Templates</div>
		<div class="ms-5 align-self-center flex-grow-1">Defines how workflow would be running</div>
		<div class="justify-content-end flex-shrink-0">
			<Button
				on:click={async () => {
					$filterStore.tplTitlePattern = '';
					await theRemoteTable.reset();
					useThisTag('');
				}}
				class="m-0 p-1"
			>
				Reset Query
			</Button>
		</div>
	</div>
</Container>
<Container>
	<TabContent
		class="kfk-tab-menu pb-2"
		on:tab={(e) => {
			showTab(e.detail);
		}}
	>
		<TabPane tabId="home" active={!whichTab || whichTab['template'] === 'home'}>
			<span slot="tab">
				<Icon name="code-square" />
				Recent
			</span>
			<Container class="my-2">
				<span>Recent started:</span>
				{#each recentTemplates as aTplid}
					<Button
						class="mx-1 badge bg-info text-dark"
						on:click={(e) => {
							e.preventDefault();
							goto(`template/start?tplid=${aTplid}`, { replaceState: false });
						}}
					>
						{aTplid}
					</Button>
				{/each}
			</Container>
		</TabPane>
		<TabPane tabId="tags" active={whichTab && whichTab['template'] === 'tags'}>
			<span slot="tab">
				<Icon name="tags" />
				Tags
			</span>
			<Container>
				<div class="d-flex">
					<div class="w-100">
						<Row class="mb-2">
							<Col class="d-flex justify-content-center">
								{#each allTags.org as tag}
									{#if currentTag === tag}
										<Button
											color="primary"
											class="mx-1 badge text-white"
											on:click={(e) => {
												e.preventDefault();
												useThisTag(tag);
											}}
										>
											{tag}
										</Button>
									{:else}
										<Button
											color="secondary"
											class="mx-1 badge text-white "
											on:click={(e) => {
												e.preventDefault();
												useThisTag(tag);
											}}
										>
											{tag}
										</Button>
									{/if}
								{/each}
							</Col>
						</Row>
						<Row>
							<Col class="d-flex justify-content-center">
								{#each allTags.mine as tag}
									{#if currentTag === tag}
										<Button
											size="sm"
											color="primary"
											class="mx-1 badge kfk-round text-white"
											on:click={(e) => {
												e.preventDefault();
												useThisTag(tag);
											}}
										>
											{tag}
										</Button>
									{:else}
										<Button
											size="sm"
											color="secondary"
											class="mx-1 badge kfk-round text-white"
											on:click={(e) => {
												e.preventDefault();
												useThisTag(tag);
											}}
										>
											{tag}
										</Button>
									{/if}
								{/each}
							</Col>
						</Row>
					</div>
					<div class="flex-shrink-1">
						<Button
							color="primary"
							on:click={(e) => {
								e.preventDefault();
								useThisTag('');
							}}
						>
							See All
						</Button>
					</div>
				</div>
			</Container>
		</TabPane>
		{#if user.perms && ClientPermControl(user.perms, user.email, 'template', '', 'create')}
			<TabPane tabId="create" active={whichTab && whichTab['template'] === 'create'}>
				<span slot="tab">
					<Icon name="plus-circle" />
					Create
				</span>
				<form
					class="new"
					action={urls.create}
					method="post"
					use:enhance={{
						preCheck: () => {
							return ClientPermControl(user.perms, user.email, 'template', '', 'create');
						},
						token: user.sessionToken,
						result: async (res, form) => {
							const created = await res.json();
							/* templates = [created, ...templates]; */
							lastSearchCondition = created.tplid;
							theRemoteTable.rows = [created, ...theRemoteTable.rows];
							theRemoteTable.rowsCount = theRemoteTable.rowsCount + 1;
							form.reset();
							//form_status['create'] = false;
						},
						error: async (res, error, form) => {
							let retError = await res.json();
							let tmp = ErrorProcessor.setError(retError.errors, '<br />');
							$session.errors = tmp;
							setTimeout(() => {
								$session.errors = '';
							}, 2000);
						}
					}}
				>
					<Container class="my-3">
						<div class="d-flex">
							<div class="form-floating">
								<input
									name="tplid"
									class="form-control"
									id="input-tplid"
									aria-label="Create template"
									placeholder="New template name"
								/>
								<label for="input-tplid">Template Name</label>
							</div>
							<div class=" form-floating flex-grow-1">
								<input
									name="tags"
									id="input-tags"
									class="w-100 form-control"
									aria-label="template tags"
									placeholder="tags delimiter with space/;/,"
								/>
								<label for="input-tags">Tags delimitered by spaces/;/,</label>
							</div>
							<div>
								<Button type="submit" class="h-100" color="primary">Create</Button>
							</div>
						</div>
					</Container>
				</form>
			</TabPane>
			<TabPane tabId="import" active={whichTab && whichTab['template'] === 'import'}>
				<span slot="tab">
					<Icon name="cloud-upload" />
					Import
				</span>
				<form class="new" enctype="multipart/form-data">
					<Container class="mt-3">
						<div class="d-flex">
							<div class="form-floating flex-grow-1">
								<input
									name="tplid"
									id="input-tplid"
									placeholder="New template name"
									class="form-control"
									bind:value={tplidImport}
								/>
								<label for="input-tplid">Template Name</label>
							</div>
							<div class="form-floating">
								<input name="file" id="input-file" type="file" class="form-control" bind:files />
								<label for="input-file">Select file</label>
							</div>
							<Button on:click={upload} color="primary">Import</Button>
						</div>
					</Container>
				</form>
			</TabPane>
		{/if}
	</TabContent>
</Container>
<Container class="mt-3 kfk-result-list">
	<Row>
		<Col>
			<RemoteTable
				endpoint="template/search"
				{token}
				{user}
				bind:this={theRemoteTable}
				{TimeTool}
				{reloadTags}
			/>
		</Col>
	</Row>
</Container>
<Fade isOpen={fade_message != ''}>
	<Card body>
		{fade_message}
	</Card>
</Fade>
