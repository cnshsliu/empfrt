<script context="module" lang="ts">
	import type { SearchResult } from '$lib/types';
	export async function load({ page, fetch, session }) {
		const tplid = page.query.get('tplid');
		const tpl_mode = 'read';
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
	import { _ } from '$lib/i18n';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import FileUploader from '$lib/FileUploader.svelte';
	import { filterStorage } from '$lib/empstores';
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
		Label,
		Modal,
		ModalFooter,
		ModalHeader,
		ModalBody
	} from 'sveltestrap';
	import { Badge, DropdownItem, DropdownMenu, DropdownToggle, Dropdown } from 'sveltestrap';
	//export let template;
	export let user: User;
	export let teams: Team[];
	export let tplid: string;
	//export let template: Template;
	let showConfirmModal = false;
	let fullscreen = false;
	let isOpen = false;
	let roles = [];
	let uploadedFiles = [];
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
	const toggle = () => {
		showConfirmModal = !showConfirmModal;
	};

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
		for (let i = 0; i < teams.length; i++) {
			if (teams[i].teamid.match(team_id_for_search)) {
				search_result = [...search_result, teams[i]];
			}
		}

		if (team_id_for_search === 'show' || search_result.length > 0) {
			isOpen = true;
		} else {
			isOpen = false;
		}
	};

	let starting = 0;
	let uploadingFile = false;
	let startedWorkflow = null;
	const _startWorkflow = async function (rehearsal = false) {
		starting = 0;
		fade_message = '';
		saveOneRecentTemplate(tplid);
		let teamid = theTeam ? theTeam.teamid : '';

		const res = await api.post(
			'workflow/start',
			{ rehearsal, tplid, teamid, wftitle, pbo, uploadedFiles },
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
	let desc = '';
	onMount(async () => {
		if (localStorage) {
			recentTemplates = JSON.parse(localStorage.getItem('recentTemplates') ?? JSON.stringify([]));
			recentTeams = JSON.parse(localStorage.getItem('recentTeams') ?? JSON.stringify([]));
		}
		$filterStorage.tplid = tplid;
		$filterStorage.workTitlePattern = '';

		let res = await api.post('template/basic', { tplid: tplid }, user.sessionToken);
		desc = res.desc ? res.desc : '';
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
		if (recentTemplates.length > 15) {
			recentTemplates.splice(15);
		}
		localStorage.setItem('recentTemplates', JSON.stringify(recentTemplates));
		recentTemplates = recentTemplates;
	};
</script>

<Container class="mt-3">
	<Row cols="1">
		<Col class="d-flex justify-content-center">
			<span class="text-xs-center fs-3">
				{$_('start.startWorkflow')}
			</span>
		</Col>
		<Col class="d-flex justify-content-center">
			<span class="text-xs-center fs-5">
				<a class="preview-link kfk-template-id tnt-template-id" href="/template/@{tplid}&read">
					{tplid}
				</a>
			</span>
		</Col>
		<Col class="d-flex justify-content-center">
			<span class="text-xs-center fs-5">
				{desc}
			</span>
		</Col>
	</Row>
</Container>
<Container class="mt-3 w-50">
	<Form>
		<Row cols="1" class="mt-2">
			<Col class="text-center">
				{$_('start.context')}
			</Col>
			<Col>
				<div class="form-floating">
					<Input type="url" name="pbo" id="input-pbo" class="form-control" bind:value={pbo} />
					<Label for="input-pbo">
						{$_('start.pbo')}
					</Label>
				</div>
			</Col>
			<Col class="text-center">
				<FileUploader
					on:uploading={(e) => {
						uploadingFile = true;
					}}
					on:uploaded={(e) => {
						uploadingFile = false;
						uploadedFiles = e.detail;
						console.log(uploadedFiles);
					}}
					on:warning={(e) => {
						uploadingFile = false;
						uploadedFiles = e.detail;
						console.log(uploadedFiles);
					}}
					on:error={(e) => {
						uploadingFile = false;
						uploadedFiles = e.detail;
						console.log(uploadedFiles);
					}}
				/>
			</Col>
			<Col>
				<div class="form-floating">
					<Input
						type="text"
						name="wftitle"
						id="input-wftitle"
						class="form-control"
						bind:value={wftitle}
					/>
					<Label for="input-wftitle">
						{$_('start.title')}
					</Label>
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
							<Label for="input-team">
								{$_('start.teamid')}
								{theTeam ? theTeam.teamid : ''}</Label
							>
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
					<span>
						{$_('start.recentTeam')}
					</span>
					{#each recentTeams as ateam, index (ateam)}
						<Button
							class="mx-1 badge bg-light text-primary border border-primary"
							on:click={(e) => {
								e.preventDefault();
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
	{#if uploadingFile === false}
		<Row cols="1">
			<Col style="margin-top: 20px;">
				<Button
					disabled={starting === 1}
					color="primary"
					class="w-100"
					on:click={(e) => {
						e.preventDefault();
						if (wftitle.trim().length === 0 || pbo.trim().length === 0) {
							showConfirmModal = true;
						} else {
							_startWorkflow(false);
						}
					}}
				>
					{$_('start.startIt')}
				</Button>
			</Col>
		</Row>
		<div class="mt-3 w-100 text-center">
			<div>
				{$_('start.OR')}
			</div>
		</div>
		<Row cols="1">
			<Col>
				<Button
					disabled={starting === 1}
					color="secondary"
					class="w-100"
					on:click={(e) => {
						e.preventDefault();
						_startWorkflow(true);
					}}
				>
					{$_('start.rehearsal')}
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
							$filterStorage.tplid = startedWorkflow.tplid;
							$filterStorage.workTitlePattern = 'wf:' + startedWorkflow.wfid;
							$filterStorage.workStatus = 'ST_RUN';
							goto('/work');
							//goto(`/workflow/@${startedWorkflow.wfid}`);
						}}
					>
						{$_('start.checkitout')}
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
						{$_('start.dismiss')}
					</Button>
				</Col>
			{/if}
		</Row>
	{/if}
	{#if theTeam}
		<div class="text-center fs-4">Team {theTeam.teamid}</div>
		{#each roles as aRole (aRole)}
			<Card>
				<CardHeader><CardTitle>{aRole}</CardTitle></CardHeader>
				<CardBody>
					<CardText>
						{#each theTeam.tmap[aRole] as aMember (aMember.uid)}
							<Badge pill color="light" class="kfk-tag border border-primary text-primary">
								{aMember.cn} &lt;{aMember.uid}&gt;
							</Badge>
						{/each}
					</CardText>
				</CardBody>
			</Card>
		{/each}
	{/if}
</Container>
<div style="height:200px;">&nbsp;</div>
<Modal isOpen={showConfirmModal} {toggle} {fullscreen}>
	<ModalHeader {toggle}>{$_('start.pleaseConfirm')}</ModalHeader>
	<ModalBody>
		{#if pbo.trim().length === 0}
			<div>{$_('start.warnNoPbo')}</div>
		{/if}
		{#if wftitle.trim().length === 0}
			<div>{$_('start.warnNoTitle')}</div>
		{/if}
	</ModalBody>
	<ModalFooter>
		<Button
			color="primary"
			on:click={() => {
				toggle();
				_startWorkflow(false);
			}}
		>
			{$_('start.startAnyway')}
		</Button>
		<Button color="secondary" on:click={toggle}>Cancel</Button>
	</ModalFooter>
</Modal>
