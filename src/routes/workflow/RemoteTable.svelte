<script type="ts">
	import * as api from '$lib/api';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { session } from '$app/stores';
	import type { Workflow } from '$lib/types';
	import moment from 'moment';
	import { StatusLabel } from '$lib/lang';
	import Table, { Pagination, Search, Sort } from '$lib/pagination/Table.svelte';
	import { goto } from '$app/navigation';
	import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, NavLink, Icon } from 'sveltestrap';
	import { getData } from '$lib/pagination/Server.js';
	import { ClientPermControl } from '$lib/clientperm';

	export let token;
	export let payload_extra;
	export let endpoint;
	export let user;
	let rows: Workflow[] = [] as Workflow[];
	let page = 0; //first page
	let pageIndex = 0; //first row
	let pageSize = 10; //optional, 10 by default

	let loading = true;
	let rowsCount = 0;
	let text;
	let sorting = { dir: 'desc', key: 'updatedAt' };

	async function load(_page: number) {
		loading = true;
		const data = await getData(endpoint, token, _page, pageSize, text, sorting, payload_extra);
		rows = data.rows;
		for (let i = 0; i < rows.length; i++) {
			rows[i].statusLabel = StatusLabel(rows[i].status);
		}
		rowsCount = data.rowsCount;
		loading = false;
	}

	function onPageChange(event) {
		load(event.detail.page);
		page = event.detail.page;
	}

	async function onSearch(event) {
		text = event.detail.text;
		await load(page);
		page = 0;
	}

	export async function refresh(detail) {
		if (detail && detail.text) text = detail.text;
		if (detail && detail.page) page = detail.page;
		if (detail && detail.sorting) sorting = detail.sorting;
		if (detail && detail.payload_extra) payload_extra = detail.payload_extra;
		await load(page);
	}

	async function onSort(event) {
		sorting = { dir: event.detail.dir, key: event.detail.key };
		await load(page);
	}

	const opWorkflow = async function (workflow: Workflow, op: string): Promise<void> {
		if (op === 'startAnother') {
			goto(`/template/start?tplid=${workflow.tplid}`);
			return;
		} else if (op === 'works') {
			let user = $session.user;
			user.extra.input_search = 'wf:' + workflow.wfid;
			$session.user = user;
			goto('/work');
			return;
		} else if (op === 'works_running') {
			let user = $session.user;
			user.extra = { input_search: 'wf:' + workflow.wfid, filter_status: 'ST_RUN' };
			$session.user = user;
			goto('/work');
			return;
		} else if (op === 'works_all') {
			let user = $session.user;
			user.extra = { input_search: 'wf:' + workflow.wfid, filter_status: 'All' };
			$session.user = user;
			goto('/work');
			return;
		} else if (op === 'viewTemplate') {
			$session.wfid = workflow.wfid;
			goto(`/template/@${workflow.tplid}&read`);
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
	};

	let fade_message = '';
	let fade_timer: any;
	function setFadeMessage(message: string, time = 2000) {
		fade_message = message;
		if (fade_timer) clearTimeout(fade_timer);
		fade_timer = setTimeout(() => {
			fade_message = '';
		}, time);
	}
</script>

<Table {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>
	<div slot="top">
		<Search on:search={onSearch} />
	</div>
	<thead slot="head">
		<tr>
			<th>
				Title
				<Sort key="wftitle" on:sort={onSort} />
			</th>
			<th>
				Status
				<Sort key="status" on:sort={onSort} />
			</th>
			<th>
				Starter
				<Sort key="starter" on:sort={onSort} />
			</th>
			<th>
				Updated at
				<Sort key="updatedAt" dir="desc" on:sort={onSort} />
			</th>
			<th> &nbsp; </th>
		</tr>
	</thead>
	<tbody>
		{#each rows2 as row, index (row)}
			<tr
				transition:scale|local={{ start: 0.7 }}
				animate:flip={{ duration: 1000 }}
				class:kfk-odd={index % 2 !== 0}
				class:tnt-odd={index % 2 !== 0}
				class:kfk-even={index % 2 === 0}
				class:tnt-even={index % 2 === 0}
			>
				<td data-label="Title">
					<a class="preview-link kfk-workflow-id tnt-workflow-id" href="/workflow/@{row.wfid}">
						{row.wftitle}
					</a>
				</td>
				<td data-label="Status">{row.statusLabel}</td>
				<td data-label="Starter">{row.starter}</td>
				<td data-label="Updated at">{moment(row.updatedAt).format('LLLL')}</td>
				<td>
					<Dropdown>
						<DropdownToggle caret color="notexist" class="btn-sm">Actions</DropdownToggle>
						<DropdownMenu>
							<DropdownItem>
								<a
									class="nav-link"
									href={'#'}
									on:click|preventDefault={() => opWorkflow(row, 'works_running')}
								>
									<Icon name="list-check" /> Running Works
								</a>
							</DropdownItem>
							<DropdownItem>
								<a
									class="nav-link"
									href={'#'}
									on:click|preventDefault={() => opWorkflow(row, 'works_all')}
								>
									<Icon name="list-check" /> All Works
								</a>
							</DropdownItem>
							{#if ClientPermControl(user.perms, user.email, 'workflow', row, 'update')}
								{#if row.status === 'ST_RUN'}
									<DropdownItem>
										<NavLink on:click={() => opWorkflow(row, 'pause')}>
											<Icon name="pause-btn" /> Pause
										</NavLink>
									</DropdownItem>
								{/if}
								{#if row.status === 'ST_PAUSE'}
									<DropdownItem>
										<NavLink on:click={() => opWorkflow(row, 'resume')}>
											<Icon name="arrow-counterclockwise" /> Resume
										</NavLink>
									</DropdownItem>
								{/if}
								{#if row.status === 'ST_PAUSE' || row.status === 'ST_RUN'}
									<DropdownItem>
										<NavLink on:click={() => opWorkflow(row, 'stop')}>
											<Icon name="slash-square" /> Stop
										</NavLink>
									</DropdownItem>
								{/if}
								{#if ['ST_RUN', 'ST_PAUSE', 'ST_STOP'].indexOf(row.status) > -1}
									<DropdownItem>
										<NavLink on:click={() => opWorkflow(row, 'restart')}>
											<Icon name="caret-right-square" /> Restart
										</NavLink>
									</DropdownItem>
								{/if}
							{:else}
								{#if row.status === 'ST_RUN'}
									<DropdownItem>
										<NavLink disabled>
											<Icon name="pause-btn" /> Pause
										</NavLink>
									</DropdownItem>
								{/if}
								{#if row.status === 'ST_PAUSE'}
									<DropdownItem>
										<NavLink disabled>
											<Icon name="arrow-counterclockwise" /> Resume
										</NavLink>
									</DropdownItem>
								{/if}
								{#if row.status === 'ST_PAUSE' || row.status === 'ST_RUN'}
									<DropdownItem>
										<NavLink disabled>
											<Icon name="slash-square" /> Stop
										</NavLink>
									</DropdownItem>
								{/if}
								{#if ['ST_RUN', 'ST_PAUSE', 'ST_STOP'].indexOf(row.status) > -1}
									<DropdownItem>
										<NavLink disabled>
											<Icon name="caret-right-square" /> Restart
										</NavLink>
									</DropdownItem>
								{/if}
							{/if}
							<DropdownItem>
								{#if ClientPermControl(user.perms, user.email, 'workflow', '', 'create')}
									<NavLink on:click={() => opWorkflow(row, 'startAnother')}>
										<Icon name="caret-right-fill" />
										Start Another
									</NavLink>
								{:else}
									<NavLink disabled>
										<Icon name="caret-right-fill" />
										Start Another
									</NavLink>
								{/if}
							</DropdownItem>
							<DropdownItem>
								<NavLink on:click={() => opWorkflow(row, 'viewTemplate')}>
									<Icon name="code-square" />
									View Template
								</NavLink>
							</DropdownItem>
							<DropdownItem>
								<NavLink on:click={() => opWorkflow(row, 'viewInstanceTemplate')}
									><Icon name="code" />
									View Instance Template
								</NavLink>
							</DropdownItem>
							<DropdownItem>
								{#if ClientPermControl(user.perms, user.email, 'workflow', row, 'delete')}
									<NavLink on:click={() => opWorkflow(row, 'destroy')}>
										<Icon name="trash" />
										Delete this workflow
									</NavLink>
								{:else}
									<NavLink disabled>
										<Icon name="trash" />
										Delete this workflow
									</NavLink>
								{/if}
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</td>
			</tr>
		{/each}
	</tbody>
	<div slot="bottom">
		<Pagination
			{page}
			{pageSize}
			count={rowsCount}
			serverSide={true}
			on:pageChange={onPageChange}
		/>
	</div>
</Table>
