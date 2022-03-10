<svelte:options accessors />

<script lang="ts">
	//Row component is optional and only serves to render odd/even row, you can use <tr> instead.
	//Sort component is optional
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import Confirm from '$lib/confirm.svelte';
	import { session } from '$app/stores';
	import ItemEditor from './TplSearchResultItemEditor.svelte';
	import AniIcon from '$lib/AniIcon.svelte';
	import { onMount } from 'svelte';
	import Parser from '$lib/parser';
	import { qtb } from '$lib/utils';
	import { filterStorage } from '$lib/empstores';
	import { ClientPermControl } from '$lib/clientperm';
	import Table, { Pagination, Search, Sort } from '$lib/pagination/Table.svelte';
	import { goto } from '$app/navigation';
	import {
		Dropdown,
		DropdownItem,
		DropdownMenu,
		NavLink,
		DropdownToggle,
		Icon,
		Container,
		Row,
		Col,
		InputGroup,
		InputGroupText,
		Input,
		Button,
		Badge
	} from 'sveltestrap';
	import { getData } from '$lib/pagination/Server.js';
	import { createEventDispatcher, getContext, setContext } from 'svelte';

	export let TimeTool;
	export let reloadTags;
	export let endpoint;
	export let rows = [];
	export let user = $session.user;
	export let setFadeMessage;
	let page = 0; //first page
	let pageIndex = 0; //first row
	let theConfirm;
	let pageSize = user && user.ps ? user.ps : 10; //optional, 10 by default
	let SetFor = {
		setVisiFor: '',
		setAuthorFor: '',
		setDescFor: '',
		setTagFor: '',
		settingFor: ''
	};

	let loading = true;
	export let rowsCount = 0;
	let filter_author = '';
	let input_search;
	let sorting = { dir: 'desc', key: 'updatedAt' };
	let storeSorting = $filterStorage.tplSorting;
	if (storeSorting) {
		if (storeSorting.dir && storeSorting.key) {
			sorting = storeSorting;
		} else {
			$filterStorage.tplSorting = sorting;
		}
	}
	$: filteredRows = rows;

	setContext('state', {
		getState: () => ({
			page,
			pageIndex,
			pageSize,
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

	export function reset() {
		filter_author = '';
		$filterStorage.author = filter_author;
		input_search = '';
	}
	export async function reload() {
		input_search = $filterStorage.tplTitlePattern;
		await load(page);
	}

	const authorChanged = async function () {
		if (Parser.isEmpty(filter_author)) {
		} else {
			if (filter_author[0] === '@') {
				filter_author = filter_author.substring(1);
			}
			if (filter_author.indexOf('@') < 0) {
				filter_author += user.email.substring(user.email.indexOf('@'));
			}
		}
		$filterStorage.author = filter_author;
		await load(page);
	};
	async function load(_page) {
		loading = true;
		let tagsForFilter = $filterStorage.tplTag.split(';');
		const data = await getData(
			endpoint,
			user.sessionToken,
			_page,
			pageSize,
			input_search,
			sorting,
			{
				tagsForFilter: tagsForFilter,
				author: $filterStorage.author
			}
		);
		rows = data.rows;
		rowsCount = data.rowsCount;
		loading = false;
	}

	export const unshiftRows = function (obj) {
		rows = [obj, ...rows];
		rowsCount = rowsCount + 1;
	};

	function onPageChange(event) {
		load(event.detail.page);
		page = event.detail.page;
	}

	async function onSearch(event) {
		input_search = event.detail.text;
		$filterStorage.tplTitlePattern = input_search.toString();
		await load(page);
		page = 0;
	}

	export async function refresh(detail) {
		if (detail && detail.page) page = detail.page;
		if (detail && detail.sorting) sorting = detail.sorting;
		await load(page);
	}

	async function onSort(event) {
		sorting = { dir: event.detail.dir, key: event.detail.key };
		$filterStorage.tplSorting = sorting;
		await load(page);
	}

	let desc_input = '';
	let visi_rds_input = '';

	async function deleteRow(tplid) {
		let res = await api.post('template/delete/byname', { tplid: tplid }, user.sessionToken);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
		} else {
			let deletedIndex = -1;
			for (let i = 0; i < rows.length; i++) {
				if (rows[i].tplid === tplid) {
					deletedIndex = i;
					break;
				}
			}
			if (deletedIndex >= 0) {
				rows.splice(deletedIndex, 1);
				rows = rows;
				rowsCount = rowsCount - 1;
			}
		}
	}
	async function exportData(tplid) {
		//let res = await post('/template/data', { tplid: tplid }, user.sessionToken);
	}

	onMount(async () => {
		filter_author = $filterStorage.author;
		if (filter_author === null || filter_author === undefined) {
			filter_author = '';
			$filterStorage.author = filter_author;
		}
	});
	const stateContext = getContext('state');
	let col_per_row = $filterStorage.col_per_row;
	if ([1, 2, 3, 4].includes(col_per_row) === false) {
		col_per_row = 1;
		$filterStorage.col_per_row = col_per_row;
	}
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
						{$_('remotetable.author')}
					</InputGroupText>
					<Input
						class="flex-fill"
						bind:value={filter_author}
						aria-label="Author"
						placeholder="author email"
					/>
					<Button on:click={authorChanged} color="primary">List</Button>
					<Button
						on:click={async () => {
							filter_author = user.email;
							await authorChanged();
						}}
						class="btn-outline-primary m-0 py-1 px-3"
						color={'light'}
					>
						{$_('remotetable.me')}
					</Button>
					<Button
						on:click={async () => {
							filter_author = '';
							await authorChanged();
						}}
						class="btn-outline-primary m-0 py-1 px-3"
						color="light"
					>
						{$_('remotetable.any')}
					</Button>
				</InputGroup>
			</Col>
		</Row>
	</div>
	<div class="d-flex mt-2 p-0 w-100">
		<div class="w-100">
			<Row>
				<Col>{$_('remotetable.sortBy')}:</Col>
				<Col>
					{$_('remotetable.name')}
					<Sort key="tplid" on:sort={onSort} />
				</Col>
				<Col>
					{$_('remotetable.author')}
					<Sort key="author" on:sort={onSort} />
				</Col>
			</Row>
		</div>
		<div class="flex-shrink-1">
			<Dropdown class="m-0 p-0">
				<DropdownToggle caret color="notexist" class="btn-sm">
					{$_('remotetable.colperrow')}
				</DropdownToggle>
				<DropdownMenu>
					<DropdownItem>
						<a
							class="nav-link"
							href={'#'}
							on:click|preventDefault={() => {
								$filterStorage.col_per_row = 1;
								col_per_row = 1;
							}}
						>
							{$_('remotetable.cols-1')}
						</a>
					</DropdownItem>
					<DropdownItem>
						<a
							class="nav-link"
							href={'#'}
							on:click|preventDefault={() => {
								$filterStorage.col_per_row = 2;
								col_per_row = 2;
							}}
						>
							{$_('remotetable.cols-2')}
						</a>
					</DropdownItem>
					<DropdownItem>
						<a
							class="nav-link"
							href={'#'}
							on:click|preventDefault={() => {
								$filterStorage.col_per_row = 3;
								col_per_row = 3;
							}}
						>
							{$_('remotetable.cols-3')}
						</a>
					</DropdownItem>
					<DropdownItem>
						<a
							class="nav-link"
							href={'#'}
							on:click|preventDefault={() => {
								$filterStorage.col_per_row = 4;
								col_per_row = 4;
							}}
						>
							{$_('remotetable.cols-4')}
						</a>
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</div>
	</div>
	<!-- code><pre>
			{JSON.stringify(rows, null, 2)}
	</pre></code -->
	<Row cols={col_per_row}>
		{#each rows as row, index (row)}
			<Col class="mb-2 card py-2">
				<div class="">
					<div class="">
						<div class="d-flex">
							<div class="w-100">
								<h5 class="">
									{row.tplid}
								</h5>
							</div>
							<div class="flex-shrink-1">
								<Dropdown class="m-0 p-0">
									<DropdownToggle caret color="notexist" class="btn-sm">
										{$_('remotetable.actions')}
									</DropdownToggle>
									<DropdownMenu>
										<DropdownItem>
											{$_('remotetable.tplaction.lastUpdate')}: {TimeTool.format(
												row.updatedAt,
												'lll'
											)}
										</DropdownItem>
										{#if user.perms && ClientPermControl(user.perms, user.email, 'workflow', '', 'create')}
											<DropdownItem>
												<a
													href={'#'}
													on:click|preventDefault={() => {
														goto(`template/start?tplid=${row.tplid}`, { replaceState: false });
													}}
													class="nav-link "
													><Icon name="caret-right-square" />
													{$_('remotetable.tplaction.startIt')}
												</a>
											</DropdownItem>
										{/if}
										<DropdownItem>
											<a
												href={'#'}
												on:click|preventDefault={async () => {
													$filterStorage.tplid = row.tplid;
													goto('/workflow');
												}}
												class="nav-link "
												><Icon name="bar-chart-steps" />
												{$_('remotetable.tplaction.seeWorkflows')}
											</a>
										</DropdownItem>
										<DropdownItem>
											<a
												href={'#'}
												on:click|preventDefault={async () => {
													$filterStorage.tplid = row.tplid;
													goto('/work');
												}}
												class="nav-link "
												><Icon name="bar-chart-steps" />
												{$_('remotetable.tplaction.seeWorklist')}
											</a>
										</DropdownItem>
										{#if user.perms && ClientPermControl(user.perms, user.email, 'template', row, 'delete')}
											<DropdownItem>
												<a
													href={'#'}
													on:click|preventDefault={(e) => {
														e.preventDefault();
														SetFor.setVisiFor = row.tplid;
														SetFor.setAuthorFor = row.tplid;
														SetFor.setDescFor = row.tplid;
														SetFor.setTagFor = row.tplid;
														SetFor.settingFor = row.tplid;
														row.checked = false;
														visi_rds_input = row.visi;
													}}
													class="nav-link "
												>
													<Icon name="ui-checks-grid" />
													{$_('remotetable.tplaction.set')}
												</a>
											</DropdownItem>
											<DropdownItem>
												<a
													href={'#'}
													on:click|preventDefault={() => deleteRow(row.tplid)}
													class="nav-link "
													><Icon name="trash" />
													{$_('remotetable.tplaction.deleteThisTempalte')}
												</a>
											</DropdownItem>
											<DropdownItem>
												<a
													href={'#'}
													on:click|preventDefault={() => exportData(row.tplid)}
													class="nav-link "
													><Icon name="trash" />
													{$_('remotetable.tplaction.exportdata')}
												</a>
											</DropdownItem>
										{/if}
									</DropdownMenu>
								</Dropdown>
							</div>
						</div>
						<Row cols={{ md: 2, xs: 1 }}>
							<Col>
								{$_('remotetable.author')}:
								{row.authorName
									? row.authorName
									: row.author.indexOf('@') > -1
									? row.author.substring(0, row.author.indexOf('@'))
									: row.author}
							</Col>
							<Col>
								{#if user.perms && ClientPermControl(user.perms, user.email, 'workflow', '', 'create')}
									<a
										href={'#'}
										on:click|preventDefault={() => {
											goto(`template/start?tplid=${row.tplid}`, { replaceState: false });
										}}
										class="nav-link "
									>
										<Icon name="caret-right-square" />
										{$_('remotetable.startIt')}
									</a>
								{/if}
							</Col>
						</Row>
						<ItemEditor
							{rows}
							{row}
							{visi_rds_input}
							{user}
							{index}
							{desc_input}
							{setFadeMessage}
							{reloadTags}
							{SetFor}
							on:authorSet={(e) => {
								row = e.detail;
								rows[index] = row;
								SetFor.setAuthorFor = '';
							}}
						/>
					</div>
				</div>
			</Col>
		{/each}
	</Row>
	<Pagination {page} {pageSize} count={rowsCount} serverSide={true} on:pageChange={onPageChange} />
</Container>

<Confirm bind:this={theConfirm} />
