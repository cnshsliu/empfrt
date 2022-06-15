<script context="module" lang="ts">
	export async function load({ params, session }) {
		return {
			props: {
				adminMode: params.adminMode,
				shownNumber: params.shownNumber,
			},
		};
	}
</script>

<script lang="ts">
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { goto } from '$app/navigation';
	import { API_SERVER } from '$lib/Env';
	import { setFadeMessage } from '$lib/Notifier';
	import { page, session } from '$app/stores';
	import { kshareCate } from '$lib/empstores';
	import { text_area_resize } from '$lib/autoresize_textarea';
	import { title } from '$lib/title';
	import BadgeWithDel from '$lib/input/BadgeWithDel.svelte';
	import {
		Container,
		Row,
		Col,
		InputGroup,
		Input,
		InputGroupText,
		Button,
		TabContent,
		TabPane,
		Card,
		CardHeader,
		CardTitle,
		CardBody,
		Breadcrumb,
		BreadcrumbItem,
	} from 'sveltestrap';
	import { onMount } from 'svelte';

	let user = $session.user;
	let updatingKsTplPath = '';
	let pickingKsTplPath = '';
	let designPrepared = '';
	let files;
	let kstplmouseover = -1;

	type KSTpl = {
		ksid: string;
		name: string;
		desc: string;
		tags: [string];
		doc?: string;
		newtag?: string;
		pickto?: string;
	};
	type KShareCategory = {
		id: string;
		name: string;
		kstpls: [KSTpl];
		tags?: [string];
	};

	const all_scenarios_txt = $_('kshare.all_scenarios');
	const all_industries_txt = $_('kshare.all_industries');
	export let adminMode: boolean = false;
	export let shownNumber: number = 9999;

	const shuffle = !adminMode && shownNumber != 9999;

	let scenarios, industries;
	let scenario_categories: Array<KShareCategory> = [];
	let industry_categories: Array<KShareCategory> = [];
	let all_kshares: Array<KShareCategory> = [];
	let categories: Array<KShareCategory> = [];
	let ksharesInCategory: KShareCategory;
	let selectedMenuId = '';
	let selectedCategoryId = '';
	let show_category_customize_form = false;
	let allTagsString = { scenarios: '', industries: '' };
	const lastSelectedMenuCategory = { menu_all: 'all', menu_scenario: 'all', menu_industry: 'all' };
	let level_1_menus = [
		{ id: 'menu_all', name: 'All' },
		{ id: 'menu_scenario', name: 'Scenarios' },
		{ id: 'menu_industry', name: 'Industries' },
	];
	if (adminMode === false)
		level_1_menus = [
			{ id: 'menu_scenario', name: 'Scenarios' },
			{ id: 'menu_industry', name: 'Industries' },
		];

	const toggleMenu = (scenario_or_industry: string) => {
		selectedMenuId = scenario_or_industry;
		categories =
			scenario_or_industry === 'menu_scenario'
				? scenario_categories
				: scenario_or_industry === 'menu_industry'
				? industry_categories
				: all_kshares;
	};

	const toggleCategory = (categoryId: string) => {
		selectedCategoryId = categoryId;
		lastSelectedMenuCategory[selectedMenuId] = categoryId;
		for (let i = 0; i < categories.length; i++) {
			if (categories[i].id === categoryId) {
				ksharesInCategory = categories[i];
			}
		}
	};

	const categorize = async () => {
		scenario_categories.splice(0);
		industry_categories.splice(0);
		try {
			let scenario_cate_all = {
				id: `all`,
				name: $_('kshare.label.All'),
				kstpls: [] as unknown as [KSTpl],
			};
			all_kshares[0].kstpls.forEach((tpl) => {
				if (tpl.tags.includes(all_scenarios_txt)) {
					scenario_cate_all.kstpls.push(tpl);
				}
			});
			scenarios.forEach((scenario: string) => {
				let aCategory = { id: scenario, name: scenario, kstpls: [] as unknown as [KSTpl] };
				all_kshares[0].kstpls.forEach((tpl) => {
					if (tpl.tags.includes(scenario)) {
						scenario_cate_all.kstpls.filter((x) => x.ksid === tpl.ksid).length === 0 &&
							scenario_cate_all.kstpls.push(tpl);
						aCategory.kstpls.push(tpl);
					}
				});
				if (shuffle) aCategory.kstpls.sort(() => Math.random() - 0.5).splice(shownNumber);
				scenario_categories.push(aCategory);
			});
			if (shuffle) scenario_cate_all.kstpls.sort(() => Math.random() - 0.5).splice(shownNumber);
			scenario_categories.unshift(scenario_cate_all);

			let industry_cate_all = {
				id: `all`,
				name: $_('kshare.label.All'),
				kstpls: [] as unknown as [KSTpl],
			};
			all_kshares[0].kstpls.forEach((tpl) => {
				if (tpl.tags.includes(all_industries_txt)) {
					industry_cate_all.kstpls.push(tpl);
				}
			});
			industries.forEach((industry: string) => {
				let aCategory = { id: industry, name: industry, kstpls: [] as unknown as [KSTpl] };
				all_kshares[0].kstpls.forEach((tpl) => {
					if (tpl.tags.includes(industry)) {
						industry_cate_all.kstpls.filter((x) => x.ksid === tpl.ksid).length === 0 &&
							industry_cate_all.kstpls.push(tpl);
						aCategory.kstpls.push(tpl);
					}
				});
				if (shuffle) aCategory.kstpls.sort(() => Math.random() - 0.5).splice(shownNumber);
				industry_categories.push(aCategory);
			});
			if (shuffle) industry_cate_all.kstpls.sort(() => Math.random() - 0.5).splice(shownNumber);
			industry_categories.unshift(industry_cate_all);

			if (shuffle) all_kshares[0].kstpls.sort(() => Math.random() - 0.5).splice(shownNumber);
		} catch (err) {
			console.log(err);
		}
	};

	const saveKsConfig = async () => {
		if (adminMode === false) return;
		scenarios = allTagsString.scenarios.split(/[;|\s|,]/).filter((x) => x.trim().length > 0);
		industries = allTagsString.industries.split(/[;|\s|,]/).filter((x) => x.trim().length > 0);
		await api.post(
			'ksconfig/set',
			{
				ksconfig: {
					scenarios: scenarios,
					industries: industries,
				},
			},
			user.sessionToken,
		);
		await categorize();
	};

	const newkstpl = { folder: '', name: '', desc: '', tags: '' };

	const rebuild = async () => {
		const res = await api.post('ksconfig/get', {}, user?.sessionToken);
		scenarios = res.scenarios;
		industries = res.industries;
		allTagsString.scenarios = scenarios.join(';');
		allTagsString.industries = industries.join(';');
		await doSearch();
	};

	const doSearch = async (q: string = '') => {
		let kstpls = <[KSTpl]>await api.post('kstpls', { q: q }, user?.sessionToken);
		all_kshares = [{ id: 'all', name: $_('kshare.label.All'), kstpls: kstpls }];
		await categorize();
		toggleCategory(lastSelectedMenuCategory[selectedMenuId]);
	};

	onMount(async () => {
		await rebuild();
		if (adminMode) toggleMenu('menu_all');
		else toggleMenu('menu_scenario');
		toggleCategory('all');
	});

	let q = '';
</script>

<Container class="mt-3">
	{#if adminMode === true}
		<button
			class="btn btn-primary"
			on:click|preventDefault={async (e) => {
				await api.post('kstpl/scan', {}, user.sessionToken);
				await rebuild();
				toggleMenu('menu_all');
			}}>
			Scan Server
		</button>
		<button
			class="btn btn-primary"
			on:click|preventDefault={async (e) => {
				show_category_customize_form = !show_category_customize_form;
			}}>
			{show_category_customize_form ? 'Hide Tags' : 'Customize Tags'}
		</button>
		{#if show_category_customize_form}
			<div class="border rounded p-2 m-1">
				<InputGroup>
					<InputGroupText>Scenario Tags</InputGroupText>
					<input class="form-control" bind:value={allTagsString.scenarios} />
					<button
						class="btn btn-primary"
						on:click|preventDefault={async () => {
							await saveKsConfig();
						}}>
						Set
					</button>
				</InputGroup>
				{#each scenarios as tag}
					<BadgeWithDel
						bind:text={tag}
						withDeleteButton={true}
						on:delete={async (e) => {
							scenarios = scenarios.filter((x) => x !== tag);
							allTagsString.scenarios = scenarios.join(';');
							allTagsString.industries = industries.join(';');
							await saveKsConfig();
						}} />
				{/each}
				<InputGroup>
					<InputGroupText>Industry Tags</InputGroupText>
					<input class="form-control" bind:value={allTagsString.industries} />
					<button
						class="btn btn-primary"
						on:click|preventDefault={async () => {
							await saveKsConfig();
						}}>
						Set
					</button>
				</InputGroup>
				{#each industries as tag}
					<BadgeWithDel
						bind:text={tag}
						withDeleteButton={true}
						on:delete={async (e) => {
							industries = industries.filter((x) => x !== tag);
							allTagsString.scenarios = scenarios.join(';');
							allTagsString.industries = industries.join(';');
							await saveKsConfig();
						}} />
				{/each}
			</div>
		{/if}
	{/if}

	<div class="card">
		<div class="card-header text-center bg-success bg-opacity-25 bg-gradient">
			<div class="fs-3 fw-bold">
				{$_('kshare.title')}
			</div>
			<p class="card-text text-center">
				{$_('kshare.description')}
			</p>
			{#if shownNumber !== 9999}
				<div class="text-center">
					<a
						href={'#'}
						class="btn border-0 m-0 p-0 text-primary"
						on:click={() => {
							goto('/kshares');
						}}>
						{$_('kshare.label.only12')}
					</a>
				</div>
			{/if}
		</div>
		<div class="card-body">
			<div class="nav nav-pills justify-content-center">
				{#each level_1_menus as topMenu, topMenuIndex}
					<li class="nav-item">
						<a
							class={'nav-link' +
								(selectedMenuId === topMenu.id ? ' active bg-secondary' : ' bg-transparent')}
							href={'#'}
							on:click|preventDefault={async () => {
								toggleMenu(topMenu.id);
							}}>
							{$_(`kshare.topmenu.${topMenu.name}`)}
						</a>
					</li>
				{/each}
			</div>
			<ul class="mt-2 nav nav-pills justify-content-center" id="myTab" role="tablist">
				{#each categories as aCate}
					<li class="nav-item">
						<a
							href={'#'}
							class={'py-0 nav-link' +
								(selectedCategoryId === aCate.id ? ' active bg-secondary' : ' bg-transparent')}
							on:click|preventDefault={async () => {
								toggleCategory(aCate.id);
							}}>
							{aCate.name}
						</a>
					</li>
				{/each}
			</ul>

			<section class="row mt-3  align-items-center">
				<InputGroup>
					<Input
						bind:value={q}
						type="search"
						placeholder={$_('home.search.placeholder')}
						style="outline:none" />
					<Button
						on:click={async (e) => {
							e.preventDefault();
							await doSearch(q);
						}}>
						<i class="bi bi-search" />
					</Button>
				</InputGroup>
			</section>
			{#if ksharesInCategory}
				{#if adminMode}
					<div>
						{#each ksharesInCategory.kstpls as kstpl, kstplIndex}
							<div class="border rounded p-2 m-1">
								{#if updatingKsTplPath === kstpl.ksid}
									<div class="row m-1 ">{kstpl.ksid}</div>
									<div class="row m-1 ">
										<input class="form-control" bind:value={kstpl.name} />
									</div>
									<div class="row m-1 ">
										<textarea
											placeholder="Description"
											bind:value={kstpl.desc}
											use:text_area_resize
											class="form-control" />
									</div>
									<div class="row m-1 ">
										<div
											class="btn btn-primary py-0"
											on:click|preventDefault={async () => {
												const { ksid, name, desc, ...others } = kstpl;
												await api.post('kstpl/updateone', { ksid, name, desc }, user.sessionToken);
												updatingKsTplPath = '';
											}}>
											Save
										</div>
									</div>
								{:else}
									<div class="row">
										<div class="col">{kstpl.name} ({kstpl.ksid})</div>
										<div class="col-auto">
											<div
												class="btn btn-primary btn-sm py-0"
												on:click|preventDefault={async () => {
													let kstplid = await api.post(
														'kstpl/preparedesign',
														{ ksid: kstpl.ksid },
														user.sessionToken,
													);
													goto(`/template/${kstplid}&edit`);
												}}>
												Design
											</div>
											<div
												class="btn btn-primary btn-sm py-0"
												on:click|preventDefault={() => {
													updatingKsTplPath = updatingKsTplPath === kstpl.ksid ? '' : kstpl.ksid;
												}}>
												{updatingKsTplPath === kstpl.ksid ? 'Close' : 'Edit'}
											</div>
											<div
												class="btn btn-primary btn-sm py-0"
												on:click|preventDefault={async () => {
													await api.post(
														'kstpl/removeone',
														{ ksid: kstpl.ksid },
														user.sessionToken,
													);
													ksharesInCategory.kstpls.splice(kstplIndex, 1);
													ksharesInCategory.kstpls = ksharesInCategory.kstpls;
												}}>
												Del
											</div>
											<div
												class="btn btn-primary btn-sm py-0"
												on:click|preventDefault={async () => {
													await api.post(
														'kstpl/removeone',
														{ ksid: kstpl.ksid, withFile: true },
														user.sessionToken,
													);
													ksharesInCategory.kstpls.splice(kstplIndex, 1);
													ksharesInCategory.kstpls = ksharesInCategory.kstpls;
												}}>
												DelFile
											</div>
										</div>
									</div>
									<div class="row m-1">{kstpl.desc}</div>
								{/if}
								<div class="p-2 m-1">
									{#each kstpl.tags as tag}
										<BadgeWithDel
											bind:text={tag}
											withDeleteButton={true}
											on:delete={async (e) => {
												let theTpl = await api.post(
													'kstpl/deltag',
													{ ksid: kstpl.ksid, tag: tag },
													user.sessionToken,
												);
												kstpl = theTpl;
												await rebuild();
											}} />
									{/each}
									<select bind:value={kstpl.newtag} class="border rounded">
										<option value={'none'}>Pick to add</option>
										<option value={all_scenarios_txt}>{all_scenarios_txt}</option>
										{#each scenarios as txt}
											<option value={txt}>&nbsp;&nbsp;&nbsp;{txt}</option>
										{/each}
										<option value={all_industries_txt}>{all_industries_txt}</option>
										{#each industries as txt}
											<option value={txt}>&nbsp;&nbsp;&nbsp;{txt}</option>
										{/each}
									</select>
									<button
										class="btn btn-primary btn-sm py-0"
										on:click|preventDefault={async () => {
											if (kstpl.newtag === 'none') return;
											const { ksid, ...others } = kstpl;
											kstpl = await api.post(
												'kstpl/addtag',
												{ ksid: ksid, tag: kstpl.newtag },
												user.sessionToken,
											);
											await rebuild();
										}}>
										Add
									</button>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 d-flex">
						{#each ksharesInCategory.kstpls as kstpl, kstplIndex}
							<div class={'col d-flex align-items-stretch '}>
								<div
									class={'row border rounded p-2 m-1 w-100 ' +
										(kstplmouseover === kstplIndex ? 'bg-success bg-opacity-25' : 'bg-light')}
									on:mouseover={(e) => {
										kstplmouseover = kstplIndex;
									}}
									on:mouseout={() => (kstplmouseover = -1)}
									on:focus={() => (kstplmouseover = kstplIndex)}
									on:blur={() => (kstplmouseover = -1)}>
									<div class="col">
										<div class="row">
											<div class="col">
												{kstpl.name}
												{adminMode ? kstpl.ksid : kstpl.name ? '' : kstpl.ksid}
											</div>
										</div>
										<div class="row">
											<div class="col m-1">{kstpl.desc}</div>
										</div>
										{#if pickingKsTplPath === kstpl.ksid}
											<div class="row">
												<input
													class="form-control"
													bind:value={kstpl.pickto}
													placeholder={$_('kshare.pickit.placeholder')} />
											</div>
											<div class="row">
												<div class="col m-1">
													<button
														class="btn btn-secondary btn-sm py-0"
														on:click|preventDefault={async () => {
															console.log(user);
															if (!user) {
																pickingKsTplPath = '';
																setFadeMessage($_('kshare.pickit.error.no_user'), 'warning');
															} else {
																let ret = await api.post(
																	'kstpl/pickone',
																	{ ksid: kstpl.ksid, pickto: kstpl.pickto },
																	user.sessionToken,
																);
																if (ret.error) {
																	if (ret.error === 'ALREADY_EXIST') {
																		setFadeMessage(
																			$_('kshare.pickit.error.exists.title'),
																			'warning',
																		);
																	} else {
																		setFadeMessage(ret.message, 'warning');
																	}
																} else {
																	setFadeMessage($_('kshare.pickit.result.success'), 'warning');
																	api.removeCacheByPath('template/search');
																}
															}
														}}>
														{$_('kshare.label.Confirm')}
													</button>
													<button
														class="btn btn-secondary btn-sm py-0"
														on:click|preventDefault={() => {
															pickingKsTplPath = '';
														}}>
														{$_('kshare.label.Cancel')}
													</button>
												</div>
											</div>
										{/if}
									</div>
									<div class="col-auto">
										<div
											class="btn btn-primary btn-sm py-0"
											on:click|preventDefault={() => {
												if (!user) {
													pickingKsTplPath = '';
													setFadeMessage($_('kshare.pickit.error.no_user'), 'warning');
													return;
												}
												pickingKsTplPath = pickingKsTplPath === kstpl.ksid ? '' : kstpl.ksid;
											}}>
											{pickingKsTplPath === kstpl.ksid
												? $_('kshare.label.Close')
												: $_('kshare.label.Pick')}
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</Container>
