<svelte:options accessors />

<script type="ts">
	import { _, date, time } from '$lib/i18n';
	import * as api from '$lib/api';
	import { filterStorage } from '$lib/empstores';
	import { tspans } from '$lib/variables';
	import Confirm from '$lib/confirm.svelte';
	import Parser from '$lib/parser';
	import { onMount } from 'svelte';
	import type { Workflow } from '$lib/types';
	import { StatusLabel } from '$lib/status';
	import Table, { Pagination, Search, Sort } from '$lib/pagination/Table.svelte';
	import { goto } from '$app/navigation';
	import {
		Container,
		Row,
		Col,
		InputGroup,
		InputGroupText,
		Input,
		Icon,
		Button
	} from 'sveltestrap';
	import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, NavLink } from 'sveltestrap';
	import { getData } from '$lib/pagination/Server.js';
	import { ClientPermControl } from '$lib/clientperm';
	import { createEventDispatcher, getContext, setContext } from 'svelte';

	export let token;
	export let endpoint;
	export let user;
	let rows: Workflow[] = [] as Workflow[];
	let page = 0; //first page
	let pageIndex = 0; //first row
	let theConfirm;
	let pageSize = user && user.ps ? user.ps : 10; //optional, 10 by default

	let loading = true;
	let rowsCount = 0;
	let input_search;
	let filter_tspan = '1w';
	let show_calendar_select = false;
	let setPboAtFor = '';
	let setTitleFor = '';
	let calendar_begin = '';
	let calendar_end = '';
	let sorting = { dir: 'desc', key: 'updatedAt' };
	let storeSorting = $filterStorage.wfSorting;

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
	if (storeSorting) {
		if (storeSorting.dir && storeSorting.key) {
			sorting = storeSorting;
		} else {
			$filterStorage.wfSorting = sorting;
		}
	}
	let storeTspan = $filterStorage.tspan;
	if (storeTspan && Object.keys(tspans).includes(storeTspan)) {
		filter_tspan = storeTspan;
	} else {
		filter_tspan = '1w';
	}

	async function load(_page: number) {
		loading = true;
		let fltSt = $filterStorage;
		let payload_extra = {
			status: fltSt.wfStatus,
			starter: fltSt.starter,
			tspan: fltSt.tspan
		};
		if (fltSt.tplTag) {
			payload_extra['tagsForFilter'] = fltSt.tplTag.split(';');
		}
		if (fltSt.tplid && fltSt.tplid.trim().length > 0) {
			payload_extra['tplid'] = fltSt.tplid.trim();
		}

		if (Parser.isEmpty(payload_extra.starter)) {
			delete payload_extra.starter;
		} else if (Parser.isEmpty(payload_extra.starter.trim())) {
			delete payload_extra.starter;
		}

		if (Parser.hasValue(fltSt.calendar_begin) && Parser.hasValue(fltSt.calendar_end)) {
			payload_extra['calendar_begin'] = fltSt.calendar_begin;
			payload_extra['calendar_end'] = fltSt.calendar_end;
		}
		const data = await getData(
			endpoint,
			token,
			_page,
			pageSize,
			input_search,
			sorting,
			payload_extra
		);
		if (data && data.rows) {
			rows = data.rows;
			for (let i = 0; i < rows.length; i++) {
				rows[i].statusLabel = StatusLabel(rows[i].status);
			}
			rowsCount = data.rowsCount;
		}
		loading = false;
	}

	function onPageChange(event) {
		load(event.detail.page);
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
		$filterStorage.wfTitlePattern = input_search;
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
		$filterStorage.wfSorting = sorting;
		await load(page);
	}

	const opWorkflow = async function (workflow: Workflow, op: string): Promise<void> {
		if (op === 'startAnother') {
			goto(`/template/start?tplid=${workflow.tplid}`);
			return;
		} else if (op === 'works') {
			$filterStorage.tplid = workflow.tplid;
			$filterStorage.workTitlePattern = 'wf:' + workflow.wfid;
			goto('/work');
			return;
		} else if (op === 'works_running') {
			$filterStorage.tplid = workflow.tplid;
			$filterStorage.workTitlePattern = 'wf:' + workflow.wfid;
			$filterStorage.workStatus = 'ST_RUN';
			goto('/work');
			return;
		} else if (op === 'works_all') {
			$filterStorage.tplid = workflow.tplid;
			$filterStorage.workTitlePattern = 'wf:' + workflow.wfid;
			$filterStorage.workStatus = 'All';
			goto('/work');
			return;
		} else if (op === 'viewTemplate') {
			goto(`/template/@${workflow.tplid}&read`);
			return;
		}

		if (op === 'setpboat') {
			setPboAtFor = workflow.wfid;
			return;
		}
		if (op === 'setTitle') {
			setTitleFor = workflow.wfid;
			return;
		}

		if (op === 'viewInstanceTemplate') {
			let payload = { wfid: workflow.wfid };
			let ret = await api.post('workflow/dump/instemplate', payload, token);
			goto(`template/@${workflow.wfid}_instemplate&read`);
			return;
		}

		let payload = { wfid: workflow.wfid, op: op };
		let ret: Workflow = (await api.post('workflow/op', payload, token)) as Workflow;
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
			await refresh({});
		}
		$filterStorage.workTitlePattern = 'wf:' + ret.wfid;
	};

	export function reset() {
		input_search = '';
	}
	export function reload() {
		input_search = $filterStorage.wfTitlePattern;
	}

	onMount(async () => {
		reload();
	});
	$: if ($filterStorage) {
		filter_tspan = $filterStorage.tspan;
		input_search = $filterStorage.wfTitlePattern;
	}
	const stateContext = getContext('state');
</script>

<Container>
	<div>
		<Row cols={{ xs: 1, md: 2 }} class="mt-1">
			<Col>
				<Search on:search={onSearch} text={input_search} />
			</Col>
			<Col>
				<InputGroup>
					<InputGroupText>{$_('remotetable.in')}</InputGroupText>
					<Input
						type="select"
						id="timespanSelect"
						bind:value={filter_tspan}
						on:change={async (e) => {
							e.preventDefault();
							filter_tspan = e.target.value;
							$filterStorage.tspan = filter_tspan;
							await load(page);
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
						<InputGroupText>{$_('remotetable.calendarBegin')}</InputGroupText>
						<Input type="date" bind:value={calendar_begin} on:change={calendar_changed} />
					</InputGroup>
				</Col>
				<Col>
					<InputGroup>
						<InputGroupText>
							{$_('remotetable.calendarEnd')}
						</InputGroupText>
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
							}}
						>
							{$_('remotetable.cols-4')}
						</a>
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</div>
	</div>
	<Row cols={$filterStorage.col_per_row}>
		{#each rows as row, index (row)}
			<Col>
				<div class="card">
					<div class="card-body">
						<div class="d-flex">
							<div class="w-100">
								<h5 class="card-title">
									{row.wftitle}
									{#if row.rehearsal}
										<i class="bi-patch-check" />
									{/if}
								</h5>
							</div>
							<div class="flex-shrink-1">
								<Dropdown class="m-0 p-0">
									<DropdownToggle caret color="notexist" class="btn-sm">
										{$_('remotetable.actions')}
									</DropdownToggle>
									<DropdownMenu>
										<DropdownItem>
											<a
												class="nav-link"
												href={'#'}
												on:click|preventDefault={() => opWorkflow(row, 'works_all')}
											>
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
												<NavLink on:click={() => opWorkflow(row, 'setTitle')}>
													<Icon name="caret-right-square" />
													{$_('remotetable.wfa.setTitle')}
												</NavLink>
											</DropdownItem>
										{:else}
											{#if row.status === 'ST_RUN'}
												<DropdownItem>
													<NavLink disabled>
														<Icon name="pause-btn" />
														{$_('remotetable.wfa.pause')}
													</NavLink>
												</DropdownItem>
											{/if}
											{#if row.status === 'ST_PAUSE'}
												<DropdownItem>
													<NavLink disabled>
														<Icon name="arrow-counterclockwise" />
														{$_('remotetable.wfa.resume')}
													</NavLink>
												</DropdownItem>
											{/if}
											{#if row.status === 'ST_PAUSE' || row.status === 'ST_RUN'}
												<DropdownItem>
													<NavLink disabled>
														<Icon name="slash-square" />
														{$_('remotetable.wfa.stop')}
													</NavLink>
												</DropdownItem>
											{/if}
											{#if ['ST_RUN', 'ST_PAUSE', 'ST_STOP'].indexOf(row.status) > -1}
												<DropdownItem>
													<NavLink disabled>
														<Icon name="caret-right-square" />
														{$_('remotetable.wfa.restart')}
													</NavLink>
												</DropdownItem>
											{/if}
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
															}
														];
														theConfirm.toggle();
													}}
												>
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
															}
														];
														theConfirm.toggle();
													}}
												>
													<Icon name="trash" />
													{$_('remotetable.wfa.restartthendeleteThisWorkflow')}
												</NavLink>
											</DropdownItem>
										{/if}
									</DropdownMenu>
								</Dropdown>
							</div>
						</div>
						<Row cols={{ lg: 3, md: 2, xs: 1 }}>
							<Col>
								<h6 class="card-subtitle mb-2 text-muted">
									<a
										class="preview-link kfk-workflow-id tnt-workflow-id"
										href="/workflow/@{row.wfid}/monitor"
									>
										{row.statusLabel}
									</a>
								</h6>
							</Col>
							<Col>Starter: {Parser.userDisplay(row.starter, user.email)}</Col>
							<Col>
								Updated at: {$date(new Date(row.updatedAt))}
								{$time(new Date(row.updatedAt))}
							</Col>
						</Row>
						<div class="card-text row" />
						<a
							href="#"
							class="card-link"
							on:click|preventDefault={() => opWorkflow(row, 'works_running')}
						>
							{$_('remotetable.wfa.runningWorks')}
						</a>
						<a href="#" class="card-link" on:click={() => opWorkflow(row, 'viewTemplate')}>
							{$_('remotetable.wfa.viewTemplate')}
						</a>
						{#if setTitleFor === row.wfid}
							<div>Set Title to:</div>
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
											user.sessionToken
										);
										setTitleFor = '';
									}}
								>
									Set
								</Button>
								<Button
									size="sm"
									color="secondary"
									on:click={async (e) => {
										e.preventDefault();
										setTitleFor = '';
									}}
								>
									Cancel
								</Button>
							</InputGroup>
						{/if}
					</div>
				</div>
			</Col>
		{/each}
	</Row>
	{$_('remotetable.totalRows')}: {rowsCount}
	{$_('remotetable.pageSize')}: {pageSize}
	<Pagination {page} {pageSize} count={rowsCount} serverSide={true} on:pageChange={onPageChange} />
</Container>

<Confirm bind:this={theConfirm} />
