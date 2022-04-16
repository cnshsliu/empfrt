<svelte:options accessors />

<script lang="ts">
	//Row component is optional and only serves to render odd/even row, you can use <tr> instead.
	//Sort component is optional
	import { _, date, time } from '$lib/i18n';
	import * as api from '$lib/api';
	import Confirm from '$lib/confirm.svelte';
	import { session } from '$app/stores';
	import ItemEditor from './TplSearchResultItemEditor.svelte';
	import ColPerRowSelection from '$lib/ColPerRowSelection.svelte';
	import PageSize from '$lib/PageSize.svelte';
	import AniIcon from '$lib/AniIcon.svelte';
	import { onMount } from 'svelte';
	import Parser from '$lib/parser';
	import { qtb } from '$lib/utils';
	import { filterStorage } from '$lib/empstores';
	import { ClientPermControl } from '$lib/clientperm';
	import PDSResolver from '$lib/input/PDSResolver.svelte';
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
	let SetFor = {
		setVisiFor: '',
		setAuthorFor: '',
		setDescFor: '',
		setTagFor: '',
		setWeComBotFor: '',
		settingFor: ''
	};

	let loading = true;
	export let rowsCount = 0;
	let editlogfor = '';
	let editlogs: any = [];
	let editCronFor = '';
	let cronStarters = '';
	let cronExpr = '1 * * * *';
	let crons = [];
	let filter_author = '';
	let input_search;
	let thePdsResolver;
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
	async function load(_page, reason = 'unknown') {
		loading = true;
		let tagsForFilter = $filterStorage.tplTag.split(';');
		const data = await getData(
			endpoint,
			user.sessionToken,
			_page,
			$filterStorage.pageSize,
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

	let isMobile = false;
	onMount(async () => {
		filter_author = $filterStorage.author;
		if (filter_author === null || filter_author === undefined) {
			filter_author = '';
			$filterStorage.author = filter_author;
		}
		isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	});
	const stateContext = getContext('state');

	const showCronTable = async function (e, tplid) {
		e.preventDefault();
		editCronFor = tplid;
		crons = (await api.post(
			'template/crons',
			{ tplid: tplid },
			user.sessionToken
		)) as unknown as any[];
		console.log(crons);
	};

	const addCron = async function (e, tplid) {
		crons = (await api.post(
			'template/addcron',
			{ tplid: tplid, expr: cronExpr, starters: cronStarters },
			user.sessionToken
		)) as unknown as any[];
		e.preventDefault();
	};

	const deleteCrontab = async function (e, tplid, cronId) {
		crons = (await api.post(
			'template/delcron',
			{ id: cronId, tplid: tplid },
			user.sessionToken
		)) as unknown as any[];
		e.preventDefault();
		console.log(crons);
	};
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
			<PageSize
				on:pagesize={async (e) => {
					await load(0, 'change page size');
				}}
			/>
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
			<Col class="mb-2 card py-2">
				<div class="">
					<div class="">
						<div class="d-flex">
							<div class="w-100">
								<h5 class="">
									<a class="kfk-workflow-id tnt-workflow-id" href={`/template/@${row.tplid}&read`}>
										{row.tplid}
									</a>
									{#if row.cron > 0}
										<Button
											class="m-0 ms-3 p-0"
											on:click={(e) => {
												e.preventDefault();
												showCronTable(e, row.tplid);
											}}
										>
											crontab
										</Button>
									{/if}
								</h5>
							</div>
							<div class="flex-shrink-1">
								<Dropdown class="m-0 p-0">
									<DropdownToggle caret color="primary" class="btn-sm">
										{$_('remotetable.actions')}
									</DropdownToggle>
									<DropdownMenu class="bg-light">
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
												>
													<Icon name="play-circle-fill" />
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
														SetFor.setWeComBotFor = row.tplid;
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
												>
													<Icon name="cloud-download" />
													{$_('remotetable.tplaction.exportdata')}
												</a>
											</DropdownItem>
											<DropdownItem>
												<a
													href={'#'}
													on:click|preventDefault={async (e) => {
														e.preventDefault();
														editlogs = await api.post(
															'/template/editlog',
															{ tplid: row.tplid },
															user.sessionToken
														);
														editlogfor = row.tplid;
														visi_rds_input = row.visi;
													}}
													class="nav-link "
												>
													<Icon name="ui-checks-grid" />
													{$_('remotetable.tplaction.editors')}
												</a>
											</DropdownItem>
											<DropdownItem>
												<a
													href={'#'}
													on:click|preventDefault={(e) => {
														showCronTable(e, row.tplid);
													}}
													class="nav-link "
												>
													<Icon name="ui-checks-grid" />
													{$_('remotetable.tplaction.scheduler')}
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
										<Icon name="play-circle-fill" />
										{$_('remotetable.startIt')}
									</a>
								{/if}
							</Col>
						</Row>
						{#if editlogfor === row.tplid}
							<Container>
								<Row>
									<Button
										color="primary"
										on:click={(e) => {
											e.preventDefault();
											editlogfor = '';
										}}>Close</Button
									>
								</Row>
								{#each editlogs as elog}
									<Row>
										<Col>{TimeTool.format(elog.updatedAt, 'lll')}</Col><Col>{elog.editorName}</Col>
										<Col>{elog.editor}</Col>
									</Row>
								{/each}
							</Container>
						{/if}
						{#if editCronFor === row.tplid}
							<Container class="border border-2 rounded py-2">
								<Row>
									<!-- svelte-ignore missing-declaration -->
									<Button
										color="primary"
										on:click={(e) => {
											e.preventDefault();
											editCronFor = '';
										}}
									>
										Close
									</Button>
									<div class="text-center">
										<a href="https://crontab-generator.org" target="_crontabgenerator"
											>Crontab Generator</a
										>
									</div>
								</Row>
								{#each crons as cron}
									<Row>
										<Col>{cron.starters}</Col><Col>{cron.expr}</Col>
										<Col>
											<Button
												size="sm"
												on:click={async (e) => {
													await deleteCrontab(e, cron.tplid, cron._id);
												}}
											>
												Del
											</Button>
										</Col>
									</Row>
								{/each}
								<Row>
									<InputGroup class="p-0">
										<!-- 只有管理员可以指定其它用户，普通用户没有这个输入框，只能自己用 -->
										{#if user.group === 'ADMIN'}
											<InputGroupText>Starters</InputGroupText>
											<Input bind:value={cronStarters} />
											<PDSResolver
												bind:this={thePdsResolver}
												bind:value={cronStarters}
												readonly={false}
												label={'Starters'}
												btnText={'Check'}
											/>
										{/if}
										<Input bind:value={cronExpr} />
										<Button
											color="primary"
											on:click={(e) => {
												addCron(e, row.tplid);
											}}
										>
											Add
										</Button>
										<Button
											class="ms-1"
											on:click={(e) => {
												startNow(e, row.tplid);
											}}
										>
											Start Now
										</Button>
									</InputGroup>
								</Row>
							</Container>
						{/if}
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
