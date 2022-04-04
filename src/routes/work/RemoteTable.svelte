<svelte:options accessors />

<script type="ts">
	import { _, date, time } from '$lib/i18n';
	import * as api from '$lib/api';
	import { session } from '$app/stores';
	import { filterStorage } from '$lib/empstores';
	import ColPerRowSelection from '$lib/ColPerRowSelection.svelte';
	import PageSize from '$lib/PageSize.svelte';
	import Confirm from '$lib/confirm.svelte';
	import { tspans } from '$lib/variables';
	import { onMount } from 'svelte';
	import Parser from '$lib/parser';
	import { StatusLabel } from '$lib/status';
	import type { Workflow, Work } from '$lib/types';
	import Table, { Pagination, Search, Sort } from '$lib/pagination/Table.svelte';
	import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, NavLink } from 'sveltestrap';
	import { goto } from '$app/navigation';
	import {
		Container,
		Row,
		Col,
		Button,
		InputGroup,
		InputGroupText,
		Input,
		Icon
	} from 'sveltestrap';
	import { getData } from '$lib/pagination/Server.js';
	import { createEventDispatcher, getContext, setContext } from 'svelte';

	export let token;
	export let iframeMode;
	export let endpoint;
	let rows = [];
	let page = 0; //first page
	let pageIndex = 0; //first row
	let theConfirm;

	let loading = true;
	let rowsCount = 0;
	let input_search;
	let filter_tspan = '1w';
	let show_calendar_select = false;
	let calendar_begin = '';
	let calendar_end = '';
	let sorting = { dir: 'desc', key: 'lastdays' };
	let storeSorting = $filterStorage.workSorting;
	let user = $session.user;

	$filterStorage.calendar_begin = '';
	$filterStorage.calendar_end = '';
	if (storeSorting) {
		if (storeSorting.dir && storeSorting.key) {
			sorting = storeSorting;
		} else {
			$filterStorage.workSorting = sorting;
		}
	}
	let storeTspan = $filterStorage.tspan;
	if (storeTspan && Object.keys(tspans).includes(storeTspan)) {
		filter_tspan = storeTspan;
	} else {
		filter_tspan = '1w';
		$filterStorage.tspan = filter_tspan;
	}

	async function load(_page, reason) {
		loading = true;
		let fltSt = $filterStorage;
		let payload_extra = {
			status: fltSt.workStatus,
			doer: fltSt.doer,
			tspan: fltSt.tspan
		};
		if (fltSt.tplTag) {
			payload_extra['tagsForFilter'] = fltSt.tplTag.split(';');
		}
		if (fltSt.tplid && fltSt.tplid.trim().length > 0) {
			payload_extra['tplid'] = fltSt.tplid.trim();
		}
		if (Parser.hasValue(fltSt.calendar_begin) && Parser.hasValue(fltSt.calendar_end)) {
			payload_extra['calendar_begin'] = fltSt.calendar_begin;
			payload_extra['calendar_end'] = fltSt.calendar_end;
		}

		if (!$filterStorage.pageSize) $filterStorage.pageSize = 10;
		const data = await getData(
			endpoint,
			token,
			_page,
			$filterStorage.pageSize,
			input_search,
			sorting,
			payload_extra
		);
		if (data && data.rows) {
			rows = data.rows;
			rowsCount = data.rowsCount;
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
		if (Parser.hasValue(calendar_begin) && Parser.isEmpty(calendar_end)) {
			calendar_end = calendar_begin;
		}
		if (Parser.hasValue(calendar_begin) && Parser.hasValue(calendar_end)) {
			$filterStorage.calendar_begin = calendar_begin;
			$filterStorage.calendar_end = calendar_end;
			refresh(null);
		}
	};

	async function onSearch(event) {
		input_search = event.detail.text;
		$filterStorage.workTitlePattern = input_search;
		page = 0;
		await load(page, 'onSearch');
	}

	export async function refresh(detail) {
		if (detail && detail.page) page = detail.page;
		if (detail && detail.sorting) sorting = detail.sorting;
		await load(page, 'refresh');
	}

	export function reset() {
		input_search = '';
	}
	export function reload() {
		input_search = $filterStorage.workTitlePattern;
	}

	async function onSort(event) {
		sorting = { dir: event.detail.dir, key: event.detail.key };
		$filterStorage.workSorting = sorting;
		await load(page, 'onSort');
	}
	function gotoWorkitem(work: Work) {
		goto(iframeMode ? `/work/@${work.todoid}?iframe` : `/work/@${work.todoid}`, {
			replaceState: false
		});
	}
	function gotoWorkflow(wfid: string) {
		goto(iframeMode ? `/workflow/@${wfid}?iframe` : `/workflow/@${wfid}`, { replaceState: false });
	}
	$: if ($filterStorage) {
		filter_tspan = $filterStorage.tspan;
	}
	$: a = $filterStorage.pageSize && load(0, 'pageSize');
	$: filteredRows = rows;
	setContext('state', {
		getState: () => ({
			page,
			pageIndex,
			pageSize: $filterStorage.pageSize,
			rows,
			filteredRows
		}),
		setPage: (_page, _pageIndex) => {
			page = _page;
			pageIndex = _pageIndex;
		},
		setRows: (_rows) => {
			filteredRows = _rows;
		}
	});
	const stateContext = getContext('state');
	let isMobile = false;
	onMount(async () => {
		reload();
		isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	});
</script>

<Container>
	<div>
		<Row cols={{ xs: 1, md: 2 }} class="mt-1">
			<Col>
				<Search on:search={onSearch} text={input_search} />
			</Col>
			<Col>
				<InputGroup>
					<InputGroupText>
						{$_('remotetable.in')}
					</InputGroupText>
					<Input
						type="select"
						id="timespanSelect"
						bind:value={filter_tspan}
						on:change={async (e) => {
							e.preventDefault();
							filter_tspan = e.target.value;
							$filterStorage.tspan = filter_tspan;
							await load(page, 'onTspan');
						}}
					>
						{#each Object.keys(tspans) as key}
							<option value={key}>{tspans[key]}</option>
						{/each}
					</Input>
					<Button
						on:click={() => {
							if (show_calendar_select) {
								calendar_begin = '';
								calendar_end = '';
								$filterStorage.calendar_begin = calendar_begin;
								$filterStorage.calendar_end = calendar_end;
								show_calendar_select = false;
								refresh(null);
							} else {
								show_calendar_select = true;
							}
						}}
					>
						<i class="bi bi-calendar4-week" />
					</Button>
				</InputGroup>
			</Col>
		</Row>
		{#if show_calendar_select}
			<Row cols={{ xs: 1, md: 2 }} class="mt-1">
				<Col>
					<InputGroup>
						<InputGroupText>Begin:</InputGroupText>
						<Input type="date" bind:value={calendar_begin} on:change={calendar_changed} />
					</InputGroup>
				</Col>
				<Col>
					<InputGroup>
						<InputGroupText>End:</InputGroupText>
						<Input type="date" bind:value={calendar_end} on:change={calendar_changed} />
						<Button on:click={calendar_changed} color="primary">
							<i class="bi bi-arrow-return-left" />
						</Button>
					</InputGroup>
				</Col>
			</Row>
		{/if}
	</div>
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
			<PageSize />
		</div>
		<div class="flex-shrink-1">
			<ColPerRowSelection />
		</div>
	</div>
	<Row cols={$filterStorage.col_per_row}>
		{#each rows as row, index (row)}
			<Col class="mb-2 card py-2">
				<div class="">
					<div class="">
						<div class="d-flex">
							<div class="w-100">
								<h5 class="">
									<a
										class="preview-link   kfk-work-id tnt-work-id"
										href={'#'}
										on:click|preventDefault={(e) => {
											e.preventDefault();
											gotoWorkitem(row);
										}}
									>
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
							<Col>
								{$_('remotetable.belongTo')}:
								<a
									class="kfk-link fs-6"
									href={'#'}
									on:click={(e) => {
										e.preventDefault();
										gotoWorkflow(row.wfid);
									}}
								>
									{row.wftitle}
								</a>
							</Col>
						</Row>
					</div>
				</div>
			</Col>
		{/each}
	</Row>
</Container>

<Pagination
	{page}
	pageSize={$filterStorage.pageSize}
	count={rowsCount}
	serverSide={true}
	{isMobile}
	on:pageChange={onPageChange}
/>
<Confirm bind:this={theConfirm} />
