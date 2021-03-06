<svelte:options accessors />

<script lang="ts">
	//Row component is optional and only serves to render odd/even row, you can use <tr> instead.
	//Sort component is optional
	import { _, date, time } from '$lib/i18n';
	import TimeTool from '$lib/TimeTool';
	import { setFadeMessage } from '$lib/Notifier';
	import * as api from '$lib/api';
	import Cover from '$lib/display/Cover.svelte';
	import CronBuilder from '$lib/CronBuilder.svelte';
	import { API_SERVER } from '$lib/Env';
	import { TagStorage } from '$lib/empstores';
	import { enhance } from '$lib/form';
	import TagPicker from '$lib/TagPicker.svelte';
	import { session } from '$app/stores';
	import {
		showAdvancedSearch,
		srPage,
		miningMode,
		lastQuery,
		mtcConfirm,
		mtcConfirmReset,
		worklistChangeFlag,
	} from '$lib/Stores';
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
	import Pagination from '$lib/pagination/Pagination.svelte';
	import Search from '$lib/pagination/Search.svelte';
	import Sort from '$lib/pagination/Sort.svelte';
	import * as Utils from '$lib/utils';
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
		Card,
		CardBody,
		CardHeader,
		Col,
		InputGroup,
		InputGroupText,
		Input,
		Badge,
	} from 'sveltestrap';
	import { createEventDispatcher, getContext, setContext } from 'svelte';

	const ENDPOINT = 'template/search';
	const BIZ = 'tpl';
	let fileSaver = null;
	let loadTimer = null;
	let LOADING_TIMEOUT = 400;
	if (!$filterStorage[BIZ]) {
		$filterStorage[BIZ] = { tplTag: '', sortby: '-updatedAt' };
	}
	if ($filterStorage[BIZ].hasOwnProperty('sortby') === false) {
		$filterStorage[BIZ].sortby = '-updatedAt';
	}

	let multiple_selecting = false;
	let rows = [];
	let user = $session.user;
	let rowsCount = 0;
	let page = 0; //first page
	let show_calendar_select = false;
	let recentTemplates = [];
	let SetFor = {
		setVisiFor: '',
		setAuthorFor: '',
		setDescFor: '',
		setTagFor: '',
		setWeComBotFor: '',
		settingFor: '',
	};
	let files;
	let tplidImport;
	let showform = '';

	let loading = true;
	let newTplName = '';
	let newTplTags = '';
	let editlogfor = '';
	let editlogs: any = [];
	let editCronFor = '';
	let cronStarters = '';
	let cronexpr = '0 8 * * *';
	let crons = [];
	let thePdsResolver;
	let searchTimer = null;
	export let menu_has_form = false;
	export let form_status = {
		create: false,
		search: false,
		sort: false,
		import: false,
		flexible: false,
	};
	let urls = {
		create: `${API_SERVER}/template/create`,
	};
	$: filteredRows = rows;

	if (!$session.tplIds) {
		$session.tplIds = [];
	}

	function hide_all_form() {
		Object.keys(form_status).forEach((key) => {
			form_status[key] = false;
		});
		menu_has_form = false;
	}

	function show_form(form_name: string) {
		hide_all_form();
		form_status[form_name] = true;
		menu_has_form = true;
	}

	function importTemplate(e) {
		e.preventDefault();
		if (ClientPermControl(user.perms, user.email, 'template', '', 'create') === false) {
			setFadeMessage("You don't have upload permission");
			return;
		}
		const formData = new FormData();
		formData.append('tplid', tplidImport);
		formData.append('file', files[0]);
		const upload = fetch(`${API_SERVER}/template/import`, {
			method: 'POST',
			headers: {
				Authorization: user.sessionToken,
			},
			body: formData,
		})
			.then((response) => response.json())
			.then(async (result) => {
				//templates = [result, ...templates];
				rows = [result, ...rows];
				api.removeCacheByPath('template/search');
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}

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

	async function searchNow(preDelete = false) {
		if (Utils.isBlank($filterStorage[BIZ].tplTag)) {
			$filterStorage[BIZ].tplTag = '';
		}
		if (Parser.isEmpty($filterStorage[BIZ].author)) {
			//$filterStorage[BIZ].author = user.email;
		} else {
			if ($filterStorage[BIZ].author[0] === '@') {
				$filterStorage[BIZ].author = $filterStorage[BIZ].author.substring(1);
			}
			if ($filterStorage[BIZ].author.indexOf('@') < 0) {
				$filterStorage[BIZ].author += user.email.substring(user.email.indexOf('@'));
			}
		}
		if (Utils.isBlank($filterStorage[BIZ].pattern)) {
			$filterStorage[BIZ].pattern = '';
		}
		if (!$filterStorage.pageSize) $filterStorage.pageSize = 10;
		load(
			$srPage[BIZ],
			'refresh',
			preDelete ? api.CACHE_FLAG.preDelete : api.CACHE_FLAG.useIfExists,
		).then((res) => {});
	}

	async function load(_page, reason = 'refresh', cacheFlag = api.CACHE_FLAG.bypass) {
		loading = true;
		let payload = {
			pattern: $filterStorage[BIZ].pattern,
			skip: _page * $filterStorage.pageSize,
			limit: $filterStorage.pageSize,
			sortby: $filterStorage[BIZ].sortby,
			tagsForFilter: $filterStorage[BIZ].tplTag.split(';'),
			author: $filterStorage[BIZ].author,
			reason: reason,
		};
		let { skip: _skip, ...payloadWithoutSkip } = payload;
		if (false === Utils.objectEqual(payloadWithoutSkip, $lastQuery[BIZ])) {
			payload.skip = 0;
			$srPage[BIZ] = 0;
		}
		$lastQuery[BIZ] = payloadWithoutSkip;

		const loadPost = async () => {
			const ret = await api.post(ENDPOINT, payload, user.sessionToken, cacheFlag);
			if (ret.error) {
				setFadeMessage(ret.message, 'warning');
			} else {
				rows = ret.objs;
				rowsCount = ret.total;
			}
		};
		loadTimer && clearTimeout(loadTimer);
		if (
			cacheFlag === api.CACHE_FLAG.useIfExists &&
			api.hasCache(ENDPOINT, payload, user.sessionToken)
		)
			//Direct return cache without wait.
			await loadPost();
		else {
			//Wait certain ms to fetch from server
			loadTimer = setTimeout(async () => {
				await loadPost();
				loadTimer = null;
			}, LOADING_TIMEOUT);
		}
		loading = false;
	}

	export const unshiftRows = function (obj) {
		rows = [obj, ...rows];
		rowsCount = rowsCount + 1;
	};

	function onPageChange(event) {
		load(event.detail.page, 'refresh', api.CACHE_FLAG.useIfExists);
		$srPage[BIZ] = event.detail.page;
	}

	async function onSort(event) {
		$filterStorage[BIZ].sortby =
			(event.detail.dir === 'desc' ? '-' : '') +
			(event.detail.key === 'name' ? 'tplid' : event.detail.key);
		await load($srPage[BIZ], 'refresh', api.CACHE_FLAG.useIfExists);
	}

	const clearTag = async function (preDelete = false) {
		$filterStorage[BIZ].tplTag = '';
		await searchNow(preDelete);
	};

	const useThisTag = function (tag, appendMode = false) {
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
		searchNow();
	};

	let desc_input = '';
	let visi_rds_input = '';

	async function __deleteTemplate(tplid) {
		let res = await api.post('template/delete/byname', { tplid: tplid }, user.sessionToken);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
		} else {
			api.removeCacheByPath('template/search');
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

	async function __deleteTemplateMultiple() {
		let tplids = rows.filter((x) => x.checked).map((x) => x.tplid);
		if (tplids.length < 1) return;
		$mtcConfirm = {
			title: $_('confirm.delete.template-multi.title', { values: { count: tplids.length } }),
			body: $_('confirm.delete.template-multi.body', { values: { count: tplids.length } }),
			buttons: [$_('confirm.delete.template-multi.yes')],
			callbacks: [
				async () => {
					mtcConfirmReset();
					let res = await api.post('template/delete/multi', { tplids: tplids }, user.sessionToken);
					if (res.error) {
						setFadeMessage(res.message, 'warning');
					} else {
						api.removeCacheByPath('template/search');
						let tmp = [];
						for (let r = 0; r < rows.length; r++) {
							if (tplids.includes(rows[r].tplid) === false) tmp.push(rows[r]);
						}
						rowsCount = tmp.length;
						rows = tmp;
					}
				},
			],
		};
	}

	let allTags: any = {
		org: [],
		mine: [],
	};

	async function reloadTags() {
		allTags.org = await api.post('tag/org', {}, user.sessionToken);
		allTags.mine = await api.post('tag/list', { objtype: 'template' }, user.sessionToken);
		$TagStorage = allTags;
	}

	function deleteRow(tplid) {
		$mtcConfirm = {
			title: $_('confirm.delete.template.title'),
			body: $_('confirm.delete.template.body'),
			buttons: [$_('confirm.delete.template.yes')],
			callbacks: [
				async () => {
					await __deleteTemplate(tplid);
					mtcConfirmReset();
				},
			],
		};
	}

	async function exportData(tplid) {
		//let res = await post('/template/data', { tplid: tplid }, user.sessionToken);
	}

	let isMobile = false;
	onMount(async () => {
		isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		if (localStorage) {
			recentTemplates = JSON.parse(localStorage.getItem('recentTemplates') ?? JSON.stringify([]));
		}
		if ($showAdvancedSearch[BIZ] === undefined) {
			LOADING_TIMEOUT = 0;
			$showAdvancedSearch[BIZ] = false;
			resetQuery();
		} else {
			LOADING_TIMEOUT = 400;
			if ($showAdvancedSearch[BIZ] === false) {
				resetQuery();
			} else {
				await searchNow();
			}
		}

		if (!$session.tplIds) {
			$session.tplIds = [];
		}
		if ($session.tplIds.length < 1) {
			let tmp = await api.post('template/tplid/list', {}, user.sessionToken);
			$session.tplIds = tmp.map((x) => x.tplid);
		}
	});
	const stateContext = getContext('state');

	const showCronTable = async function (e, tplid) {
		e.preventDefault();
		editCronFor = tplid;
		crons = (await api.post(
			'template/crons',
			{ tplid: tplid },
			user.sessionToken,
		)) as unknown as any[];
		console.log(crons);
	};

	const addCron = async function (e, tplid) {
		let ret = (await api.post(
			'template/addcron',
			{ tplid: tplid, expr: cronexpr, starters: cronStarters },
			user.sessionToken,
		)) as unknown as any;
		if (ret.error) {
			setFadeMessage(ret.message);
		} else crons = ret;
		e.preventDefault();
	};

	const startNow = async function (e, tplid) {
		e.preventDefault();
		await api.post(
			'template/batch/start',
			{ tplid: tplid, starters: cronStarters },
			user.sessionToken,
		);
		api.removeCacheByPath('workflow/search');
		api.removeCacheByPath('work/search');
		$worklistChangeFlag++;
	};

	const deleteCrontab = async function (e, tplid, cronId) {
		crons = (await api.post(
			'template/delcron',
			{ id: cronId, tplid: tplid },
			user.sessionToken,
		)) as unknown as any[];
		e.preventDefault();
		console.log(crons);
	};

	function resetQuery(preDelete = false) {
		$filterStorage[BIZ].tplTag = '';
		$filterStorage[BIZ].author = '';
		$filterStorage[BIZ].pattern = '';
		$srPage[BIZ] = 0;
		if (preDelete) {
			api.removeCacheByPath('template/search');
		}
		searchNow(preDelete).then();
	}

	const toggleAdvancedSearch = async () => {
		$showAdvancedSearch[BIZ] = !$showAdvancedSearch[BIZ];
		if ($showAdvancedSearch[BIZ] == false) {
			resetQuery();
		}
	};
</script>

{#if showform === 'create'}
	{#if user.perms && ClientPermControl(user.perms, user.email, 'template', '', 'create')}
		<form>
			<Container class="my-3" style="max-width:400px;">
				<Row cols="1" class="mb-5">
					<Col>
						<div class="form-floating flex-fill">
							<input
								name="tplid"
								bind:value={newTplName}
								class="form-control"
								id="input-tplid"
								aria-label="Create template"
								placeholder="New template name" />
							<label for="input-tplid">
								{$_('template.create.name')}
							</label>
						</div>
					</Col>
					<Col class="mt-2">
						<div class="form-floating flex-fill">
							<input
								name="tags"
								bind:value={newTplTags}
								id="input-tags"
								class="w-100 form-control"
								aria-label="template tags"
								placeholder="tags delimiter with space/;/," />
							<label for="input-tags">
								{$_('template.create.tags')}
							</label>
						</div>
					</Col>
					<Col class="my-3">
						<Row>
							<Col class="col-8">
								<div
									class="btn btn-primary h-100 w-100"
									on:click|preventDefault={async (e) => {
										if (ClientPermControl(user.perms, user.email, 'template', '', 'create')) {
											let res = await api.post(
												'template/create',
												{ tplid: newTplName, tags: newTplTags },
												user.sessionToken,
											);
											if (res.error) {
												setFadeMessage(res.message, 'warning');
											} else {
												rows = [res, ...rows];
												rowsCount++;
												newTplName = '';
												newTplTags = '';
												$filterStorage[BIZ].author = '';
												$filterStorage[BIZ].pattern = '';
												api.removeCacheByPath('template/search');
												setFadeMessage(
													$_('notify.create_template_success', {
														values: { tplid: res.tplid },
													}),
												);
											}
										} else {
											setFadeMessage("You don't have permision", 'warning');
										}
									}}>
									{$_('button.create')}
								</div>
							</Col>
							<Col class="col-4">
								<div
									class="btn btn-primary h-100 w-100"
									on:click|preventDefault={(e) => {
										e.stopPropagation();
										showform = '';
									}}>
									{$_('button.cancel')}
								</div>
							</Col>
						</Row>
					</Col>
				</Row>
			</Container>
		</form>
	{:else}
		No Create Tempalte Permission
	{/if}
{:else if showform === 'import'}
	{#if user.perms && ClientPermControl(user.perms, user.email, 'template', '', 'create')}
		<form class="new" enctype="multipart/form-data">
			<Container class="mt-3">
				<div class="card p-3">
					<div class="card-header">{$_('template.import.from_local_disk')}</div>
					<div class="card-body">
						<Row cols="1" class="mb-5">
							<Col>
								<div class="form-floating flex-fill">
									<input
										name="tplid"
										id="input-tplid"
										placeholder="New template name"
										class="form-control"
										bind:value={tplidImport} />
									<label for="input-tplid">
										{$_('template.import.name')}
									</label>
								</div>
							</Col>
							<Col class="mt-2">
								<div class="form-floating flex-fill">
									<input
										name="file"
										id="import_template_file_select_button"
										type="file"
										bind:files />
								</div>
							</Col>
							<Col class="mt-3">
								<Row>
									<Col class="col-8">
										<div
											class="btn btn-primary h-100 w-100"
											on:click|preventDefault={importTemplate}
											color="primary">
											{$_('button.import')}
										</div>
									</Col>
									<Col class="col-4">
										<div
											class="btn btn-secondary h-100 w-100"
											color="secondary"
											on:click|preventDefault={(e) => {
												showform = '';
											}}>
											{$_('button.cancel')}
										</div>
									</Col>
								</Row>
							</Col>
						</Row>
						<Row>
							<div class="text-center">
								<a
									href={'#'}
									class="btn border-0 m-0 p-0 text-primary"
									on:click={() => {
										goto('/kshares');
									}}>
									{$_('template.import.from_process_hub')}
								</a>
							</div>
						</Row>
					</div>
				</div>
			</Container>
		</form>
	{:else}
		No Create Tempalte Permission
	{/if}
{/if}
<Container class="p-2 border border-1 rounded">
	<div class="d-flex">
		<div class="flex-shrink-0 fs-3">
			{$_('title.template')}
		</div>
		<div class="ms-5 align-self-start flex-grow-1">&nbsp;</div>
		<div class="justify-content-end">
			<div
				class="btn btn-primary m-0 py-1 px-3"
				on:click|preventDefault={async () => {
					showform = 'create';
				}}>
				{$_('button.create')}
			</div>
			<div
				class="btn btn-primary m-0 py-1 px-3"
				on:click|preventDefault={async () => {
					showform = 'import';
				}}>
				{$_('button.import')}
			</div>
			<div class="btn btn-primary m-0 p-1" on:click|preventDefault={toggleAdvancedSearch}>
				{#if $showAdvancedSearch[BIZ]}
					<i class="bi bi-x-circle" />
				{:else}
					<i class="bi bi-search" />
				{/if}
				{$_('button.toggleAdvancedSearch')}
			</div>
			<div
				class="btn btn-primary m-0 p-1 btn-lg"
				on:click={(e) => {
					resetQuery(true);
				}}>
				{$_('button.resetQuery')}
			</div>
		</div>
	</div>
	<TagPicker {BIZ} {useThisTag} {clearTag} />
	{#if $showAdvancedSearch[BIZ]}
		<div>
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
							<div
								class="btn btn-primary"
								on:click|preventDefault={(e) => {
									searchNow().then();
								}}>
								<i class="bi bi-arrow-return-left" />
							</div>
						</InputGroup>
					</div>
				</Col>
				<Col>
					<InputGroup>
						<InputGroupText>
							{$_('remotetable.author')}
						</InputGroupText>
						<Input
							class="flex-fill"
							bind:value={$filterStorage[BIZ].author}
							placeholder="author email" />
						<div
							class="btn btn-primary"
							on:click|preventDefault={(e) => {
								searchNow().then();
							}}
							color="primary">
							List
						</div>
						<div
							class="btn btn-secondary m-0 py-1 px-3"
							on:click|preventDefault={async () => {
								$filterStorage[BIZ].author = user.email;
								await searchNow();
							}}
							color={'light'}>
							{$_('remotetable.me')}
						</div>
						<div
							class="btn btn-secondary  m-0 py-1 px-3"
							on:click|preventDefault={async () => {
								$filterStorage[BIZ].author = '';
								await searchNow();
							}}
							color="light">
							{$_('remotetable.any')}
						</div>
					</InputGroup>
				</Col>
			</Row>
		</div>
	{/if}
	<div class="mt-1 mx-0 w-100">
		{$_('recent')}
		{#each recentTemplates as aTplid}
			<div
				class="btn btn-primary mx-1 badge bg-info text-dark border-info fw-light"
				on:click|preventDefault={(e) => {
					e.preventDefault();
					goto(`template/start?tplid=${aTplid}`, { replaceState: false });
				}}>
				{aTplid}
			</div>
		{/each}
	</div>
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
	<div class="d-flex mb-2 px-2 w-100">
		<div class="w-100">
			<Row>
				<Col>{$_('remotetable.sortBy')}:</Col>
				<Col>
					{$_('remotetable.name')}
					<Sort
						key="tplid"
						on:sort={onSort}
						dir={$filterStorage[BIZ].sortby.indexOf('tplid') < 0
							? 'asc'
							: $filterStorage[BIZ].sortby[0] === '-'
							? 'desc'
							: 'asc'} />
				</Col>
				<Col>
					{$_('remotetable.author')}
					<Sort
						key="author"
						on:sort={onSort}
						dir={$filterStorage[BIZ].sortby.indexOf('author') < 0
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
		{#if user.group === 'ADMIN'}
			<div class="flex-shrink-1 text-nowrap">
				<div
					class="btn m-0 p-1"
					on:click|preventDefault={() => (multiple_selecting = !multiple_selecting)}>
					{#if multiple_selecting}
						{$_('remotetable.multi-select-cancel')}
					{:else}
						{$_('remotetable.multi-select')}
					{/if}
				</div>
			</div>
		{/if}
	</div>
	<!-- code><pre>
			{JSON.stringify(rows, null, 2)}
	</pre></code -->
	{#if multiple_selecting}
		<Row>
			<div
				class="btn col"
				on:click|preventDefault={(e) => {
					for (let r = 0; r < rows.length; r++) {
						rows[r].checked = true;
					}
				}}>
				{$_('remotetable.multi-select-all')}
			</div>
			<div
				class="btn col"
				on:click|preventDefault={(e) => {
					for (let r = 0; r < rows.length; r++) {
						rows[r].checked = false;
					}
				}}>
				{$_('remotetable.multi-select-none')}
			</div>
			{#if rows.filter((x) => x.checked).length > 0}
				<div
					class="btn col"
					on:click|preventDefault={(e) => {
						__deleteTemplateMultiple();
					}}>
					{$_('remotetable.multi-select-delete')}
				</div>
			{/if}
		</Row>
	{/if}
	<Row cols={$filterStorage.col_per_row}>
		{#each rows as row, index (row)}
			<Col class="mb-2 card p-2">
				<Row>
					<!-- 封面 -->
					{#if multiple_selecting}
						<Col class="col-auto">
							<input type="checkbox" bind:checked={row.checked} />
						</Col>
					{/if}
					<Col class="col-auto">
						{#if row.hasCover}
							<Cover tplid={row.tplid} style={'cover-90'} />
						{:else}
							<div class="kfk-cover-virtual text-center">
								{(() => {
									//如有中文，取出中文
									try {
										var reg = /[\u4e00-\u9fa5]/g;
										let m = row.tplid.match(reg);
										if (m) return m.join('');
										else return row.tplid;
									} catch (err) {
										return row.tplid;
									}
								})()}
							</div>
						{/if}
					</Col>
					<Col>
						<div class="row">
							<!-- 模版名称 以及 下拉菜单行  -->
							<div class="col">
								<h5 class="">
									<a class="kfk-workflow-id tnt-workflow-id" href={`/template/${row.tplid}&read`}>
										{row.tplid}
									</a>
									{#if row.cron > 0}
										<div
											class="btn btn-primary m-0 ms-3 px-2 py-0"
											on:click|preventDefault={(e) => {
												showCronTable(e, row.tplid);
											}}>
											crontab
										</div>
									{/if}
								</h5>
							</div>
							<div class="col-auto">
								<!-- 当个模版的下拉菜单 -->
								<Dropdown class="m-0 p-0">
									<DropdownToggle caret color="primary" class="btn-sm">
										{$_('remotetable.actions')}
									</DropdownToggle>
									<DropdownMenu class="bg-light">
										<DropdownItem>
											{$_('remotetable.tplaction.lastUpdate')}: {TimeTool.format(
												row.updatedAt,
												'YYYY-MM-DD HH:mm:ss',
											)}
										</DropdownItem>
										{#if user.perms && ClientPermControl(user.perms, user.email, 'workflow', '', 'create')}
											<DropdownItem>
												<a
													href={'#'}
													class="ms-3 fs-5 kfk-workflow-id tnt-workflow-id kfk-link px-2"
													on:click|preventDefault={() => {
														goto(`template/start?tplid=${row.tplid}`, { replaceState: false });
													}}>
													<Icon name="play-circle-fill" />
													{$_('remotetable.tplaction.startIt')}
												</a>
											</DropdownItem>
										{/if}
										<DropdownItem>
											<a
												href={'#'}
												on:click|preventDefault={async () => {
													$filterStorage.wf.tplid = row.tplid;
													goto('/workflow');
												}}
												class="nav-link ">
												<Icon name="bar-chart-steps" />
												{$_('remotetable.tplaction.seeWorkflows')}
											</a>
										</DropdownItem>
										<DropdownItem>
											<a
												href={'#'}
												on:click|preventDefault={async () => {
													$filterStorage.todo.tplid = row.tplid;
													goto('/work');
												}}
												class="nav-link ">
												<Icon name="list-task" />
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
													class="nav-link ">
													<Icon name="ui-checks-grid" />
													{$_('remotetable.tplaction.set')}
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
															user.sessionToken,
														);
														editlogfor = row.tplid;
														visi_rds_input = row.visi;
													}}
													class="nav-link ">
													<Icon name="person-plus-fill" />
													{$_('remotetable.tplaction.editors')}
												</a>
											</DropdownItem>
											<DropdownItem>
												<a
													href={'#'}
													on:click|preventDefault={(e) => {
														showCronTable(e, row.tplid);
													}}
													class="nav-link ">
													<Icon name="clock-fill" />
													{$_('remotetable.tplaction.scheduler')}
												</a>
											</DropdownItem>
											<DropdownItem>
												<a
													href={'#'}
													on:click|preventDefault={() => deleteRow(row.tplid)}
													class="nav-link ">
													<Icon name="trash" />
													{$_('remotetable.tplaction.deleteThisTempalte')}
												</a>
											</DropdownItem>
											<DropdownItem>
												<a
													href={'#'}
													on:click|preventDefault={() => {
														$filterStorage['wf'].tplid = row.tplid;
														$showAdvancedSearch['wf'] = true;
														$miningMode = true;
														goto('/workflow');
													}}
													class="nav-link ">
													<Icon name="graph-up-arrow" />
													{$_('remotetable.tplaction.analysis')}
												</a>
											</DropdownItem>
											<DropdownItem>
												<a
													href={'#'}
													on:click={async (e) => {
														e.preventDefault();
														api
															.postSimple(
																'mining/data',
																{ tplid: row.tplid, wfid: '' },
																user.sessionToken,
															)
															.then((res) => {
																return res.blob();
															})
															.then(async (data) => {
																if (fileSaver === null) {
																	fileSaver = await import('file-saver');
																}
																fileSaver.saveAs(data, `${row.tplid}_report.xlsx`);
															});
													}}
													class="nav-link">
													<Icon name="cloud-download" />
													{$_('remotetable.tplaction.exportdata')}
												</a>
											</DropdownItem>
										{/if}
									</DropdownMenu>
								</Dropdown>
							</div>
							<!-- END of 当个模版的下拉菜单 -->
						</div>
						<!-- 作者 以及 启动按钮  -->
						<div class="row">
							<div class="col-auto">
								{$_('remotetable.author')}:
								{row.authorName
									? row.authorName
									: row.author.indexOf('@') > -1
									? row.author.substring(0, row.author.indexOf('@'))
									: row.author}
							</div>
							<div class="col">
								{#if user.perms && ClientPermControl(user.perms, user.email, 'workflow', '', 'create')}
									<a
										href={'#'}
										class="ms-3 fs-5 kfk-workflow-id tnt-workflow-id kfk-link px-2"
										on:click|preventDefault={() => {
											goto(`template/start?tplid=${row.tplid}`, { replaceState: false });
										}}>
										<Icon name="play-circle-fill" />
										{$_('remotetable.startIt')}
									</a>
								{/if}
							</div>
						</div>
						{#if editlogfor === row.tplid}
							<!-- 编辑历史  -->
							<div class="row">
								<div class="col">
									<Container>
										<Row>
											<div
												class="btn btn-primary"
												color="primary"
												on:click|preventDefault={(e) => {
													e.preventDefault();
													editlogfor = '';
												}}>
												{$_('button.closeeditlog')}
											</div>
										</Row>
										{#each editlogs as elog}
											<Row>
												<Col>{TimeTool.format(elog.updatedAt, 'YYYY-MM-DD HH:mm:ss')}</Col><Col>
													{elog.editorName}
												</Col>
												<Col>{elog.editor}</Col>
											</Row>
										{/each}
									</Container>
								</div>
							</div>
						{/if}
						{#if editCronFor === row.tplid}
							<!-- Crontab editor -->
							<Card>
								<CardHeader>
									<!-- svelte-ignore missing-declaration -->
									<Row>
										<Col class="fs-5 fw-bold">{$_('template.addcron.title')}</Col>
										<Col class="col-auto">
											<div
												class="btn btn-primary m-1"
												color="primary"
												on:click={(e) => {
													e.preventDefault();
													editCronFor = '';
												}}>
												{$_('button.closecronsetting')}
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									<Card class="mt-1">
										<CardHeader class="fs-5 fw-bold mt-1">
											{$_('template.addcron.existing')}
										</CardHeader>
										<CardBody>
											{#each crons as cron}
												<Row>
													<Col>{cron.starters}</Col><Col>
														<a
															rel="external"
															href="https://crontab.guru/#{cron.expr.replace(/ /g, '_')}"
															target="_crontabgenerator">
															{cron.expr}
														</a>
													</Col>
													<Col>
														<div
															class="btn btn-primary btn-sm"
															on:click={async (e) => {
																await deleteCrontab(e, cron.tplid, cron._id);
															}}>
															Del
														</div>
													</Col>
												</Row>
											{/each}
										</CardBody>
									</Card>
									<Card class="mt-1">
										<CardHeader class="fs-5 fw-bold mt-1">
											{$_('template.addcron.addnew')}
										</CardHeader>
										<CardBody>
											{#if user.group === 'ADMIN'}
												<Row>
													<!-- 只有管理员可以指定其它用户，普通用户没有这个输入框，只能自己用 -->
													<PDSResolver
														bind:this={thePdsResolver}
														bind:value={cronStarters}
														readonly={false}
														placeholder={$_('template.addcron.cronStarters_placeholder')}
														label={$_('template.addcron.cronStarters')}
														btnText={$_('button.check')} />
												</Row>
											{/if}
											<Row>
												<CronBuilder bind:cronexpr />
											</Row>
											<Row>
												<div
													class="btn btn-primary"
													color="primary"
													on:click={(e) => {
														addCron(e, row.tplid);
													}}>
													{$_('button.addcron')}
												</div>
											</Row>
										</CardBody>
									</Card>
								</CardBody>
							</Card>
						{/if}
						<ItemEditor
							{rows}
							{row}
							{visi_rds_input}
							{user}
							{index}
							{setFadeMessage}
							{reloadTags}
							{SetFor}
							on:tplidSet={(e) => {
								row = e.detail;
								rows[index] = row;
							}}
							on:authorSet={(e) => {
								row = e.detail;
								rows[index] = row;
								SetFor.setAuthorFor = '';
							}} />
					</Col>
				</Row>
			</Col>
		{/each}
	</Row>
	{#key rowsCount}
		<Pagination
			page={$srPage[BIZ]}
			pageSize={$filterStorage.pageSize}
			count={rowsCount}
			{isMobile}
			on:pageChange={onPageChange} />
	{/key}
</Container>
