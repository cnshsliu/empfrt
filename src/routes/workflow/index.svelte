<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		return {
			props: {
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import { _ } from '$lib/i18n';
	import * as Utils from '$lib/utils';
	import { API_SERVER } from '$lib/Env';
	import TagPicker from '$lib/TagPicker.svelte';
	import Parser from '$lib/parser';
	import { onMount } from 'svelte';
	import { filterStorage } from '$lib/empstores';
	import * as api from '$lib/api';
	import RemoteTable from './RemoteTable.svelte';
	import ExtraFilter from '$lib/form/ExtraFilter.svelte';
	import type { User } from '$lib/types';
	import { Button, Container, Row, Col } from 'sveltestrap';
	import { ClientPermControl } from '$lib/clientperm';
	export let menu_has_form = false;
	export let user: User;
	export let form_status = { create: false, search: false, sort: false, import: false };
	import { title } from '$lib/title';
	$title = 'Process';
	$: token = user.sessionToken;
	let theExtraFilter: any;
	let filter_template;
	let theRemoteTable;
	let files;
	let theSearchForm;
	let tplidImport;
	let currentTags = [];

	const setTemplates = async function () {
		let existingTags = $filterStorage.tplTag;
		if (Parser.isEmpty(existingTags)) {
			existingTags = '';
		}
		let existingArr = existingTags.split(';');
		currentTags = existingArr;
		let tmp = await api.post(
			'template/tplid/list',
			{ tagsForFilter: currentTags },
			user.sessionToken
		);
		templates = tmp.map((x) => x.tplid);
	};

	const clearTag = async function () {
		currentTags = [];
		$filterStorage.tplTag = '';
		let tmp = await api.post('template/tplid/list', {}, user.sessionToken);
		templates = tmp.map((x) => x.tplid);
		theRemoteTable.refresh();
	};

	const useThisTag = async function (tag, appendMode = false) {
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
		$filterStorage.tplid = '';
		let tmp = await api.post(
			'template/tplid/list',
			{ tagsForFilter: currentTags },
			user.sessionToken
		);
		templates = tmp.map((x) => x.tplid);
		theRemoteTable.refresh();
	};

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

	function checkStore() {
		if (Utils.isBlank($filterStorage.doer)) {
			$filterStorage.doer = user.email;
		}
		if (Utils.isBlank($filterStorage.wfStatus)) {
			$filterStorage.wfStatus = 'ST_RUN';
		}
		if (Utils.isBlank($filterStorage.workStatus)) {
			$filterStorage.workStatus = 'ST_RUN';
		}
		if ($filterStorage.workTitlePattern === undefined) {
			$filterStorage.workTitlePattern = '';
		}
		if ($filterStorage.wfTitlePattern === undefined) {
			$filterStorage.wfTitlePattern = '';
		}
	}

	function refreshList() {
		checkStore();
		theRemoteTable && theRemoteTable.refresh();
	}

	let templates = [];
	onMount(async () => {
		let existingTags = $filterStorage.tplTag;
		if (Parser.isEmpty(existingTags)) {
			existingTags = '';
		}
		let existingArr = existingTags.split(';');
		currentTags = existingArr;

		await setTemplates();
		refreshList();
	});

	function filterStatusChanged(event) {
		$filterStorage.wfStatus = event.detail;
		refreshList();
	}
</script>

<Container class="p-2">
	<div class="d-flex">
		<div class="flex-shrink-0 fs-3">
			{$_('title.workflow')}
		</div>
		<div class="ms-5 align-self-center flex-grow-1">&nbsp;</div>
		<div class="justify-content-end flex-shrink-0">
			<Button
				color="primary"
				on:click={() => {
					$filterStorage.wfStatus = 'ST_RUN';
					$filterStorage.tplid = '';
					$filterStorage.wfTitlePattern = '';
					$filterStorage.tspan = '1w';
					clearTag();
					theExtraFilter.reset();
					theRemoteTable.reset();
					refreshList();
				}}
				class="m-0 p-1"
			>
				{$_('button.resetQuery')}
			</Button>
		</div>
	</div>
	<TagPicker {currentTags} {useThisTag} {clearTag} />
</Container>
<Container class="mb-3">
	<svelte:component
		this={ExtraFilter}
		bind:this={theExtraFilter}
		{user}
		on:filterStatusChange={filterStatusChanged}
		on:filterTemplateChange={refreshList}
		on:filterStarterChange={refreshList}
		fields="{['starter', 'statuses', 'templatepicker']},"
		object_type="processes"
		statuses={[
			{ value: 'All', label: $_('status.All') },
			{ value: 'ST_RUN', label: $_('status.ST_RUN') },
			{ value: 'ST_PAUSE', label: $_('status.ST_PAUSE') },
			{ value: 'ST_DONE', label: $_('status.ST_DONE') },
			{ value: 'ST_STOP', label: $_('status.ST_STOP') }
		]}
		{templates}
	/>
	<RemoteTable endpoint="workflow/search" {token} {user} bind:this={theRemoteTable} />
</Container>
