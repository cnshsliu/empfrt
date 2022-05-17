<svelte:options accessors />

<script type="ts">
	import { _, date, time } from '$lib/i18n';
	import * as Utils from '$lib/utils';
	import * as api from '$lib/api';
	import TagPicker from '$lib/TagPicker.svelte';
	import ExtraFilter from '$lib/form/ExtraFilter.svelte';
	import { slide, fade } from 'svelte/transition';
	import { setFadeMessage } from '$lib/Notifier';
	import Searchlet from '$lib/Searchlet.svelte';
	import Transition from '$lib/Transition.svelte';
	import AniIcon from '$lib/AniIcon.svelte';
	import { navigating, session } from '$app/stores';
	import { filterStorage } from '$lib/empstores';
	import ColPerRowSelection from '$lib/ColPerRowSelection.svelte';
	import PageSize from '$lib/PageSize.svelte';
	import { tspans } from '$lib/variables';
	import { onMount, onDestroy } from 'svelte';
	import Parser from '$lib/parser';
	import type { Work } from '$lib/types';
	import Pagination from '$lib/pagination/Pagination.svelte';
	import Search from '$lib/pagination/Search.svelte';
	import Sort from '$lib/pagination/Sort.svelte';
	import { goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import {
		Container,
		Row,
		Col,
		Button,
		InputGroup,
		InputGroupText,
		Input,
		Icon,
	} from 'sveltestrap';
	import { getData } from '$lib/pagination/Server';
	import { createEventDispatcher, getContext, setContext } from 'svelte';

	export let endpoint;
	let rows = [];
	let page = 0; //first page
	let pageIndex = 0; //first row

	let loading = true;
	let rowsCount = 0;
	let show_calendar_select = false;
	let sorting = { dir: 'desc', key: 'lastdays' };
	let storeSorting = $filterStorage.workSorting;
	let user = $session.user;
	let autoRefreshTimes = 0;
	let bizSearchCondition = { init: true, search: '', extra: {} };
	let currentTags = [];
	let searchTimer = undefined;

	if (!$session.templatesForSearch) {
		$session.templatesForSearch = [];
	}
	const clearTag = async function () {
		currentTags = [];
		$filterStorage.tplTag = '';
		let tmp = await api.post('template/tplid/list', {}, user.sessionToken);
		$session.templatesForSearch = tmp.map((x) => x.tplid);
		await searchNow();
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
			user.sessionToken,
		);
		$session.templatesForSearch = tmp.map((x) => x.tplid);
		await searchNow();
	};
	const loadTemplatesOnCurrentTags = async function () {
		let existingTags = $filterStorage.tplTag;
		if (Parser.isEmpty(existingTags)) {
			existingTags = '';
		}
		let existingArr = existingTags.split(';');
		currentTags = existingArr;
		let tmp = await api.post(
			'template/tplid/list',
			{ tagsForFilter: currentTags },
			user.sessionToken,
		);
		$session.templatesForSearch = tmp.map((x) => x.tplid);
	};

	$filterStorage.calendar_begin = '';
	$filterStorage.calendar_end = '';
	if (storeSorting) {
		if (storeSorting.dir && storeSorting.key) {
			sorting = storeSorting;
		} else {
			$filterStorage.workSorting = sorting;
		}
	}

	async function load(_page, reason = 'unknown') {
		loading = true;
		let payload_extra = {
			status: $filterStorage.workStatus,
			tspan: $filterStorage.tspan,
		};
		if ($filterStorage.doer) {
			payload_extra['doer'] = $filterStorage.doer;
		} else {
			$filterStorage.doer = user.email;
			payload_extra['doer'] = $filterStorage.doer;
		}
		if ($filterStorage.tplTag) {
			payload_extra['tagsForFilter'] = $filterStorage.tplTag.split(';');
		}
		if ($filterStorage.tplid && $filterStorage.tplid.trim().length > 0) {
			payload_extra['tplid'] = $filterStorage.tplid.trim();
		}
		if (
			Parser.hasValue($filterStorage.calendar_begin) &&
			Parser.hasValue($filterStorage.calendar_end)
		) {
			payload_extra['calendar_begin'] = $filterStorage.calendar_begin;
			payload_extra['calendar_end'] = $filterStorage.calendar_end;
		}

		if (!$filterStorage.pageSize) $filterStorage.pageSize = 10;
		bizSearchCondition = {
			init: false,
			search: $filterStorage.workTitlePattern,
			extra: payload_extra,
		};

		console.log(JSON.stringify(payload_extra, null, 2));
		const data = await getData(
			endpoint,
			user.sessionToken,
			_page,
			$filterStorage.pageSize,
			$filterStorage.workTitlePattern,
			sorting,
			payload_extra,
			reason,
		);
		if (data && data.rows) {
			rows = data.rows;
			rowsCount = data.rowsCount;
		} else if (data && (<any>data).error) {
			if ((<any>data).error === 'KICKOUT') {
				setFadeMessage($_('session.forcetohome'));
				goto('/');
			} else {
			}
		} else {
			console.warn(JSON.stringify(data));
		}
		loading = false;
	}

	export const unshiftRows = function (obj) {
		rows = [obj, ...rows];
		rowsCount = rowsCount + 1;
	};

	function onPageChange(event) {
		load(event.detail.page, 'onPageChange');
		page = event.detail.page;
	}

	const calendar_changed = function () {
		if (
			Parser.hasValue($filterStorage.calendar_begin) &&
			Parser.isEmpty($filterStorage.calendar_end)
		) {
			$filterStorage.calendar_end = $filterStorage.calendar_begin;
		}
		if (
			Parser.hasValue($filterStorage.calendar_begin) &&
			Parser.hasValue($filterStorage.calendar_end)
		) {
			searchNow(null).then();
		}
	};

	async function searchNow(detail = null) {
		searchTimer && clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			if (Utils.isBlank($filterStorage.doer)) {
				$filterStorage.doer = user.email;
			}
			if (Utils.isBlank($filterStorage.wfStatus)) {
				$filterStorage.wfStatus = 'ST_RUN';
			}
			if (Utils.isBlank($filterStorage.workStatus)) {
				$filterStorage.workStatus = 'ST_RUN';
			}
			if (Utils.isBlank($filterStorage.workTitlePattern)) {
				$filterStorage.workTitlePattern = '';
			}
			if (Utils.isBlank($filterStorage.wfTitlePattern)) {
				$filterStorage.wfTitlePattern = '';
			}
			if (detail && detail.page) page = detail.page;
			if (detail && detail.sorting) sorting = detail.sorting;
			load(page, 'refresh').then((res) => {});
			searchTimer = undefined;
		}, 400);
	}

	export function resetQuery() {
		clearTag();
		$filterStorage.workStatus = 'ST_RUN';
		$filterStorage.tplid = '';
		$filterStorage.doer = user.email;
		$filterStorage.workTitlePattern = '';
		$filterStorage.tspan = 'any';
		$filterStorage.calendar_begin = '';
		$filterStorage.calendar_end = '';
		show_calendar_select = false;
	}

	const toggleAdvancedSearch = async () => {
		$session.showAdvancedSearch = !$session.showAdvancedSearch;
		if ($session.showAdvancedSearch == false) {
			resetQuery();
		} else {
			let existingTags = $filterStorage.tplTag;
			if (Parser.hasValue(existingTags)) {
				let existingArr = existingTags.split(';');
				currentTags = existingArr;
			}
			if (!$session.templatesForSearch || $session.templatesForSearch.length === 0) {
				await loadTemplatesOnCurrentTags();
			}

			if (!$session.delegators) {
				let delegations = await api.post('/delegation/to/me/today', {}, $session.user.sessionToken);
				$session.delegators = delegations.map((x: any) => x.delegator);
				if ($session.delegators.includes($session.user.email) === false) {
					$session.delegators.push($session.user.email);
				}
			}
		}
	};

	async function onSort(event) {
		sorting = { dir: event.detail.dir, key: event.detail.key };
		$filterStorage.workSorting = sorting;
		await load(page, 'onSort');
	}
	function gotoWorkitem(work: Work, anchor = '') {
		goto(`/work/${work.todoid}${anchor}`, {
			replaceState: false,
		});
	}
	function gotoWorkflow(wfid: string) {
		goto(`/workflow/${wfid}`, { replaceState: false });
	}
	$: filteredRows = rows;
	setContext('state', {
		getState: () => ({
			page,
			pageIndex,
			pageSize: $filterStorage.pageSize,
			rows,
			filteredRows,
		}),
		setPage: (_page, _pageIndex) => {
			page = _page;
			pageIndex = _pageIndex;
		},
		setRows: (_rows) => {
			filteredRows = _rows;
		},
	});
	const stateContext = getContext('state');
	let isMobile = false;
	onMount(async () => {
		isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		if ($session.showAdvancedSearch === undefined) {
			console.log('First time loading...');
			$session.showAdvancedSearch = false;
			resetQuery();
		} else {
			console.log('Not First time loading...');
			if ($session.showAdvancedSearch === false) {
				console.log('showAdvancedSearch === false...');
				resetQuery();
			} else {
				console.log('showAdvancedSearch === true...');
			}
		}
		await searchNow();
	});
</script>

<Container class="p-2 border border-1 rounded">
	<div class="d-flex">
		<div class="flex-shrink-0 fs-3">
			{$_('title.worklist')}
		</div>
		<div class="ms-5 align-self-center flex-grow-1">&nbsp;</div>
		<div class="justify-content-end flex-shrink-0">
			<Button color="primary" on:click={toggleAdvancedSearch} class="m-0 p-1">
				{#if $session.showAdvancedSearch}
					<i class="bi bi-x-circle" />
				{:else}
					<i class="bi bi-search" />
				{/if}
				{$_('button.toggleAdvancedSearch')}
			</Button>
			<Button color="primary" on:click={resetQuery} class="m-0 p-1">
				{$_('button.resetQuery')}
			</Button>
		</div>
	</div>
	{#if $session.showAdvancedSearch}
		<TagPicker {currentTags} {useThisTag} {clearTag} />
		<svelte:component
			this={ExtraFilter}
			{user}
			on:doSearch={async () => {
				console.log($filterStorage.tplid);
				await searchNow('');
			}}
			fields="{user.group === 'ADMIN'
				? ['doer', 'templatepicker', 'statuses']
				: ['templatepicker', 'statuses']},"
			object_type="work items"
			statuses={[
				{ value: 'All', label: $_('status.All') },
				{ value: 'ST_RUN', label: $_('status.ST_RUN') },
				{ value: 'ST_PAUSE', label: $_('status.ST_PAUSE') },
				{ value: 'ST_DONE', label: $_('status.ST_DONE') },
			]} />

		<Row cols={{ xs: 1, md: 2 }} class="mt-1">
			<Col>
				<div class="search d-flex">
					<InputGroup>
						<InputGroupText>
							{$_('remotetable.filter')}
						</InputGroupText>
						<input
							class="flex-fill form-control"
							type="search"
							title={$_('remotetable.bywhat')}
							placeholder={$_('remotetable.bywhat')}
							bind:value={$filterStorage.workTitlePattern} />
						<div class="btn btn-primary" on:click|preventDefault={searchNow}>
							<i class="bi bi-arrow-return-left" />
						</div>
					</InputGroup>
				</div>
			</Col>
			<Col>
				<InputGroup>
					<InputGroupText>
						{$_('remotetable.in')}
					</InputGroupText>
					<select
						class="form-control"
						type="select"
						id="timespanSelect"
						bind:value={$filterStorage.tspan}
						on:change={async (e) => {
							e.preventDefault();
							await load(page, 'onTspan');
						}}>
						{#each Object.keys(tspans) as key}
							<option value={key}>{tspans[key]}</option>
						{/each}
					</select>
					<Button
						on:click={async () => {
							if (show_calendar_select) {
								$filterStorage.calendar_begin = '';
								$filterStorage.calendar_end = '';
								show_calendar_select = false;
								await searchNow(null);
							} else {
								show_calendar_select = true;
							}
						}}>
						{$_('remotetable.start_end')}
					</Button>
				</InputGroup>
			</Col>
		</Row>
		{#if show_calendar_select}
			<Row cols={{ xs: 1, md: 2 }} class="mt-1">
				<Col>
					<InputGroup>
						<InputGroupText>Begin:</InputGroupText>
						<Input
							type="date"
							bind:value={$filterStorage.calendar_begin}
							on:change={calendar_changed} />
					</InputGroup>
				</Col>
				<Col>
					<InputGroup>
						<InputGroupText>End:</InputGroupText>
						<Input
							type="date"
							bind:value={$filterStorage.calendar_end}
							on:change={calendar_changed} />
						<Button on:click={calendar_changed} color="primary">
							<i class="bi bi-arrow-return-left" />
						</Button>
					</InputGroup>
				</Col>
			</Row>
		{/if}
		<Searchlet
			searchCondition={bizSearchCondition}
			objtype="todo"
			on:searchlet={(msg) => {
				let ss = JSON.parse(msg.detail.ss);
				console.log(JSON.stringify(ss, null, 2));
				if (ss.extra.status) $filterStorage.workStatus = ss.extra.status;
				if (ss.extra.tplid) {
					$filterStorage.tplid = ss.extra.tplid;
				} else {
					$filterStorage.tplid = '';
				}
				if (ss.extra.starter) $filterStorage.starter = ss.extra.starter;
				if (ss.extra.doer) $filterStorage.doer = ss.extra.doer;
				if (ss.search) $filterStorage.workTitlePattern = ss.search;
				else $filterStorage.workTitlePattern = '';
				if (ss.extra.tspan) $filterStorage.tspan = ss.extra.tspan;
				if (ss.extra.calendar_begin) $filterStorage.calendar_begin = ss.extra.calendar_begin;
				else $filterStorage.calendar_begin = '';
				if (ss.extra.calendar_end) $filterStorage.calendar_end = ss.extra.calendar_end;
				else $filterStorage.calendar_end = '';
				if ($filterStorage.calendar_begin !== '' || $filterStorage.calendar_end !== '') {
					show_calendar_select = true;
				} else {
					show_calendar_select = false;
				}
				searchNow().then();
			}}
			on:resetSearchlet={(msg) => {
				resetQuery();
			}} />
	{/if}
</Container>
<div class="d-flex mt-2 p-0 w-100">
	<div class="w-100">
		<Row>
			<Col>{$_('remotetable.sortBy')}:</Col>
			<Col>
				{$_('remotetable.title')}
				<Sort key="title" on:sort={onSort} />
			</Col>
			<Col>
				{$_('remotetable.status')}
				<Sort key="status" on:sort={onSort} />
			</Col>
			<Col>
				{$_('remotetable.lasting')}
				<Sort key="lastdays" dir="desc" on:sort={onSort} />
			</Col>
		</Row>
	</div>
	<div class="flex-shrink-1">
		<PageSize
			on:pagesize={async (e) => {
				await load(0, 'change page size');
			}} />
	</div>
	<div class="flex-shrink-1">
		<ColPerRowSelection />
	</div>
</div>
<Transition effect={fade} enable={true} duration={400}>
	<Row cols={$filterStorage.col_per_row}>
		{#each rows as row, index (row)}
			<Col class="mb-2 card p-2">
				<div class="d-flex">
					<div class="w-100">
						<h5 class="">
							<a
								class="preview-link   kfk-work-id tnt-work-id"
								href={'#'}
								on:click|preventDefault={(e) => {
									e.preventDefault();
									gotoWorkitem(row);
								}}>
								{row.title}
								<sup>
									{#if row.nodeid === 'ADHOC'}
										/ adhoc
									{/if}
									{#if row.rehearsal}
										/ <i class="bi-patch-check-fill" />
										{Parser.userDisplay(row.doer, user.email)}
									{/if}
								</sup>
							</a>
						</h5>
					</div>
					<div class="flex-shrink-1 text-nowrap ">
						{$_('remotetable.lasting')}:
						{row.lastdays}
					</div>
				</div>
				<Row cols={{ md: 2, xs: 1 }}>
					<Col>
						{$_('remotetable.status')}:
						{$_('status.' + row.status)}
					</Col>
					<Col>
						<div>
							{$_('remotetable.updatedAt')}:
							{#if row.doneat}
								{$date(new Date(row.doneat))}
								{$time(new Date(row.doneat))}
							{:else}
								{$date(new Date(row.createdAt))}
								{$time(new Date(row.createdAt))}
							{/if}
						</div>
					</Col>
				</Row>
				<Row class="fs-6">
					<Col class="kfk-tag">
						{$_('remotetable.belongTo')}:
						<a
							class="kfk-link fs-6"
							href={'#'}
							on:click={(e) => {
								e.preventDefault();
								gotoWorkflow(row.wfid);
							}}>
							{row.wftitle}
						</a>
						{#if row.allowdiscuss}
							<a
								href={'#'}
								class="ms-3 fs-6 kfk-workflow-id tnt-workflow-id kfk-link"
								on:click={() => gotoWorkitem(row, '#discussion_area')}>
								<AniIcon icon="chat-dots-fill" ani="aniShake" />
								{row.commentCount > 0 ? row.commentCount : ''}
							</a>
						{/if}
					</Col>
				</Row>
			</Col>
		{/each}
	</Row>
</Transition>

<Pagination
	{page}
	pageSize={$filterStorage.pageSize}
	count={rowsCount}
	serverSide={true}
	{isMobile}
	on:pageChange={onPageChange} />
