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
	import type { User, Template, Team } from '$lib/types';
	import { browser, dev } from '$app/env';
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
		FormGroup,
		FormText,
		Input,
		Label,
		Fade
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

	const _startWorkflow = async function () {
		saveOneRecentTemplate(tplid);
		let teamid = theTeam ? theTeam.teamid : '';
		const res = await api.post(
			'workflow/start',
			{ tplid, teamid, wftitle, pbo },
			user.sessionToken
		);
		if (res.wfid) {
			fade_message = `Workflow ${res.wftitle} Started.`;
		} else {
			if (res.errors && res.errors.MongoError && res.errors.MongoError[0]) {
				if (res.errors.MongoError[0].indexOf('duplicate') >= 0)
					fade_message = `${wfid} exists already`;
			} else {
				fade_message = JSON.stringify(res);
			}
		}
		if (timeoutID) clearTimeout(timeoutID);
		timeoutID = setTimeout(() => {
			fade_message = '';
		}, 3000);
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
			<Col>
				<FormGroup>
					<Label>Primary Business Object</Label>
					<Input
						type="url"
						name="pbo"
						bind:value={pbo}
						placeholder="URL of Primary Business Object"
					/>
				</FormGroup>
			</Col>
			<Col>
				<FormGroup>
					<Label>Workflow title</Label>
					<Input
						type="text"
						name="wftitle"
						bind:value={wftitle}
						placeholder="Give it a title, or keep empty to use one auto-generated"
					/>
				</FormGroup>
			</Col>
			<Col>
				<FormGroup>
					<Label>Start with team {theTeam ? theTeam.teamid : ''}</Label>
					<Dropdown {isOpen} class="w-100">
						<DropdownToggle tag="div" class="d-inline-block w-100">
							<Input
								placeholder="type team name here"
								on:keyup={searchTeam}
								bind:value={team_id_for_search}
								class="w-100"
							/>
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
				</FormGroup>
			</Col>
			<Col style="margin-top: 20px;">
				<FormGroup>
					<Button
						color="primary"
						class="w-100"
						on:click={(e) => {
							e.preventDefault();
							_startWorkflow();
						}}>Start it</Button
					>
				</FormGroup>
			</Col>
		</Row>
	</Form>
	<Fade isOpen={fade_message != ''}>
		<Card body>
			{fade_message}
		</Card>
	</Fade>
	{#if theTeam}
		<div class="text-center fs-4">Team {theTeam.teamid}</div>
		{#each roles as aRole (aRole)}
			<Card>
				<CardHeader><CardTitle>{aRole}</CardTitle></CardHeader>
				<CardBody>
					<CardText>
						{#each theTeam.tmap[aRole] as aMember (aMember.uid)}
							<Badge pill color="info" class="kfk-role-member-tag">
								{aMember.cn} &lt;{aMember.uid}&gt;
							</Badge>
						{/each}
					</CardText>
				</CardBody>
			</Card>
		{/each}
	{/if}
</Container>
