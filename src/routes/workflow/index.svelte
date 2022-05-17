<svelte:options accessors />

<script type="ts">
	import { _, date, time } from '$lib/i18n';
	import * as Utils from '$lib/utils';
	import * as api from '$lib/api';
	import TagPicker from '$lib/TagPicker.svelte';
	import ExtraFilter from '$lib/form/ExtraFilter.svelte';
	import AniIcon from '$lib/AniIcon.svelte';
	import { wfPage, resultCache } from '$lib/Stores';
	import { slide, fade } from 'svelte/transition';
	import { navigating, session } from '$app/stores';
	import { setFadeMessage } from '$lib/Notifier';
	import Transition from '$lib/Transition.svelte';
	import { filterStorage } from '$lib/empstores';
	import Searchlet from '$lib/Searchlet.svelte';
	import ColPerRowSelection from '$lib/ColPerRowSelection.svelte';
	import PageSize from '$lib/PageSize.svelte';
	import { tspans } from '$lib/variables';
	import Confirm from '$lib/confirm.svelte';
	import Parser from '$lib/parser';
	import { onMount } from 'svelte';
	import type { Workflow } from '$lib/types';
	import { StatusLabel } from '$lib/status';
	import Table from '$lib/pagination/Table.svelte';
	import Pagination from '$lib/pagination/Pagination.svelte';
	import Search from '$lib/pagination/Search.svelte';
	import Sort from '$lib/pagination/Sort.svelte';
	import { goto } from '$app/navigation';
	import {
		Container,
		Row,
		Col,
		InputGroup,
		InputGroupText,
		Input,
		Icon,
		Button,
	} from 'sveltestrap';
	import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, NavLink } from 'sveltestrap';
	import { getData } from '$lib/pagination/Server';
	import { ClientPermControl } from '$lib/clientperm';
	import { createEventDispatcher, getContext, setContext } from 'svelte';

	let rows: Workflow[] = [] as Workflow[];
	let theConfirm;
	if (!$filterStorage.wf) $filterStorage.wf = {};

	let loading = true;
	let rowsCount = 0;
	let input_search;
	let filter_tspan = '1w';
	let show_calendar_select = false;
	let setPboAtFor = '';
	let settingFor = '';
	let sorting = { dir: 'desc', key: 'updatedAt' };
	let storeSorting = $filterStorage.wf.wfSorting;
	let useTransition = true;
	let user = $session.user;
	let bizSearchCondition = { init: true, search: '', extra: {} };
	let currentTags = [];
	let searchTimer = undefined;
	if (storeSorting) {
		if (storeSorting.dir && storeSorting.key) {
			sorting = storeSorting;
		} else {
			$filterStorage.wf.wfSorting = sorting;
		}
	}
	let statuses = [
		{ value: 'All', label: $_('status.All') },
		{ value: 'ST_RUN', label: $_('status.ST_RUN') },
		{ value: 'ST_PAUSE', label: $_('status.ST_PAUSE') },
		{ value: 'ST_DONE', label: $_('status.ST_DONE') },
	];

	if (!$session.templatesForSearch_for_wf) {
		$session.templatesForSearch_for_wf = [];
	}
	if ($filterStorage.wf.calendar_begin !== '' || $filterStorage.wf.calendar_end !== '') {
		show_calendar_select = true;
	} else {
		show_calendar_select = false;
	}

	$: filteredRows = rows;

	setContext('state', {
		getState: () => ({
			page: $wfPage,
			pageSize: $filterStorage.pageSize,
			rows,
			filteredRows,
		}),
		setPage: (_page) => {
			$wfPage = _page;
		},
		setRows: (_rows) => {
			filteredRows = _rows;
		},
	});
	let storeTspan = $filterStorage.wf.tspan;
	if (storeTspan && Object.keys(tspans).includes(storeTspan)) {
		filter_tspan = storeTspan;
	} else {
		filter_tspan = '1w';
	}
	const clearTag = async function () {
		currentTags = [];
		$filterStorage.wf.tplTag = '';
		let tmp = await api.post('template/tplid/list', {}, user.sessionToken);
		$session.templatesForSearch_for_wf = tmp.map((x) => x.tplid);
		await searchNow();
	};
	const useThisTag = async function (tag, appendMode = false) {
		if (appendMode) {
			let existingTags = $filterStorage.wf.tplTag;
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
		$filterStorage.wf.tplTag = currentTags.join(';');
		$filterStorage.wf.tplid = '';
		let tmp = await api.post(
			'template/tplid/list',
			{ tagsForFilter: currentTags },
			user.sessionToken,
		);
		$session.templatesForSearch_for_wf = tmp.map((x) => x.tplid);
		await searchNow();
	};
	const loadTemplatesOnCurrentTags = async function () {
		let existingTags = $filterStorage.wf.tplTag;
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
		$session.templatesForSearch_for_wf = tmp.map((x) => x.tplid);
	};

	if (storeSorting) {
		if (storeSorting.dir && storeSorting.key) {
			sorting = storeSorting;
		} else {
			$filterStorage.wf.workSorting = sorting;
		}
	}

	async function load(_page, reason = 'unknown') {
		loading = true;
		let payload_extra = {
			status: $filterStorage.wf.wfStatus,
			tspan: $filterStorage.wf.tspan,
		};
		payload_extra['starter'] = $filterStorage.wf.starter;
		if ($filterStorage.wf.tplTag)
			payload_extra['tagsForFilter'] = $filterStorage.wf.tplTag.split(';');
		if ($filterStorage.wf.tplid.trim()) payload_extra['tplid'] = $filterStorage.wf.tplid.trim();
		if ($filterStorage.wf.calendar_begin && $filterStorage.wf.calendar_end) {
			payload_extra['calendar_begin'] = $filterStorage.wf.calendar_begin;
			payload_extra['calendar_end'] = $filterStorage.wf.calendar_end;
		}

		//在getData之前,记录下来,供savedSearch使用
		bizSearchCondition = {
			init: false,
			search: $filterStorage.wf.wfTitlePattern,
			extra: payload_extra,
		};

		const data = await getData(
			'workflow/search',
			user.sessionToken,
			_page,
			$filterStorage.pageSize,
			$filterStorage.wf.wfTitlePattern,
			sorting,
			payload_extra,
			reason,
		);
		if (data && data.rows) {
			rows = data.rows;
			rowsCount = data.rowsCount;
			if (data.gotoPage0) {
				console.log('OK, i am goint to page 0');
				//onPageChange({ detail: { page: 0 } });
				//$tplPage = 0;
			}
			if (data.fromCache) {
				useTransition = false;
			}
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

	function onPageChange(event) {
		load(event.detail.page);
		$wfPage = event.detail.page;
	}

	const calendar_changed = function () {
		if (
			Parser.hasValue($filterStorage.wf.calendar_begin) &&
			Parser.isEmpty($filterStorage.wf.calendar_end)
		) {
			$filterStorage.wf.calendar_end = $filterStorage.wf.calendar_begin;
		}
		if (
			Parser.hasValue($filterStorage.wf.calendar_begin) &&
			Parser.hasValue($filterStorage.wf.calendar_end)
		) {
			searchNow(null).then();
		}
	};

	async function searchNow(detail = null) {
		searchTimer && clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			if (Utils.isBlank($filterStorage.wf.tplTag)) {
				$filterStorage.wf.tplTag = '';
			}
			if (Utils.isBlank($filterStorage.wf.tplid)) {
				$filterStorage.wf.tplid = '';
			}
			if (Utils.isBlank($filterStorage.wf.starter)) {
				$filterStorage.wf.starter = user.email;
			}
			if (Utils.isBlank($filterStorage.wf.doer)) {
				$filterStorage.wf.doer = user.email;
			}
			if (Utils.isBlank($filterStorage.wf.wfStatus)) {
				$filterStorage.wf.wfStatus = 'ST_RUN';
			}
			if (Utils.isBlank($filterStorage.wf.workStatus)) {
				$filterStorage.wf.workStatus = 'ST_RUN';
			}
			if (Utils.isBlank($filterStorage.wf.wfTitlePattern)) {
				$filterStorage.wf.wfTitlePattern = '';
			}
			if (Utils.isBlank($filterStorage.wf.wfTitlePattern)) {
				$filterStorage.wf.wfTitlePattern = '';
			}
			if (Utils.isBlank($filterStorage.wf.calendar_begin)) $filterStorage.wf.calendar_begin = '';
			if (Utils.isBlank($filterStorage.wf.calendar_end)) $filterStorage.wf.calendar_end = '';
			if (detail && detail.page) $wfPage = detail.page;
			if (detail && detail.sorting) sorting = detail.sorting;
			if (!$filterStorage.pageSize) $filterStorage.pageSize = 10;
			load($wfPage, 'refresh').then((res) => {});
			searchTimer = undefined;
		}, 200);
	}

	export function resetQuery(clearCache = false) {
		clearTag();
		$filterStorage.wf.wfStatus = 'ST_RUN';
		$filterStorage.wf.tplid = '';
		$filterStorage.wf.starter = user.email;
		$filterStorage.wf.doer = user.email;
		$filterStorage.wf.wfTitlePattern = '';
		$filterStorage.wf.tspan = 'any';
		$filterStorage.wf.calendar_begin = '';
		$filterStorage.wf.calendar_end = '';
		show_calendar_select = false;
		clearCache && delete $resultCache['workflow/search'];
	}

	const toggleAdvancedSearch = async () => {
		$session.showAdvancedSearch = !$session.showAdvancedSearch;
		if ($session.showAdvancedSearch == false) {
			resetQuery();
		} else {
			let existingTags = $filterStorage.wf.tplTag;
			if (Parser.hasValue(existingTags)) {
				let existingArr = existingTags.split(';');
				currentTags = existingArr;
			}
			if (!$session.templatesForSearch_for_wf || $session.templatesForSearch_for_wf.length === 0) {
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

	const showWorkflowDiscussion = (wfid) => {
		goto(`/workflow/${wfid}?showComment=true`);
	};

	async function onSort(event) {
		sorting = { dir: event.detail.dir, key: event.detail.key };
		$filterStorage.wf.wfSorting = sorting;
		await load($wfPage);
	}

	const opWorkflow = async function (workflow: Workflow, op: string): Promise<void> {
		if (op === 'startAnother') {
			goto(`/template/start?tplid=${workflow.tplid}`);
			return;
		} else if (op === 'works') {
			$filterStorage.todo.tplid_for_todo = workflow.tplid;
			$filterStorage.todo.workTitlePattern = 'wf:' + workflow.wfid;
			goto('/work');
			return;
		} else if (op === 'works_running') {
			$filterStorage.todo.tplid_for_todo = workflow.tplid;
			$filterStorage.todo.workTitlePattern = 'wf:' + workflow.wfid;
			$filterStorage.todo.workStatus = 'ST_RUN';
			goto('/work');
			return;
		} else if (op === 'works_all') {
			$filterStorage.todo.tplid_for_todo = workflow.tplid;
			$filterStorage.todo.workTitlePattern = 'wf:' + workflow.wfid;
			$filterStorage.todo.workStatus = 'All';
			goto('/work');
			return;
		} else if (op === 'viewTemplate') {
			goto(`/template/${workflow.tplid}&read`);
			return;
		}

		if (op === 'setpboat') {
			setPboAtFor = workflow.wfid;
			return;
		}
		if (op === 'setting') {
			settingFor = workflow.wfid;
			return;
		}

		if (op === 'viewInstanceTemplate') {
			let payload = { wfid: workflow.wfid };
			let ret = await api.post('workflow/dump/instemplate', payload, user.sessionToken);
			goto(`template/${workflow.wfid}_instemplate&read`);
			return;
		}

		let payload = { wfid: workflow.wfid, op: op };
		let ret: Workflow = (await api.post('workflow/op', payload, user.sessionToken)) as Workflow;
		if (op === 'pause' || op === 'resume' || op === 'stop') {
			for (let i = 0; i < rows.length; i++) {
				if (rows[i].wfid === workflow.wfid) {
					rows[i].status = ret.status;
					rows[i].statusLabel = StatusLabel(rows[i].status);
					rows[i] = rows[i];
				}
			}
			rows = rows;
		} else if (op === 'destroy') {
			let deletedIndex = -1;
			for (let i = 0; i < rows.length; i++) {
				if (rows[i].wfid === workflow.wfid) {
					deletedIndex = i;
					break;
				}
			}
			if (deletedIndex >= 0) {
				rows.splice(deletedIndex, 1);
				rows = rows;
				rowsCount = rowsCount - 1;
			}
		} else {
			await searchNow({});
		}
		$filterStorage.todo.workTitlePattern = 'wf:' + ret.wfid;
	};

	export function reset() {
		input_search = '';
	}

	const stateContext = getContext('state');
	$: if ($filterStorage && $filterStorage.wf) {
		filter_tspan = $filterStorage.wf.tspan;
		input_search = $filterStorage.wf.wfTitlePattern;
	}
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
		if ($filterStorage.wf.wfTitlePattern && $filterStorage.wf.wfTitlePattern.startsWith('wf:')) {
			$filterStorage.wf.wfTitlePattern = '';
		}
		await searchNow();
	});
	const toggleDiscuss = async (row) => {
		return await api.post(
			'comment/toggle',
			{ objtype: 'workflow', objid: row.wfid },
			user.sessionToken,
		);
	};
	if (Utils.isBlank($filterStorage.wf.starter)) $filterStorage.wf.starter = user.email;
</script>

<Container class="p-2 border border-1 rounded">
	<div class="d-flex">
		<div class="flex-shrink-0 fs-3">
			{$_('title.workflow')}
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
			<Button color="primary" on:click={resetQuery} class="m-0 p-1" size="lg">
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
						bind:group={$filterStorage.wf.wfStatus}
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
					{#key $filterStorage.wf.tplid}
						<select
							class="form-select"
							name="selectTpl"
							id="tplSelect"
							bind:value={$filterStorage.wf.tplid}
							on:input={searchNow}>
							<option value="">
								{$_('extrafilter.allTemplate')}
							</option>
							{#if $session.templatesForSearch_for_wf}
								{#each $session.templatesForSearch_for_wf as tpl, index (tpl)}
									<option value={tpl} selected={tpl === $filterStorage.wf.tplid}>
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
						bind:value={$filterStorage.wf.starter}
						aria-label="User Email"
						placeholder="email" />
					<Button on:click={searchNow} color="primary">
						<i class="bi bi-arrow-return-left" />
					</Button>
					<Button
						on:click={() => {
							$filterStorage.wf.starter = user.email;
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
							bind:value={$filterStorage.wf.wfTitlePattern} />
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
						bind:value={$filterStorage.wf.tspan}
						on:change={async (e) => {
							e.preventDefault();
							await load($wfPage, 'onTspan');
						}}>
						{#each Object.keys(tspans) as key}
							<option value={key}>{tspans[key]}</option>
						{/each}
					</select>
					<Button
						on:click={async () => {
							if (show_calendar_select) {
								$filterStorage.wf.calendar_begin = '';
								$filterStorage.wf.calendar_end = '';
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
							bind:value={$filterStorage.wf.calendar_begin}
							on:change={calendar_changed} />
					</InputGroup>
				</Col>
				<Col>
					<InputGroup>
						<InputGroupText>End:</InputGroupText>
						<Input
							type="date"
							bind:value={$filterStorage.wf.calendar_end}
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
			objtype="workflow"
			on:searchlet={(msg) => {
				let ss = JSON.parse(msg.detail.ss);
				console.log('Searchlet:', JSON.stringify(ss, null, 2));
				if (ss.extra.status) $filterStorage.wf.wfStatus = ss.extra.status;
				if (ss.extra.tplid) {
					$filterStorage.wf.tplid = ss.extra.tplid;
				} else {
					$filterStorage.wf.tplid = '';
				}
				if (ss.extra.starter) $filterStorage.wf.starter = ss.extra.starter;
				if (ss.extra.doer) $filterStorage.wf.doer = ss.extra.doer;
				if (ss.search) $filterStorage.wf.wfTitlePattern = ss.search;
				else $filterStorage.wf.wfTitlePattern = '';
				if (ss.extra.tspan) $filterStorage.wf.tspan = ss.extra.tspan;
				if (ss.extra.calendar_begin) $filterStorage.wf.calendar_begin = ss.extra.calendar_begin;
				else $filterStorage.wf.calendar_begin = '';
				if (ss.extra.calendar_end) $filterStorage.wf.calendar_end = ss.extra.calendar_end;
				else $filterStorage.wf.calendar_end = '';
				if ($filterStorage.wf.calendar_begin !== '' || $filterStorage.wf.calendar_end !== '') {
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

	{#key rowsCount}
		<div class="mt-3 ">
			<Pagination
				page={$wfPage}
				pageSize={$filterStorage.pageSize}
				count={rowsCount}
				serverSide={true}
				{isMobile}
				on:pageChange={onPageChange} />
		</div>
	{/key}
	<div class="d-flex mt-2 p-0 w-100">
		<div class="w-100">
			<Row>
				<Col>{$_('remotetable.sortBy')}:</Col>
				<Col>
					{$_('remotetable.title')}
					<Sort key="wftitle" on:sort={onSort} />
				</Col>
				<Col>
					{$_('remotetable.status')}
					<Sort key="status" on:sort={onSort} />
				</Col>
				<Col>
					{$_('remotetable.starter')}
					<Sort key="starter" on:sort={onSort} />
				</Col>
				<Col>
					{$_('remotetable.updatedAt')}
					<Sort key="updatedAt" dir="desc" on:sort={onSort} />
				</Col>
			</Row>
		</div>
		<div class="flex-shrink-1">
			<PageSize
				on:pagesize={async (e) => {
					await load(0);
				}} />
		</div>
		<div class="flex-shrink-1">
			<ColPerRowSelection />
		</div>
	</div>
	<!-- code><pre>
			{JSON.stringify(rows, null, 2)}
	</pre></code -->
	<Row cols={$filterStorage.col_per_row}>
		{#each rows as row, index (row)}
			<Col class="mb-2 card p-2">
				<div class="">
					<div class="">
						<div class="d-flex">
							<div class="w-100">
								<h5 class="">
									<a
										class="preview-link kfk-workflow-id tnt-workflow-id"
										href="/workflow/{row.wfid}">
										{row.wftitle}
										{#if row.rehearsal}
											<i class="bi-patch-check" />
										{/if}
									</a>
								</h5>
							</div>
							<div class="flex-shrink-1">
								<Dropdown class="m-0 p-0">
									<DropdownToggle caret color="primary" class="btn-sm">
										{$_('remotetable.actions')}
									</DropdownToggle>
									<DropdownMenu>
										<DropdownItem>
											<a
												class="nav-link"
												href={'#'}
												on:click|preventDefault={() => opWorkflow(row, 'works_all')}>
												<Icon name="list-check" />
												{$_('remotetable.wfa.allWorks')}
											</a>
										</DropdownItem>
										{#if ClientPermControl(user.perms, user.email, 'workflow', row, 'update')}
											{#if row.status === 'ST_RUN'}
												<DropdownItem>
													<NavLink on:click={() => opWorkflow(row, 'pause')}>
														<Icon name="pause-btn" />
														{$_('remotetable.wfa.pause')}
													</NavLink>
												</DropdownItem>
											{/if}
											{#if row.status === 'ST_PAUSE'}
												<DropdownItem>
													<NavLink on:click={() => opWorkflow(row, 'resume')}>
														<Icon name="arrow-counterclockwise" />
														{$_('remotetable.wfa.resume')}
													</NavLink>
												</DropdownItem>
											{/if}
											{#if row.status === 'ST_PAUSE' || row.status === 'ST_RUN'}
												<DropdownItem>
													<NavLink on:click={() => opWorkflow(row, 'stop')}>
														<Icon name="slash-square" />
														{$_('remotetable.wfa.stop')}
													</NavLink>
												</DropdownItem>
											{/if}
											{#if ['ST_RUN', 'ST_PAUSE', 'ST_STOP'].indexOf(row.status) > -1}
												<DropdownItem>
													<NavLink on:click={() => opWorkflow(row, 'restart')}>
														<Icon name="caret-right-square" />
														{$_('remotetable.wfa.restart')}
													</NavLink>
												</DropdownItem>
											{/if}
											<!-- DropdownItem>
									<NavLink on:click={() => opWorkflow(row, 'setpboat')}>
										<Icon name="caret-right-square" />
										{$_('remotetable.wfa.setpboat')}
									</NavLink>
								</DropdownItem -->
											<DropdownItem>
												<NavLink on:click={() => opWorkflow(row, 'setting')}>
													<Icon name="caret-right-square" />
													{$_('remotetable.wfa.setting')}
												</NavLink>
											</DropdownItem>
										{/if}
										<DropdownItem>
											{#if ClientPermControl(user.perms, user.email, 'workflow', '', 'create')}
												<NavLink on:click={() => opWorkflow(row, 'startAnother')}>
													<Icon name="caret-right-fill" />
													{$_('remotetable.wfa.startAnother')}
												</NavLink>
											{:else}
												<NavLink disabled>
													<Icon name="caret-right-fill" />
													Start Another
													{$_('remotetable.wfa.startAnother')}
												</NavLink>
											{/if}
										</DropdownItem>
										<DropdownItem>
											<NavLink on:click={() => opWorkflow(row, 'viewInstanceTemplate')}>
												<Icon name="code" />
												{$_('remotetable.wfa.viewInstanceTemplate')}
											</NavLink>
										</DropdownItem>
										{#if user.group === 'ADMIN' || (user.email === row.starter && (row.rehearsal || row.pnodeid === 'start'))}
											<DropdownItem>
												<NavLink
													on:click={(e) => {
														e.preventDefault();
														theConfirm.title = $_('confirm.title.areyousure');
														theConfirm.body = $_('confirm.body.deleteWorkflow');
														theConfirm.buttons = [$_('confirm.button.confirm')];
														theConfirm.callbacks = [
															async () => {
																opWorkflow(row, 'destroy');
															},
														];
														theConfirm.toggle();
													}}>
													<Icon name="trash" />
													{$_('remotetable.wfa.deleteThisWorkflow')}
												</NavLink>
											</DropdownItem>
											<DropdownItem>
												<NavLink
													on:click={(e) => {
														e.preventDefault();
														theConfirm.title = $_('confirm.title.areyousure');
														theConfirm.body = $_('confirm.body.deleteWorkflow');
														theConfirm.buttons = [$_('confirm.button.confirm')];
														theConfirm.callbacks = [
															async () => {
																opWorkflow(row, 'restartthendestroy');
															},
														];
														theConfirm.toggle();
													}}>
													<Icon name="trash" />
													{$_('remotetable.wfa.restartthendeleteThisWorkflow')}
												</NavLink>
											</DropdownItem>
										{/if}
									</DropdownMenu>
								</Dropdown>
							</div>
						</div>
						<Row cols={{ md: 2, xs: 1 }}>
							<Col>
								<h6 class=" mb-2 text-muted">
									{row.statusLabel}
								</h6>
							</Col>
						</Row>
						<Row cols={{ md: 2, xs: 1 }}>
							<Col>{$_('remotetable.starter')}: {row.starterCN}</Col>
							<Col>
								{$_('remotetable.updatedAt')}: {$date(new Date(row.updatedAt))}
								{$time(new Date(row.updatedAt))}
							</Col>
						</Row>
						<a
							class="fs-6 kfk-workflow-id tnt-workflow-id kfk-link px-2"
							href={'#'}
							on:click|preventDefault={() => opWorkflow(row, 'works_running')}>
							{$_('remotetable.wfa.runningWorks')}
						</a>
						<a
							href={'#'}
							class="ms-3 fs-6 kfk-workflow-id tnt-workflow-id kfk-link px-2"
							on:click={() => opWorkflow(row, 'viewTemplate')}>
							{$_('remotetable.wfa.viewTemplate')}
						</a>
						{#if row.commentCount > 0 && row.allowdiscuss}
							<a
								href={'#'}
								class="ms-3 fs-6 kfk-workflow-id tnt-workflow-id kfk-link px-2"
								on:click={() => showWorkflowDiscussion(row.wfid)}>
								<AniIcon icon="chat-dots-fill" ani="aniShake" />
								{row.commentCount > 0 ? row.commentCount : ''}
							</a>
						{/if}
						{#if settingFor === row.wfid}
							<div class="mt-3">Set Title to:</div>
							<InputGroup>
								<Input bind:value={row.wftitle} />
								<Button
									size="sm"
									color="primary"
									on:click={async (e) => {
										e.preventDefault();
										await api.post(
											'workflow/set/title',
											{ wfid: row.wfid, wftitle: row.wftitle },
											user.sessionToken,
										);
										settingFor = '';
									}}>
									Set
								</Button>
								<Button
									size="sm"
									color="secondary"
									on:click={async (e) => {
										e.preventDefault();
										settingFor = '';
									}}>
									Cancel
								</Button>
							</InputGroup>
							<div class="form-check form-switch">
								<input
									class="form-check-input"
									type="checkbox"
									role="switch"
									id="flexSwitchCheckChecked"
									checked={row.allowdiscuss}
									on:change={async (e) => {
										row.allowdiscuss = await toggleDiscuss(row);
										row = row;
									}} />
								<label class="form-check-label" for="flexSwitchCheckChecked">
									{row.allowdiscuss ? '允许讨论' : '已关闭讨论'} （切换以切换状态）
								</label>
							</div>
						{/if}
					</div>
				</div>
			</Col>
		{/each}
	</Row>

	{#key rowsCount}
		<div class="mt-3 ">
			<Pagination
				page={$wfPage}
				pageSize={$filterStorage.pageSize}
				count={rowsCount}
				serverSide={true}
				{isMobile}
				on:pageChange={onPageChange} />
		</div>
	{/key}
</Container>
