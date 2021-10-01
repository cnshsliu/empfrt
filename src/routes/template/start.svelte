<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		const tplid = page.query.get('tplid');
		console.log('TPLID = ', tplid);
		const tpl_mode = 'read';
		//const jsonUrl = `/template/@${tplid}&${tpl_mode}.json`;
		//const res = await fetch(jsonUrl);
		const res_team = await api.post('team/search', { limit: 1000 }, session.user.sessionToken);

		return {
			props: {
				//template: await res.json(),
				tplid: tplid,
				user: session.user,
				teams: res_team
			}
		};
	}
</script>

<script lang="ts">
	import type { User, Template, Team } from '$lib/types';
	import * as api from '$lib/api';
	import { Container, Row, Col, Button } from 'sveltestrap';
	import { Form, FormGroup, FormText, Input, Label, Fade, Card } from 'sveltestrap';
	import { Badge, DropdownItem, DropdownMenu, DropdownToggle, Dropdown } from 'sveltestrap';
	import { enhance } from '$lib/form';
	export let user: User;
	export let teams: Team[];
	export let tplid: string;
	//export let template: Template;
	let isOpen = false;
	let roles = [];
	let fade_message = '';
	let timeoutID = null;
	let pbo = '';
	let wfid = '';
	let team_id_for_search = '';
	import { title } from '$lib/title';
	import StartTeamRoles from './_start_teamRoles.svelte';
	$title = 'HyperFlow';
	let search_result = [];
	let theTeam: Team;
	let theMap = [];

	function pickTeam(teamId: string) {
		team_id_for_search = teamId;
		theTeam = null;
		for (let i = 0; i < teams.length; i++) {
			if (teams[i].teamid === teamId) {
				theTeam = teams[i];
				roles = typeof theTeam.tmap === 'undefined' ? [] : Object.keys(theTeam.tmap);
				console.log(theTeam);
				console.log(roles);
			}
		}
		isOpen = false;
	}
	function searchTeam() {
		search_result.splice(0, search_result.length);
		console.log(team_id_for_search);
		for (let i = 0; i < teams.length; i++) {
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
	}

	async function _startWorkflow() {
		let teamid = theTeam ? theTeam.teamid : '';
		const res = await api.post('workflow/start', { tplid, teamid, wfid, pbo }, user.sessionToken);
		if (res.wfid) {
			fade_message = `Workflow ${res.wfid} Started.`;
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
	}
</script>

<Container>
	<Row>
		<Col class="d-flex justify-content-center">
			<h1 class="text-xs-center">Start Workflow</h1>
		</Col>
	</Row>
</Container>
<Container>
	<Form>
		<Row>
			<Col>
				<FormGroup>
					<Label>PBO</Label>
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
					<Label>Workflow ID</Label>
					<Input
						type="text"
						name="wfid"
						bind:value={wfid}
						placeholder="User defined workflow ID, keep empty to use auto id"
					/>
				</FormGroup>
			</Col>
		</Row>
		<Row>
			<Col>
				<FormGroup>
					<Label>Start With Team {theTeam ? theTeam.teamid : ''}</Label>
					<Dropdown {isOpen}>
						<DropdownToggle tag="div" class="d-inline-block">
							<Input on:keyup={searchTeam} bind:value={team_id_for_search} />
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
				</FormGroup>
			</Col>
			<Col>
				<FormGroup>
					<Button
						color="primary"
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
		<Row
			><Col>
				<h3>Team Roles</h3>
			</Col>
		</Row>
		{#each roles as aRole (aRole)}
			<Row
				><Col>
					<h5>{aRole}</h5>
				</Col>
			</Row>
			<Row
				><Col sm={{ size: 11, order: 2, offset: 1 }}>
					{#each theTeam.tmap[aRole] as aMember (aMember.uid)}
						<Badge pill color="info" class="kfk-role-member-tag">
							{aMember.dname} &lt;{aMember.uid}&gt;
						</Badge>
					{/each}
				</Col>
			</Row>
		{/each}
	{/if}
</Container>
