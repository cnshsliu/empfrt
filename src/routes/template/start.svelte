<script context="module" lang="ts">
	import type { SearchResult } from '$lib/types';
	export async function load({ page, fetch, session }) {
		const tplid = page.query.get('tplid');
		console.log('TPLID = ', tplid);
		const tpl_mode = 'read';
		/* const jsonUrl = `/template/@${tplid}&${tpl_mode}.json`;
		const res = await fetch(jsonUrl);
		console.log('---------');
		console.log(await res.json()); */
		const res_team: SearchResult = (await api.post(
			'team/search',
			{ limit: 1000 },
			session.user.sessionToken
		)) as unknown as SearchResult;
		const theTeams = res_team.objs;

		return {
			props: {
				tplid: tplid,
				user: session.user,
				teams: theTeams
			}
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { User, Template, Team, oneArgFunc } from '$lib/types';
	import { getNotificationsContext } from 'svelte-notifications';
	const { addNotification } = getNotificationsContext();
	import * as api from '$lib/api';
	import {
		Container,
		Row,
		Col,
		Button,
		Card,
		CardHeader,
		CardBody,
		CardText,
		CardTitle,
		Form,
		Input,
		Label
	} from 'sveltestrap';
	import { Badge, DropdownItem, DropdownMenu, DropdownToggle, Dropdown } from 'sveltestrap';
	//export let template;
	export let user: User;
	export let teams: Team[];
	export let tplid: string;
	//export let template: Template;
	let isOpen = false;
	let roles = [];
	let fade_message = '';
	let timeoutID = null;
	let pbo = '';
	let wftitle = '';
	let team_id_for_search = '';
	import { title } from '$lib/title';
	import StartTeamRoles from './_start_teamRoles.svelte';
	$title = 'HyperFlow';
	let search_result = [];
	let theTeam: Team;

	function setFadeMessage(message: string, type = 'warning', pos = 'bottom-right', time = 2000) {
		(addNotification as oneArgFunc)({
			text: message,
			position: pos,
			type: type,
			removeAfter: time
		});
	}

	const pickTeam = function (teamId: string) {
		team_id_for_search = teamId;
		theTeam = null;
		saveOneRecentTeam(teamId);
		for (let i = 0; i < teams.length; i++) {
			if (teams[i].teamid === teamId) {
				theTeam = teams[i];
				roles = typeof theTeam.tmap === 'undefined' ? [] : Object.keys(theTeam.tmap);
			}
		}
		isOpen = false;
	};
	const searchTeam = function () {
		search_result.splice(0, search_result.length);
		console.log(team_id_for_search, teams.length);
		for (let i = 0; i < teams.length; i++) {
			console.log(teams[i].teamid);
			if (teams[i].teamid.match(team_id_for_search)) {
				console.log(teams[i].teamid, 'match', team_id_for_search);
				search_result = [...search_result, teams[i]];
			}
		}
		console.log(search_result.length);

		if (team_id_for_search === 'show' || search_result.length > 0) {
			isOpen = true;
		} else {
			isOpen = false;
		}
	};

	let starting = 0;
	let startedWorkflow = null;
	const _startWorkflow = async function (rehearsal = false) {
		starting = 0;
		fade_message = '';
		saveOneRecentTemplate(tplid);
		let teamid = theTeam ? theTeam.teamid : '';
		const res = await api.post(
			'workflow/start',
			{ rehearsal, tplid, teamid, wftitle, pbo },
			user.sessionToken
		);
		if (res.wfid) {
			startedWorkflow = res;
			fade_message = `Workflow ${res.wftitle} Started.`;
			setFadeMessage(fade_message, 'success');
			starting = 1;
		} else {
			startedWorkflow = null;
			if (res.errors && res.errors.MongoError && res.errors.MongoError[0]) {
				if (res.errors.MongoError[0].indexOf('duplicate') >= 0) {
					fade_message = `exists already`;
					setFadeMessage(fade_message, 'warning');
				}
			} else {
				fade_message = JSON.stringify(res);
				setFadeMessage(fade_message, 'warning');
			}
		}
	};

	let recentTemplates = [];
	let recentTeams = [];
	onMount(() => {
		if (localStorage) {
			recentTemplates = JSON.parse(localStorage.getItem('recentTemplates') ?? JSON.stringify([]));
			recentTeams = JSON.parse(localStorage.getItem('recentTeams') ?? JSON.stringify([]));

			console.log('recentTemplates:>>', recentTemplates, '<<');
			console.log('recentTeams>>', recentTeams, '<<');
		}
	});
	const saveOneRecentTeam = function (team) {
		let tmp = recentTeams.indexOf(team);
		if (tmp > -1) {
			recentTeams.splice(tmp, 1);
		}
		recentTeams.unshift(team);
		if (recentTeams.length > 10) {
			recentTeams.splice(10);
		}
		localStorage.setItem('recentTeams', JSON.stringify(recentTeams));
		recentTeams = recentTeams;
	};
	const saveOneRecentTemplate = function (tplid) {
		if (tplid === null || tplid === undefined || tplid === '') return;
		let tmp = recentTemplates.indexOf(tplid);
		if (tmp > -1) {
			recentTemplates.splice(tmp, 1);
		}
		recentTemplates.unshift(tplid);
		if (recentTemplates.length > 10) {
			recentTemplates.splice(10);
		}
		localStorage.setItem('recentTemplates', JSON.stringify(recentTemplates));
		recentTemplates = recentTemplates;
	};
</script>

<Container class="mt-3">
	<Row cols="1">
		<Col class="d-flex justify-content-center">
			<span class="text-xs-center fs-3">Start Workflow</span>
		</Col>
		<Col class="d-flex justify-content-center">
			<span class="text-xs-center fs-5">
				<a class="preview-link kfk-template-id tnt-template-id" href="/template/@{tplid}&read">
					{tplid}
				</a>
			</span>
		</Col>
	</Row>
</Container>
<Container class="mt-3 w-50">
	<Form>
		<Row cols="1">
			<Col style="margin-top: 20px;">
				<Button
					disabled={starting === 1}
					color="primary"
					class="w-100"
					on:click={(e) => {
						e.preventDefault();
						_startWorkflow(false);
					}}
					>Start it
				</Button>
			</Col>
		</Row>
		<Row cols="1">
			<Col style="margin-top: 20px;">
				<Button
					disabled={starting === 1}
					color="primary"
					class="w-100"
					on:click={(e) => {
						e.preventDefault();
						_startWorkflow(true);
					}}
				>
					Rehearsal
				</Button>
			</Col>
		</Row>
		<Row cols="2" style="margin-top: 20px;">
			{#if startedWorkflow !== null}
				<Col>
					<Button
						class="w-100"
						on:click={(e) => {
							e.preventDefault();
							goto(`/workflow/@${startedWorkflow.wfid}`);
						}}
					>
						Check it out
					</Button>
				</Col>
				<Col>
					<Button
						class="w-100"
						on:click={(e) => {
							e.preventDefault();
							starting = 0;
							startedWorkflow = null;
						}}
					>
						Dismiss
					</Button>
				</Col>
			{/if}
		</Row>
		<Row cols="1" class="mt-5">
			<Col>Optional Workflow Context:</Col>
			<Col>
				<div class="form-floating">
					<Input
						type="url"
						name="pbo"
						id="input-pbo"
						class="form-control"
						bind:value={pbo}
						placeholder="URL of Primary Business Object"
					/>
					<Label for="input-pbo">Primary Business Object</Label>
				</div>
			</Col>
			<Col>
				<div class="form-floating">
					<Input
						type="text"
						name="wftitle"
						id="input-wftitle"
						class="form-control"
						bind:value={wftitle}
						placeholder="Give it a title, or keep empty to use one auto-generated"
					/>
					<Label for="input-wftitle">Workflow title</Label>
				</div>
			</Col>
			<Col>
				<Dropdown {isOpen} class="w-100">
					<DropdownToggle tag="div" class="d-inline-block w-100">
						<div class="form-floating">
							<Input
								placeholder="type team name here"
								on:keyup={searchTeam}
								bind:value={team_id_for_search}
								class="w-100 form-control"
								id="input-team"
							/>
							<Label for="input-team">Start with team {theTeam ? theTeam.teamid : ''}</Label>
						</div>
					</DropdownToggle>
					<DropdownMenu>
						{#each search_result as aTeam}
							<DropdownItem
								on:click={(e) => {
									e.preventDefault();
									pickTeam(aTeam.teamid);
								}}
							>
								{aTeam.teamid}
							</DropdownItem>
						{/each}
					</DropdownMenu>
				</Dropdown>
				<div class="mt-2">
					<span>Recent used team:</span>
					{#each recentTeams as ateam, index (ateam)}
						<Button
							class="mx-1 badge bg-info text-dark"
							on:click={(e) => {
								e.preventDefault();
								console.log(ateam);
								team_id_for_search = ateam;
								pickTeam(ateam);
							}}
						>
							{ateam}
						</Button>
					{/each}
				</div>
			</Col>
		</Row>
	</Form>
	{#if theTeam}
		<div class="text-center fs-4">Team {theTeam.teamid}</div>
		{#each roles as aRole (aRole)}
			<Card>
				<CardHeader><CardTitle>{aRole}</CardTitle></CardHeader>
				<CardBody>
					<CardText>
						{#each theTeam.tmap[aRole] as aMember (aMember.uid)}
							<Badge pill color="info" class="kfk-tag">
								{aMember.cn} &lt;{aMember.uid}&gt;
							</Badge>
						{/each}
					</CardText>
				</CardBody>
			</Card>
		{/each}
	{/if}
</Container>
