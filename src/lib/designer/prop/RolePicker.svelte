<script lang="ts">
	import * as api from '$lib/api';
	import {
		InputGroup,
		InputGroupText,
		Input,
		TabContent,
		TabPane,
		Button,
		Card,
		CardHeader,
		CardBody,
		CardTitle,
		Container
	} from 'sveltestrap';
	import { session } from '$app/stores';
	import OrgChartRelationTest from '$lib/orgchartrelationtest.svelte';

	export let role: any;
	let selectedPickerTab = 'byquery';
	let pickedRole = role;
	let pickedLeaderString = '';
	let pickedQueryString = '';
	export let existingRoles: any[];
	export let readonly;
	export let setFadeMessage;
	import { filterStorage } from '$lib/empstores';
	let lstr = 'VP:GM:Director:Leader';
	let qstr = '/staff&/CEO';
	let user = $session.user;
	function setRoleToByReference(val) {
		setRoleTo(val);
		if (val.startsWith('L:')) {
			pickedLeaderString = val.substring(2);
		} else if (val.startsWith('Q:')) {
			pickedQueryString = val.substring(2);
			qstr = pickedQueryString;
		}
	}
	function setRoleTo(val) {
		if (val.indexOf('<') > -1 || val.indexOf('>') > -1) {
			try {
				//如果字符串中有大于号小于号，就生成一个html对象，通过浏览器来取到起自己的文字，过滤掉字符串中可能的html tag
				let tmp = document.createElement('DIV');
				tmp.innerHTML = val;
				val = tmp.textContent || tmp.innerText || '';
			} catch (err) {
				//如果出现错误，则简单使用regexp进行替换
				//先去掉完整的<>, 然后再去掉独立的< 和  >
				val = val.replace(/\<\/?.*\>/gi, '');
				val = val.replace(/\</gi, '');
				val = val.replace(/\>/gi, '');
			}
		}
		role = val;
	}
	function toggleTab(e) {
		e.preventDefault();
		switch (e.detail) {
			case 'byref':
				setRoleTo(pickedRole);
				break;
			case 'byleader':
				setRoleTo('L:' + pickedLeaderString);
				break;
			case 'byquery':
				setRoleTo('Q:' + pickedQueryString);
				break;
		}
	}
	function roleOptionChanged(e) {
		e.preventDefault();
		let pickedValue = e.target.value;
		setRoleTo(pickedValue);
		if (pickedValue.startsWith('Q:')) {
			pickedQueryString = pickedValue.substring(2);
			qstr = pickedQueryString;
			console.log('qstr:', qstr);
			selectedPickerTab = 'byquery';
		} else if (pickedValue.startsWith('L:')) {
			pickedLeaderString = pickedValue.substring(2);
			lstr = pickedLeaderString;
			console.log('lstr:', lstr);
			selectedPickerTab = 'byleader';
		} else {
			selectedPickerTab = 'byref';
		}
	}

	export function useThisLeader(leader) {
		pickedLeaderString = leader;
		setRoleTo('L:' + pickedLeaderString);
	}
	export function useThisQuery(query) {
		pickedQueryString = query;
		setRoleTo('Q:' + pickedQueryString);
	}
	let try_doers = [];
	let try_with_teamid = $filterStorage.try_with_teamid;
	let try_with_email = $filterStorage.try_with_email ? $filterStorage.try_with_email : user.email;
	async function testGetDoers(e) {
		e.preventDefault();
		if (try_with_teamid === '') {
			setFadeMessage('Please input a team');
			return;
		}
		$filterStorage.try_with_teamid = try_with_teamid;
		$filterStorage.try_with_email = try_with_email;
		let res = await api.post(
			'action/getdoers',
			{ try_with_teamid, try_with_email, role },
			user.sessionToken
		);
		if (res.error) {
			console.log(res.message);
			try_doers = [];
		} else {
			try_doers = res as unknown as string[];
		}
	}
</script>

<InputGroup size="sm">
	<InputGroupText>Participant's Role</InputGroupText>
	<Input bind:value={role} disabled={readonly} />
</InputGroup>
{#if !readonly}
	<InputGroup size="sm">
		<InputGroupText>Pick an existing role</InputGroupText>
		<Input
			type="select"
			bind:value={pickedRole}
			name="select"
			id="exampleSelect"
			disabled={readonly}
			on:change={roleOptionChanged}
		>
			{#each existingRoles as aRoleOption}
				<option>{aRoleOption}</option>
			{/each}
		</Input>
	</InputGroup>
	<div class="mt-3 fs-5">Test role string</div>
	<InputGroup>
		<InputGroupText>Try with team</InputGroupText>
		<Input type="text" bind:value={try_with_teamid} />
	</InputGroup>
	<InputGroup>
		<InputGroupText>Try with user</InputGroupText>
		<Input type="text" bind:value={try_with_email} />
	</InputGroup>
	<Button on:click={testGetDoers} color="primary">Test it</Button>
	{#if Array.isArray(try_doers) && try_doers.length > 0}
		<Card>
			<CardHeader>
				<CardTitle>Result:</CardTitle>
			</CardHeader>
			<CardBody>
				<ul>
					{#each try_doers as rel, index (rel)}
						<li>{rel.cn}: {rel.uid}</li>
					{/each}
				</ul>
			</CardBody>
		</Card>
	{/if}
	<!-- TabContent pills on:tab={(e) => toggleTab(e)}>
		<TabPane tabId="byleader" tab="by Leader">
			<div class="overflow-scroll w-100 bg-light">
				<OrgChartRelationTest {user} show={{ leader: true }} {lstr} {useThisLeader} />
			</div>
		</TabPane>
		<TabPane tabId="byquery" tab="by Query">
			<div class="overflow-scroll w-100 bg-light">
				<OrgChartRelationTest {user} show={{ query: true }} {qstr} {useThisQuery} />
			</div>
		</TabPane>
	</TabContent -->
{/if}
