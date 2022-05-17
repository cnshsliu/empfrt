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
	import { todoPage, resultCache } from '$lib/Stores';
	import PageSize from '$lib/PageSize.svelte';
	import { tspans } from '$lib/variables';
	import { onMount, onDestroy } from 'svelte';
	import Parser from '$lib/parser';
	import type { Work } from '$lib/types';
	import Pagination from '$lib/pagination/Pagination.svelte';
	import Search from '$lib/pagination/Search.svelte';
	import { mtcConfirm, mtcConfirmReset } from '$lib/Stores';
	import Sort from '$lib/pagination/Sort.svelte';
	import { goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import { title } from '$lib/title';

	$title = 'HyperFlow';
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

	if ($session.user.tenant._id === undefined) {
		setTimeout(async () => {
			$mtcConfirm = {
				title: $_('confirm.title.needReload'),
				body: $_('confirm.body.needReload'),
				buttons: [$_('confirm.button.confirm')],
				callbacks: [
					async () => {
						window.location.reload();
						mtcConfirmReset();
					},
				],
			};
		}, 5000);
	}
	let rows = [];
	let pageIndex = 0; //first row
	if (!$filterStorage.todo) $filterStorage.todo = {};

	let loading = true;
	let rowsCount = 0;
	let show_calendar_select = false;
	let sorting = { dir: 'desc', key: 'lastdays' };
	let storeSorting = $filterStorage.todo.workSorting;
	let user = $session.user;
	let autoRefreshTimes = 0;
	let bizSearchCondition = { init: true, search: '', extra: {} };
	let currentTags = [];
	let searchTimer = undefined;
	let statuses = [
		{ value: 'All', label: $_('status.All') },
		{ value: 'ST_RUN', label: $_('status.ST_RUN') },
		{ value: 'ST_PAUSE', label: $_('status.ST_PAUSE') },
		{ value: 'ST_DONE', label: $_('status.ST_DONE') },
	];

	if (!$session.templatesForSearch_for_todo) {
		$session.templatesForSearch_for_todo = [];
	}
	if ($filterStorage.todo.calendar_begin !== '' || $filterStorage.todo.calendar_end !== '') {
		show_calendar_select = true;
	} else {
		show_calendar_select = false;
	}
	const clearTag = async function () {
		currentTags = [];
		$filterStorage.todo.tplTag = '';
		let tmp = await api.post('template/tplid/list', {}, user.sessionToken);
		$session.templatesForSearch_for_todo = tmp.map((x) => x.tplid);
		await searchNow();
	};
	const useThisTag = async function (tag, appendMode = false) {
		if (appendMode) {
			let existingTags = $filterStorage.todo.tplTag;
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
		$filterStorage.todo.tplTag = currentTags.join(';');
		$filterStorage.todo.tplid = '';
		let tmp = await api.post(
			'template/tplid/list',
			{ tagsForFilter: currentTags },
			user.sessionToken,
		);
		$session.templatesForSearch_for_todo = tmp.map((x) => x.tplid);
		await searchNow();
	};
	const loadTemplatesOnCurrentTags = async function () {
		let existingTags = $filterStorage.todo.tplTag;
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
		$session.templatesForSearch_for_todo = tmp.map((x) => x.tplid);
	};

	if (storeSorting) {
		if (storeSorting.dir && storeSorting.key) {
			sorting = storeSorting;
		} else {
			$filterStorage.todo.workSorting = sorting;
		}
	}

	async function load(_page, reason = 'unknown') {
		loading = true;
		let payload_extra = {
			status: $filterStorage.todo.workStatus,
			tspan: $filterStorage.todo.tspan,
		};
		if ($filterStorage.todo.doer) {
			payload_extra['doer'] = $filterStorage.todo.doer;
		} else {
			$filterStorage.todo.doer = user.email;
			payload_extra['doer'] = $filterStorage.todo.doer;
		}
		if ($filterStorage.todo.tplTag) {
			payload_extra['tagsForFilter'] = $filterStorage.todo.tplTag.split(';');
		}
		if ($filterStorage.todo.tplid && $filterStorage.todo.tplid.trim().length > 0) {
			payload_extra['tplid'] = $filterStorage.todo.tplid.trim();
		}
		if (
			Parser.hasValue($filterStorage.todo.calendar_begin) &&
			Parser.hasValue($filterStorage.todo.calendar_end)
		) {
			payload_extra['calendar_begin'] = $filterStorage.todo.calendar_begin;
			payload_extra['calendar_end'] = $filterStorage.todo.calendar_end;
		}

		if (!$filterStorage.pageSize) $filterStorage.pageSize = 10;
		bizSearchCondition = {
			init: false,
			search: $filterStorage.todo.workTitlePattern,
			extra: payload_extra,
		};

		console.log(JSON.stringify(payload_extra, null, 2));
		const data = await getData(
			'work/search',
			user.sessionToken,
			_page,
			$filterStorage.pageSize,
			$filterStorage.todo.workTitlePattern,
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
		$todoPage = event.detail.page;
	}

	const calendar_changed = function () {
		if (
			Parser.hasValue($filterStorage.todo.calendar_begin) &&
			Parser.isEmpty($filterStorage.todo.calendar_end)
		) {
			$filterStorage.todo.calendar_end = $filterStorage.todo.calendar_begin;
		}
		if (
			Parser.hasValue($filterStorage.todo.calendar_begin) &&
			Parser.hasValue($filterStorage.todo.calendar_end)
		) {
			searchNow(null).then();
		}
	};

	async function searchNow(detail = null) {
		searchTimer && clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			if (Utils.isBlank($filterStorage.todo.doer)) {
				$filterStorage.todo.doer = user.email;
			}
			if (Utils.isBlank($filterStorage.todo.wfStatus)) {
				$filterStorage.todo.wfStatus = 'ST_RUN';
			}
			if (Utils.isBlank($filterStorage.todo.workStatus)) {
				$filterStorage.todo.workStatus = 'ST_RUN';
			}
			if (Utils.isBlank($filterStorage.todo.workTitlePattern)) {
				$filterStorage.todo.workTitlePattern = '';
			}
			if (Utils.isBlank($filterStorage.todo.wfTitlePattern)) {
				$filterStorage.todo.wfTitlePattern = '';
			}
			if (detail && detail.page) $todoPage = detail.page;
			if (detail && detail.sorting) sorting = detail.sorting;
			load($todoPage, 'refresh').then((res) => {});
			searchTimer = undefined;
		}, 200);
	}

	function resetQuery(clearCache = false) {
		clearTag();
		$filterStorage.todo.workStatus = 'ST_RUN';
		$filterStorage.todo.tplid = '';
		$filterStorage.todo.doer = user.email;
		$filterStorage.todo.workTitlePattern = '';
		$filterStorage.todo.tspan = 'any';
		$filterStorage.todo.calendar_begin = '';
		$filterStorage.todo.calendar_end = '';
		show_calendar_select = false;
		clearCache && delete $resultCache['work/search'];
	}

	const toggleAdvancedSearch = async () => {
		$session.showAdvancedSearch = !$session.showAdvancedSearch;
		if ($session.showAdvancedSearch == false) {
			resetQuery();
		} else {
			let existingTags = $filterStorage.todo.tplTag;
			if (Parser.hasValue(existingTags)) {
				let existingArr = existingTags.split(';');
				currentTags = existingArr;
			}
			if (
				!$session.templatesForSearch_for_todo ||
				$session.templatesForSearch_for_todo.length === 0
			) {
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
		$filterStorage.todo.workSorting = sorting;
		await load($todoPage, 'onSort');
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
			page: $todoPage,
			pageSize: $filterStorage.pageSize,
			rows,
			filteredRows,
		}),
		setPage: (_page) => {
			$todoPage = _page;
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
			<Button
				color="primary"
				on:click={(e) => {
					resetQuery(true);
				}}
				class="m-0 p-1"
				size="lg">
				{$_('button.resetQuery')}
			</Button>
		</div>
	</div>
	{#if $session.showAdvancedSearch}
		<TagPicker {currentTags} {useThisTag} {clearTag} />
		<Row class="mb-3 d-flex justify-content-end">
			{#each statuses as status, index (status)}
				<Col xs="auto">
					<Input
						type="radio"
						bind:group={$filterStorage.todo.workStatus}
						value={status.value}
						label={status.label}
						on:input={searchNow} />
				</Col>
			{/each}
		</Row>
		<Row cols={{ xs: 1, md: 2 }}>
			<Col>
				<InputGroup>
					<InputGroupText>{$_('extrafilter.template')}</InputGroupText>
					{#key $filterStorage.todo.tplid}
						<select
							class="form-select"
							name="selectTpl"
							id="tplSelect"
							bind:value={$filterStorage.todo.tplid}
							on:input={searchNow}>
							<option value="">
								{$_('extrafilter.allTemplate')}
							</option>
							{#if $session.templatesForSearch_for_todo}
								{#each $session.templatesForSearch_for_todo as tpl, index (tpl)}
									<option value={tpl} selected={tpl === $filterStorage.todo.tplid}>
										{tpl}
									</option>
								{/each}
							{/if}
						</select>
					{/key}
				</InputGroup>
			</Col>
			<Col>
				<InputGroup class="kfk-input-template-name d-flex">
					<InputGroupText>{$_('extrafilter.starter')}</InputGroupText>
					<Input
						class="flex-fill"
						name="other_doer"
						bind:value={$filterStorage.todo.doer}
						aria-label="User Email"
						placeholder="email" />
					<Button on:click={searchNow} color="primary">
						<i class="bi bi-arrow-return-left" />
					</Button>
					<Button
						on:click={() => {
							$filterStorage.todo.doer = user.email;
							searchNow();
						}}
						color="secondary">
						{$_('extrafilter.me')}
					</Button>
				</InputGroup>
			</Col>
		</Row>

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
							bind:value={$filterStorage.todo.workTitlePattern} />
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
						bind:value={$filterStorage.todo.tspan}
						on:change={async (e) => {
							e.preventDefault();
							await load($todoPage, 'onTspan');
						}}>
						{#each Object.keys(tspans) as key}
							<option value={key}>{tspans[key]}</option>
						{/each}
					</select>
					<Button
						on:click={async () => {
							if (show_calendar_select) {
								$filterStorage.todo.calendar_begin = '';
								$filterStorage.todo.calendar_end = '';
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
							bind:value={$filterStorage.todo.calendar_begin}
							on:change={calendar_changed} />
					</InputGroup>
				</Col>
				<Col>
					<InputGroup>
						<InputGroupText>End:</InputGroupText>
						<Input
							type="date"
							bind:value={$filterStorage.todo.calendar_end}
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
				if (ss.extra.status) $filterStorage.todo.workStatus = ss.extra.status;
				if (ss.extra.tplid) {
					$filterStorage.todo.tplid = ss.extra.tplid;
				} else {
					$filterStorage.todo.tplid = '';
				}
				if (ss.extra.starter) $filterStorage.todo.starter = ss.extra.starter;
				if (ss.extra.doer) $filterStorage.todo.doer = ss.extra.doer;
				if (ss.search) $filterStorage.todo.workTitlePattern = ss.search;
				else $filterStorage.todo.workTitlePattern = '';
				if (ss.extra.tspan) $filterStorage.todo.tspan = ss.extra.tspan;
				if (ss.extra.calendar_begin) $filterStorage.todo.calendar_begin = ss.extra.calendar_begin;
				else $filterStorage.todo.calendar_begin = '';
				if (ss.extra.calendar_end) $filterStorage.todo.calendar_end = ss.extra.calendar_end;
				else $filterStorage.todo.calendar_end = '';
				if ($filterStorage.todo.calendar_begin !== '' || $filterStorage.todo.calendar_end !== '') {
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

<Container>
	<Pagination
		page={$todoPage}
		pageSize={$filterStorage.pageSize}
		count={rowsCount}
		serverSide={true}
		{isMobile}
		on:pageChange={onPageChange} />
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

	<Pagination
		page={$todoPage}
		pageSize={$filterStorage.pageSize}
		count={rowsCount}
		serverSide={true}
		{isMobile}
		on:pageChange={onPageChange} />
</Container>
