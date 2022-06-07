<svelte:options accessors />

<script type="ts">
	import { _, date, time } from '$lib/i18n';
	import * as Utils from '$lib/utils';
	import * as api from '$lib/api';
	import series from 'async/series';
	import TagPicker from '$lib/TagPicker.svelte';
	import AniIcon from '$lib/AniIcon.svelte';
	import Miner from './Miner.svelte';
	import {
		miningMode,
		showAdvancedSearch,
		srPage,
		lastQuery,
		lastMining,
		worklistChangeFlag,
	} from '$lib/Stores';
	import { navigating, session } from '$app/stores';
	import { mtcConfirm, mtcConfirmReset } from '$lib/Stores';
	import { setFadeMessage } from '$lib/Notifier';
	import { filterStorage } from '$lib/empstores';
	import Searchlet from '$lib/Searchlet.svelte';
	import ColPerRowSelection from '$lib/ColPerRowSelection.svelte';
	import PageSize from '$lib/PageSize.svelte';
	import { tspans } from '$lib/variables';
	import Parser from '$lib/parser';
	import { onMount } from 'svelte';
	import type { Workflow } from '$lib/types';
	import { StatusLabel } from '$lib/status';
	import Pagination from '$lib/pagination/Pagination.svelte';
	import Sort from '$lib/pagination/Sort.svelte';
	import { goto } from '$app/navigation';
	import { Container, Row, Col, InputGroup, InputGroupText, Input, Icon } from 'sveltestrap';
	import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, NavLink } from 'sveltestrap';
	import { ClientPermControl } from '$lib/clientperm';
	import { createEventDispatcher, getContext, setContext } from 'svelte';

	const ENDPOINT_SEARCH = 'workflow/search';
	const ENDPOINT_MINING = 'workflow/mining';
	const MINING_BATCH_INTERVAL = 1000;
	const MINING_BATCH_NUMBER = 3;
	const BIZ = 'wf';
	let loadTimer = null;
	let LOADING_TIMEOUT = 400;
	if (!$filterStorage[BIZ]) {
		$filterStorage[BIZ] = { tplTag: '', sortby: '-updatedAt' };
	}
	if ($filterStorage[BIZ].hasOwnProperty('sortby') === false) {
		$filterStorage[BIZ].sortby = '-updatedAt';
	}

	let rows: Workflow[] = [] as Workflow[];
	let miningData = [];

	let loading = true;
	let rowsCount = 0;
	let show_calendar_select = false;
	let setPboAtFor = '';
	let settingFor = '';
	let user = $session.user;
	let aSsPicked = '';
	let statuses = [
		{ value: 'All', label: $_('status.All') },
		{ value: 'ST_RUN', label: $_('status.ST_RUN') },
		{ value: 'ST_PAUSE', label: $_('status.ST_PAUSE') },
		{ value: 'ST_DONE', label: $_('status.ST_DONE') },
	];

	if (!$session.tplIdsForSearch_for_wf) {
		$session.tplIdsForSearch_for_wf = [];
	}
	if ($filterStorage[BIZ].calendar_begin !== '' || $filterStorage[BIZ].calendar_end !== '') {
		show_calendar_select = true;
	} else {
		show_calendar_select = false;
	}

	$: filteredRows = rows;

	setContext('state', {
		getState: () => ({
			page: $srPage[BIZ],
			pageSize: $filterStorage.pageSize,
			rows,
			filteredRows,
		}),
		setPage: (_page) => {
			$srPage[BIZ] = _page;
		},
		setRows: (_rows) => {
			filteredRows = _rows;
		},
	});

	const clearTag = async function (preDelete = false) {
		$filterStorage[BIZ].tplTag = '';
		try {
			let tmp = await api.post(
				'template/tplid/list',
				{},
				user.sessionToken,
				preDelete ? api.CACHE_FLAG.preDelete : api.CACHE_FLAG.useIfExists,
			);
			$session.tplIdsForSearch_for_wf = tmp.map((x) => x.tplid);
			searchNow();
		} catch (err) {
			console.error(err);
		}
	};

	const useThisTag = async function (tag, appendMode = false) {
		if (appendMode) {
			let existingTags = $filterStorage[BIZ].tplTag;
			if (Parser.isEmpty(existingTags)) {
				existingTags = '';
			}
			let existingArr = existingTags.split(';');
			if (existingArr.includes(tag)) {
				existingArr = existingArr.filter((x) => x !== tag);
			} else {
				existingArr.push(tag);
				existingArr = existingArr.filter((x) => x.length > 0);
			}
			$filterStorage[BIZ].tplTag = existingArr.join(';');
		} else {
			if (tag.trim().length > 0) $filterStorage[BIZ].tplTag = tag.trim();
			else $filterStorage[BIZ].tplTag = '';
		}
		//$filterStorage[BIZ].tplid = '';
		let tmp = await api.post(
			'template/tplid/list',
			{ tags: $filterStorage[BIZ].tplTag },
			user.sessionToken,
			api.CACHE_FLAG.useIfExists,
		);
		$session.tplIdsForSearch_for_wf = tmp.map((x) => x.tplid);
		await searchNow();
	};

	async function load(_page, reason = 'refresh', cacheFlag = api.CACHE_FLAG.bypass) {
		loading = true;
		let payload = {
			pattern: $filterStorage[BIZ].pattern,
			skip: _page * $filterStorage.pageSize,
			limit: $filterStorage.pageSize,
			sortby: $filterStorage[BIZ].sortby,
			status: $filterStorage[BIZ].status,
			tspan: $filterStorage[BIZ].tspan,
			starter: $filterStorage[BIZ].starter,
			reason: reason,
		};
		if ($filterStorage[BIZ].tplTag)
			payload['tagsForFilter'] = $filterStorage[BIZ].tplTag.split(';');
		if ($filterStorage[BIZ].tplid.trim()) payload['tplid'] = $filterStorage[BIZ].tplid.trim();
		if ($filterStorage[BIZ].calendar_begin && $filterStorage[BIZ].calendar_end) {
			payload['calendar_begin'] = $filterStorage[BIZ].calendar_begin;
			payload['calendar_end'] = $filterStorage[BIZ].calendar_end;
		}

		let { skip: _skip, ...payloadWithoutSkip } = payload;
		let { skip: __skip, limit: __limit, sortby: __sortBy, ...payloadForMining } = payload;
		if (false === Utils.objectEqual(payloadWithoutSkip, $lastQuery[BIZ])) {
			payload.skip = 0;
			$srPage[BIZ] = 0;
		}
		$lastQuery[BIZ] = payloadWithoutSkip;
		$lastMining = payloadForMining;

		const searchOnServer = async () => {
			const ret = await api.post(ENDPOINT_SEARCH, payload, user.sessionToken, cacheFlag);
			if (ret.error) {
				if (ret.error === 'KICKOUT') {
					setFadeMessage($_('session.forcetohome'));
					goto('/');
				} else {
					setFadeMessage(ret.message, 'warning');
				}
			} else {
				rows = ret.objs;
				rowsCount = ret.total;
			}
		};

		const getIndividualProcessData = async () => {
			const tasks = [];
			const batch = MINING_BATCH_NUMBER;
			//把流程每「batch」作为一批，去服务器请求其details信息
			for (let b = 0; b < miningData.length / batch + 1 && b * batch < miningData.length; b++) {
				const batchWfIds = [];
				//组织需要取其detail的工作流wfid数组，用于向服务器传递
				for (let a = 0; a < batch; a++) {
					const idx = b * batch + a;
					if (idx >= miningData.length) break;
					batchWfIds.push(miningData[idx].wfid);
				}
				tasks.push(function (callback) {
					setTimeout(async function () {
						console.log('workflow/detail', batchWfIds);
						const details = await api.post(
							'mining/workflow/details',
							{ wfids: batchWfIds },
							user.sessionToken,
						);
						if (details.error) {
							console.error(details.message);
						} else {
							for (let m = 0; m < details.length; m++) {
								miningData[b * batch + m].mdata = details[m];
							}
							miningData = miningData;
							/*
							for (let m = 0; m < details.length; m++) {
								for (let k = 0; k < miningData.length; k++) {
									if (miningData[k].wfid == details[m].wfid) {
										miningData[k].mdata = details[m];
										console.log('Set mdata ', details[m], ' for', miningData[k].wfid);
										break;
									}
								}
							}
							 */
						}
						callback(null, b);
					}, MINING_BATCH_INTERVAL);
				});
			}
			console.log('Tasks number', tasks.length);
			series(tasks, function (err, results) {
				if (err) {
					console.log(err);
				} else {
					console.log(results);
				}
			});
		};

		const miningOnServer = async () => {
			const ret = await api.post(
				ENDPOINT_MINING,
				payloadForMining as unknown as Record<string, unknown>,
				user.sessionToken,
				cacheFlag,
			);
			miningData = ret;
			await getIndividualProcessData();
		};

		if ($miningMode === false) {
			loadTimer && clearTimeout(loadTimer);
			if (
				cacheFlag === api.CACHE_FLAG.useIfExists &&
				api.hasCache(ENDPOINT_SEARCH, payload, user.sessionToken)
			)
				//Direct fetch from server without wait.
				await searchOnServer();
			else {
				//Wait certain ms to fetch from server
				loadTimer = setTimeout(async () => {
					await searchOnServer();
					loadTimer = null;
				}, LOADING_TIMEOUT);
			}
		} else {
			await miningOnServer();
		}
		loading = false;
	}

	function onPageChange(event) {
		load(event.detail.page, 'refresh', api.CACHE_FLAG.useIfExists);
		$srPage[BIZ] = event.detail.page;
	}

	const calendar_changed = function () {
		if (
			Parser.hasValue($filterStorage[BIZ].calendar_begin) &&
			Parser.isEmpty($filterStorage[BIZ].calendar_end)
		) {
			$filterStorage[BIZ].calendar_end = $filterStorage[BIZ].calendar_begin;
		}
		/*
		if (
			Parser.hasValue($filterStorage[BIZ].calendar_begin) &&
			Parser.hasValue($filterStorage[BIZ].calendar_end)
		) {
			searchNow().then();
		}
			 */
	};

	async function searchNow(preDelete = false) {
		if (Utils.isBlank($filterStorage[BIZ].tplTag)) {
			$filterStorage[BIZ].tplTag = '';
		}
		if (Utils.isBlank($filterStorage[BIZ].doer)) {
			$filterStorage[BIZ].doer = user.email;
		}
		if (Utils.isBlank($filterStorage[BIZ].status)) {
			$filterStorage[BIZ].status = 'ST_RUN';
		}
		if (Utils.isBlank($filterStorage[BIZ].pattern)) {
			$filterStorage[BIZ].pattern = '';
		}
		if (Utils.isBlank($filterStorage[BIZ].calendar_begin)) $filterStorage[BIZ].calendar_begin = '';
		if (Utils.isBlank($filterStorage[BIZ].calendar_end)) $filterStorage[BIZ].calendar_end = '';
		if (!$filterStorage.pageSize) $filterStorage.pageSize = 10;
		load(
			$srPage[BIZ],
			'refresh',
			preDelete ? api.CACHE_FLAG.preDelete : api.CACHE_FLAG.useIfExists,
		).then((res) => {});
	}

	export function resetQuery(preDelete = false) {
		$filterStorage[BIZ].tplTag = '';
		$filterStorage[BIZ].status = 'ST_RUN';
		$filterStorage[BIZ].tplid = '';
		$filterStorage[BIZ].starter = '';
		$filterStorage[BIZ].doer = user.email;
		$filterStorage[BIZ].pattern = '';
		$filterStorage[BIZ].tspan = 'any';
		$filterStorage[BIZ].calendar_begin = '';
		$filterStorage[BIZ].calendar_end = '';
		show_calendar_select = false;
		aSsPicked = '';
		$srPage[BIZ] = 0;
		if (preDelete) {
			api.removeCacheByPath('workflow/search');
		}
		searchNow(preDelete).then();
	}

	const toggleMining = async () => {
		$miningMode = !$miningMode;
	};

	const toggleAdvancedSearch = async () => {
		$showAdvancedSearch[BIZ] = !$showAdvancedSearch[BIZ];
		if ($showAdvancedSearch[BIZ] == false) {
			resetQuery();
		} else {
			if (!$session.tplIdsForSearch_for_wf || $session.tplIdsForSearch_for_wf.length === 0) {
				let tmp = await api.post(
					'template/tplid/list',
					{ tags: $filterStorage[BIZ].tplTag },
					user.sessionToken,
				);
				$session.tplIdsForSearch_for_wf = tmp.map((x) => x.tplid);
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
		$filterStorage[BIZ].sortby =
			(event.detail.dir === 'desc' ? '-' : '') +
			(event.detail.key === 'name' ? 'wftitle' : event.detail.key);
		await load($srPage[BIZ], 'refresh', api.CACHE_FLAG.useIfExists);
	}

	const opWorkflow = async function (workflow: Workflow, op: string): Promise<void> {
		if (op === 'startAnother') {
			goto(`/template/start?tplid=${workflow.tplid}`);
			return;
		} else if (op === 'works') {
			$filterStorage.todo.tplid = workflow.tplid;
			$filterStorage.todo.workTitlePattern = 'wf:' + workflow.wfid;
			goto('/work');
			return;
		} else if (op === 'works_running') {
			$filterStorage.todo.tplid = workflow.tplid;
			$filterStorage.todo.workTitlePattern = 'wf:' + workflow.wfid;
			$filterStorage.todo.workStatus = 'ST_RUN';
			goto('/work');
			return;
		} else if (op === 'works_all') {
			$filterStorage.todo.tplid = workflow.tplid;
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
		api.removeCacheByPath('workflow/search');
		api.removeCacheByPath('work/search');
		$worklistChangeFlag++;
		if (op === 'pause' || op === 'resume' || op === 'stop') {
			for (let i = 0; i < rows.length; i++) {
				if (rows[i].wfid === workflow.wfid) {
					rows[i].status = ret.status;
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
			await searchNow();
		}
		$filterStorage.todo.workTitlePattern = 'wf:' + ret.wfid;
	};

	let isMobile = false;
	onMount(async () => {
		if ($filterStorage[BIZ].pattern && $filterStorage[BIZ].pattern.startsWith('wf:')) {
			$filterStorage[BIZ].pattern = '';
		}
		isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		if ($showAdvancedSearch[BIZ] === undefined) {
			//console.log('First time loading...');
			LOADING_TIMEOUT = 0;
			$showAdvancedSearch[BIZ] = false;
			resetQuery();
		} else {
			LOADING_TIMEOUT = 400;
			//console.log('Not First time loading...');
			if ($showAdvancedSearch[BIZ] === false) {
				//console.log('showAdvancedSearch === false...');
				resetQuery();
			} else {
				//console.log('showAdvancedSearch === true...');
				if ($miningMode === false) await searchNow();
			}
		}
	});
	const toggleDiscuss = async (row) => {
		return await api.post(
			'comment/toggle',
			{ objtype: 'workflow', objid: row.wfid },
			user.sessionToken,
		);
	};
</script>

<Container class="p-2 border border-1 rounded">
	<div class="d-flex">
		<div class="flex-shrink-0 fs-3">
			{#if $miningMode}
				{$_('title.mining')}
			{:else}
				{$_('title.workflow')}
			{/if}
		</div>
		<div class="ms-5 align-self-start flex-grow-1">&nbsp;</div>
		<div class="justify-content-end">
			<div
				class="btn btn-outline-primary border-0 m-0 p-1"
				color="primary"
				on:click|preventDefault={toggleMining}>
				{#if $miningMode}
					<i class="bi bi-graph-up-arrow" />
					{$_('button.current_is_mining')}
				{:else}
					<i class="bi bi-search" />
					{$_('button.current_is_searching')}
				{/if}
			</div>
			<div
				class="btn btn-primary m-0 p-1"
				color="primary"
				on:click|preventDefault={toggleAdvancedSearch}>
				{#if $showAdvancedSearch[BIZ]}
					<i class="bi bi-x-circle" />
				{:else}
					<i class="bi bi-search" />
				{/if}
				{$_('button.toggleAdvancedSearch')}
			</div>
			<div
				class="btn btn-primary m-0 p-1 btn-lg"
				color="primary"
				on:click|preventDefault={(e) => {
					resetQuery(true);
				}}>
				{$_('button.resetQuery')}
			</div>
		</div>
	</div>
	<TagPicker {BIZ} {useThisTag} {clearTag} />
	{#if $showAdvancedSearch[BIZ]}
		<Row class="mb-3 d-flex justify-content-end">
			{#each statuses as status, index (status)}
				<Col xs="auto">
					<label>
						<input
							type="radio"
							bind:group={$filterStorage[BIZ].status}
							value={status.value}
							on:change={async () => {
								//await searchNow();
							}} />
						{status.label}
					</label>
				</Col>
			{/each}
		</Row>
		<Row cols={{ xs: 1, md: 2 }}>
			<Col>
				<InputGroup>
					<InputGroupText>{$_('extrafilter.template')}</InputGroupText>
					<select
						class="form-select"
						name="selectTpl"
						id="tplSelect"
						bind:value={$filterStorage[BIZ].tplid}
						on:change|preventDefault={async (e) => {
							e.preventDefault();
							//await searchNow();
						}}>
						<option value="">
							{$_('extrafilter.allTemplate')}
						</option>
						{#if $session.tplIdsForSearch_for_wf}
							{#each $session.tplIdsForSearch_for_wf as tpl, index (tpl)}
								<option value={tpl}>
									{tpl}
								</option>
							{/each}
						{/if}
					</select>
				</InputGroup>
			</Col>
			<Col>
				<InputGroup class="kfk-input-template-name d-flex">
					<InputGroupText>{$_('extrafilter.starter')}</InputGroupText>
					<Input
						class="flex-fill"
						name="other_doer"
						bind:value={$filterStorage[BIZ].starter}
						aria-label="User Email"
						placeholder="email" />
					<!--div
						class="btn btn-primary"
						on:click|preventDefault={(e) => {
							searchNow().then();
						}}
						color="primary">
						<i class="bi bi-arrow-return-left" />
					</div -->
					<div
						class="btn btn-secondary"
						on:click|preventDefault={() => {
							$filterStorage[BIZ].starter = user.email;
							//searchNow();
						}}
						color="secondary">
						{$_('extrafilter.me')}
					</div>
					<div
						class="btn btn-secondary  m-0 py-1 px-3"
						on:click|preventDefault={async () => {
							$filterStorage[BIZ].starter = '';
							//await searchNow();
						}}
						color="light">
						{$_('remotetable.any')}
					</div>
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
							bind:value={$filterStorage[BIZ].pattern} />
						<!--div
							class="btn btn-primary"
							on:click|preventDefault={(e) => {
								searchNow().then();
							}}>
							<i class="bi bi-arrow-return-left" />
						</div-->
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
						bind:value={$filterStorage[BIZ].tspan}
						on:change={async (e) => {
							e.preventDefault();
							//await load($srPage[BIZ], 'refresh', api.CACHE_FLAG.useIfExists);
						}}>
						{#each Object.keys(tspans) as key}
							<option value={key}>{tspans[key]}</option>
						{/each}
					</select>
					<div
						class="btn btn-primary"
						on:click|preventDefault={async () => {
							if (show_calendar_select) {
								$filterStorage[BIZ].calendar_begin = '';
								$filterStorage[BIZ].calendar_end = '';
								show_calendar_select = false;
								//await searchNow();
							} else {
								show_calendar_select = true;
							}
						}}>
						{$_('remotetable.start_end')}
					</div>
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
							bind:value={$filterStorage[BIZ].calendar_begin}
							on:change={calendar_changed} />
					</InputGroup>
				</Col>
				<Col>
					<InputGroup>
						<InputGroupText>End:</InputGroupText>
						<Input
							type="date"
							bind:value={$filterStorage[BIZ].calendar_end}
							on:change={calendar_changed} />
						<div class="btn btn-primary" on:click|preventDefault={calendar_changed} color="primary">
							<i class="bi bi-arrow-return-left" />
						</div>
					</InputGroup>
				</Col>
			</Row>
		{/if}
		<Row class="mt-1">
			<Col>
				<Searchlet
					objtype="wf"
					bind:aSsPicked
					on:searchlet={(msg) => {
						let ss = JSON.parse(msg.detail.ss);
						ss.pattern && ($filterStorage[BIZ].pattern = ss.pattern);
						ss.status && ($filterStorage[BIZ].status = ss.status);
						ss.tspan && ($filterStorage[BIZ].tspan = ss.tspan);
						ss.starter && ($filterStorage[BIZ].starter = ss.starter);
						if (ss.tplid) $filterStorage[BIZ].tplid = ss.tplid;
						else $filterStorage[BIZ].tplid = '';
						ss.calendar_begin && ($filterStorage[BIZ].calendar_begin = ss.calendar_begin);
						ss.calendar_end && ($filterStorage[BIZ].calendar_end = ss.calendar_end);

						if (
							$filterStorage[BIZ].calendar_begin !== '' ||
							$filterStorage[BIZ].calendar_end !== ''
						) {
							show_calendar_select = true;
						} else {
							show_calendar_select = false;
						}
						//searchNow().then();
					}}
					on:resetSearchlet={(msg) => {
						aSsPicked = '';
						resetQuery(true);
					}} />
			</Col>
			<Col class="col-auto">
				<div
					class="btn btn-primary"
					on:click|preventDefault={() => {
						searchNow().then();
					}}>
					{$_('remotetable.executeNow')}
				</div>
			</Col>
		</Row>
	{/if}

	{#if $miningMode === false}
		{#key rowsCount}
			<div class="mt-3 ">
				<Pagination
					page={$srPage[BIZ]}
					pageSize={$filterStorage.pageSize}
					count={rowsCount}
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
						<Sort
							key="wftitle"
							on:sort={onSort}
							dir={$filterStorage[BIZ].sortby.indexOf('wftitle') < 0
								? 'asc'
								: $filterStorage[BIZ].sortby[0] === '-'
								? 'desc'
								: 'asc'} />
					</Col>
					<Col>
						{$_('remotetable.status')}
						<Sort
							key="status"
							on:sort={onSort}
							dir={$filterStorage[BIZ].sortby.indexOf('status') < 0
								? 'asc'
								: $filterStorage[BIZ].sortby[0] === '-'
								? 'desc'
								: 'asc'} />
					</Col>
					<Col>
						{$_('remotetable.starter')}
						<Sort
							key="starter"
							on:sort={onSort}
							dir={$filterStorage[BIZ].sortby.indexOf('starter') < 0
								? 'asc'
								: $filterStorage[BIZ].sortby[0] === '-'
								? 'desc'
								: 'asc'} />
					</Col>
					<Col>
						{$_('remotetable.updatedAt')}
						<Sort
							key="updatedAt"
							on:sort={onSort}
							dir={$filterStorage[BIZ].sortby.indexOf('updatedAt') < 0
								? 'asc'
								: $filterStorage[BIZ].sortby[0] === '-'
								? 'desc'
								: 'asc'} />
					</Col>
				</Row>
			</div>
			<div class="flex-shrink-1">
				<PageSize
					on:pagesize={async (e) => {
						await load(0, 'refresh', api.CACHE_FLAG.useIfExists);
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
															$mtcConfirm = {
																title: $_('confirm.title.areyousure'),
																body: $_('confirm.body.deleteWorkflow'),
																buttons: [$_('confirm.button.confirm')],
																callbacks: [
																	async () => {
																		opWorkflow(row, 'destroy');
																		mtcConfirmReset();
																	},
																],
															};
														}}>
														<Icon name="trash" />
														{$_('remotetable.wfa.deleteThisWorkflow')}
													</NavLink>
												</DropdownItem>
												<DropdownItem>
													<NavLink
														on:click={(e) => {
															e.preventDefault();
															$mtcConfirm = {
																title: $_('confirm.title.areyousure'),
																body: $_('confirm.body.deleteWorkflow'),
																buttons: [$_('confirm.button.confirm')],
																callbacks: [
																	async () => {
																		opWorkflow(row, 'restartthendestroy');
																		mtcConfirmReset();
																	},
																],
															};
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
										{$_('remotetable.status')}:
										{$_(`status.${row.status}`)}
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
									<div
										class="btn btn-primary btn-sm"
										color="primary"
										on:click|preventDefault={async (e) => {
											e.preventDefault();
											await api.post(
												'workflow/set/title',
												{ wfid: row.wfid, wftitle: row.wftitle },
												user.sessionToken,
											);
											settingFor = '';
										}}>
										Set
									</div>
									<div
										class="btn btn-primary btn-sm"
										color="secondary"
										on:click|preventDefault={async (e) => {
											e.preventDefault();
											settingFor = '';
										}}>
										Cancel
									</div>
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
					page={$srPage[BIZ]}
					pageSize={$filterStorage.pageSize}
					count={rowsCount}
					{isMobile}
					on:pageChange={onPageChange} />
			</div>
		{/key}
	{:else}
		<Miner bind:wfs={miningData} />
	{/if}
</Container>
