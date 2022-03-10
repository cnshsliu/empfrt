<script context="module" lang="ts">
	import * as Utils from '$lib/utils';
	export async function load({ page, session }) {
		let iframeMode = false;
		if (page.query.has('iframe')) {
			iframeMode = true;
		}
		let delegators = [];
		try {
			let delegations = (await Utils.post('/delegation/today')) as any;
			delegators = delegations.map((x: any) => x.delegator);
			if (delegators.includes(session.user.email) === false) {
				delegators.push(session.user.email);
			}
		} catch (e) {}
		return {
			props: {
				user: session.user,
				iframeMode: iframeMode,
				delegators: delegators
			}
		};
	}
</script>

<script lang="ts">
	import { _ } from '$lib/i18n';
	import RemoteTable from './RemoteTable.svelte';
	import ExtraFilter from '$lib/form/ExtraFilter.svelte';
	import * as api from '$lib/api';
	import TagPicker from '$lib/TagPicker.svelte';
	import Parser from '$lib/parser';
	import type { User, Work } from '$lib/types';
	import { session } from '$app/stores';
	import { Container, Row, Col, Button, FormGroup, Input } from 'sveltestrap';
	import { onMount, onDestroy } from 'svelte';
	import { title } from '$lib/title';
	import { filterStorage } from '$lib/empstores';

	export let user: User;
	export let iframeMode;
	export let delegators;
	export const lastSearchCondition: string = '';
	$title = 'HyperFlow';
	$: token = user.sessionToken;
	let theRemoteTable;
	let theExtraFilter: any;
	let input_doer;
	let templates = [];

	//缺省情况下，使用用户邮箱，和ST_RUN

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

	let currentTags = [];
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

	//const jwt = auth && Buffer.from(auth.jwt, 'base64').toString('utf-8');

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
		theRemoteTable && theRemoteTable.refresh({});
	}
	function filterStatusChanged(event) {
		$filterStorage.workStatus = event.detail;
		refreshList();
	}
	function filterTemplateChanged(event) {
		refreshList();
	}

	onMount(async () => {
		let existingTags = $filterStorage.tplTag;
		if (Parser.hasValue(existingTags)) {
			let existingArr = existingTags.split(';');
			currentTags = existingArr;
		}

		if ($filterStorage.gotoUID) {
			$filterStorage.doer = $filterStorage.gotoUID + user.email.substring(user.email.indexOf('@'));
			$filterStorage.gotoUID = undefined;
		}

		await setTemplates();
		refreshList();
	});
	onDestroy(async () => {
		$filterStorage.workTitlePattern = '';
		$filterStorage.tplid = '';
	});
</script>

<Container class="p-2">
	<div class="d-flex">
		<div class="flex-shrink-0 fs-3">
			{$_('title.worklist')}
		</div>
		<div class="ms-5 align-self-center flex-grow-1">&nbsp;</div>
		<div class="justify-content-end flex-shrink-0">
			<Button
				color="primary"
				on:click={() => {
					$filterStorage.workStatus = 'ST_RUN';
					$filterStorage.tplid = '';
					$filterStorage.doer = user.email;
					$filterStorage.workTitlePattern = '';
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
<Container>
	<svelte:component
		this={ExtraFilter}
		bind:this={theExtraFilter}
		{user}
		{delegators}
		on:filterDoerChange={refreshList}
		on:filterStatusChange={filterStatusChanged}
		on:filterTemplateChange={filterTemplateChanged}
		fields="{user.group === 'ADMIN'
			? ['doer', 'templatepicker', 'statuses']
			: ['templatepicker', 'statuses']},"
		object_type="work items"
		statuses={[
			{ value: 'All', label: $_('status.All') },
			{ value: 'ST_RUN', label: $_('status.ST_RUN') },
			{ value: 'ST_PAUSE', label: $_('status.ST_PAUSE') },
			{ value: 'ST_DONE', label: $_('status.ST_DONE') }
		]}
		{templates}
	/>
	<RemoteTable endpoint="work/list" {token} {iframeMode} bind:this={theRemoteTable} />
</Container>
