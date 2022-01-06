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
	import { _ } from '$lib/i18n';
	import { API_SERVER } from '$lib/Env';
	import Parser from '$lib/parser';
	import { onMount } from 'svelte';
	import RemoteTable from './RemoteTable.svelte';
	import ErrorProcessor from '$lib/errorProcessor';
	import { TagStorage } from '$lib/empstores';
	import TagPicker from '$lib/TagPicker.svelte';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import type { WhichTab } from '$lib/types';
	import { whichTabStorage } from '$lib/empstores';
	import { filterStorage } from '$lib/empstores';
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
	let showform = '';

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
	let whichTab: WhichTab = get(whichTabStorage);
	async function showTab(tabId) {
		whichTab = get(whichTabStorage);
		if (whichTab) {
			whichTab['template'] = tabId;
			whichTabStorage.set(whichTab);
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
		$TagStorage = allTags;
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

	let currentTags = [];
	const clearTag = function () {
		currentTags = [];
		$filterStorage.tplTag = '';
		if (theRemoteTable) {
			theRemoteTable.tagsForFilter = [];
			theRemoteTable.refresh();
		}
	};
	const useThisTag = function (tag, appendMode = false) {
		if (appendMode) {
			let existingTags = $filterStorage.tplTag;
			if (Parser.isEmpty(existingTags)) {
				existingTags = '';
			}
			let existingArr = existingTags.split(';');
			if (existingArr.includes(tag)) {
				currentTags = existingArr.filter((x) => x !== tag);
			} else {
				let newTags = existingTags + ';' + tag;
				currentTags = newTags.split(';').filter((x) => x.length > 0);
			}
		} else {
			if (tag.trim().length > 0) currentTags = [tag];
			else currentTags = [];
		}
		$filterStorage.tplTag = currentTags.join(';');
		theRemoteTable.tagsForFilter = currentTags;
		theRemoteTable.refresh();
	};
	onMount(() => {
		if (localStorage) {
			recentTemplates = JSON.parse(localStorage.getItem('recentTemplates') ?? JSON.stringify([]));
		}
		useThisTag('', true);
	});
</script>

<Container class="p-2">
	<div class="d-flex">
		<div class="flex-shrink-0 fs-3">
			{$_('title.template')}
		</div>
		<div class="ms-5 align-self-center flex-grow-1">&nbsp;</div>
		<div class="justify-content-end flex-shrink-0">
			<Button
				on:click={async () => {
					showform = 'create';
				}}
				class="m-0 p-1"
			>
				{$_('button.create')}
			</Button>
			<Button
				on:click={async () => {
					showform = 'import';
				}}
				class="m-0 p-1"
			>
				{$_('button.import')}
			</Button>
			<Button
				color="primary"
				on:click={async () => {
					$filterStorage.tplTitlePattern = '';
					showform = '';
					clearTag();
					if (theRemoteTable) await theRemoteTable.reset();
				}}
				class="m-0 p-1"
			>
				{$_('button.resetQuery')}
			</Button>
		</div>
	</div>
</Container>
{#if showform === 'create'}
	{#if user.perms && ClientPermControl(user.perms, user.email, 'template', '', 'create')}
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
					lastSearchCondition = created.tplid;
					theRemoteTable.rows = [created, ...theRemoteTable.rows];
					theRemoteTable.rowsCount = theRemoteTable.rowsCount + 1;
					form.reset();
					$filterStorage.author = user.email;
					$filterStorage.tplTitlePattern = '';
					//clearTag();
					//if (theRemoteTable) await theRemoteTable.reload();
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
			<Container class="my-3" style="max-width:400px;">
				<Row cols="1" class="mb-5">
					<Col>
						<div class="form-floating flex-fill">
							<input
								name="tplid"
								class="form-control"
								id="input-tplid"
								aria-label="Create template"
								placeholder="New template name"
							/>
							<label for="input-tplid">
								{$_('template.create.name')}
							</label>
						</div>
					</Col>
					<Col class="mt-2">
						<div class="form-floating flex-fill">
							<input
								name="tags"
								id="input-tags"
								class="w-100 form-control"
								aria-label="template tags"
								placeholder="tags delimiter with space/;/,"
							/>
							<label for="input-tags">
								{$_('template.create.tags')}
							</label>
						</div>
					</Col>
					<Col class="mb-5">
						<Row>
							<Col class="col-8">
								<Button type="submit" class="h-100 w-100 mt-3" color="primary">
									{$_('button.create')}
								</Button>
							</Col>
							<Col class="col-4">
								<Button
									class="h-100 w-100 mt-3"
									color="secondary"
									on:click={(e) => {
										e.preventDefault();
										e.stopPropagation();
										showform = '';
									}}
								>
									{$_('button.cancel')}
								</Button>
							</Col>
						</Row>
					</Col>
				</Row>
			</Container>
		</form>
	{:else}
		No Create Tempalte Permission
	{/if}
{:else if showform === 'import'}
	{#if user.perms && ClientPermControl(user.perms, user.email, 'template', '', 'create')}
		<form class="new" enctype="multipart/form-data">
			<Container class="my-3" style="max-width:400px;">
				<Row cols="1" class="mb-5">
					<Col>
						<div class="form-floating flex-fill">
							<input
								name="tplid"
								id="input-tplid"
								placeholder="New template name"
								class="form-control"
								bind:value={tplidImport}
							/>
							<label for="input-tplid">
								{$_('template.import.name')}
							</label>
						</div>
					</Col>
					<Col class="mt-2">
						<div class="form-floating flex-fill">
							<input name="file" id="input-file" type="file" bind:files />
						</div>
					</Col>
					<Col class="mb-5">
						<Row>
							<Col class="col-8">
								<Button on:click={upload} color="primary" class="h-100 w-100 mt-3">
									{$_('button.import')}
								</Button>
							</Col>
							<Col class="col-4">
								<Button
									class="h-100 w-100 mt-3"
									color="secondary"
									on:click={(e) => {
										e.preventDefault();
										e.stopPropagation();
										showform = '';
									}}
								>
									{$_('button.cancel')}
								</Button>
							</Col>
						</Row>
					</Col>
				</Row>
			</Container>
		</form>
	{:else}
		No Create Tempalte Permission
	{/if}
{/if}
<Container class="p-2">
	<TagPicker {currentTags} {useThisTag} {clearTag} />
	<Row class="mt-2">
		<Col class="d-flex justify-content-center">
			{$_('recent')}
			{#each recentTemplates as aTplid}
				<Button
					class="mx-1 badge bg-info text-dark border-info"
					on:click={(e) => {
						e.preventDefault();
						goto(`template/start?tplid=${aTplid}`, { replaceState: false });
					}}
				>
					{aTplid}
				</Button>
			{/each}
		</Col>
	</Row>
</Container>
<Container class="mt-1 kfk-result-list">
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
