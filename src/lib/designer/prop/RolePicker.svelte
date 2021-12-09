<script lang="ts">
	import { InputGroup, InputGroupText, Input, TabContent, TabPane, Button } from 'sveltestrap';
	import { session } from '$app/stores';
	import OrgChartRelationTest from '$lib/orgchartrelationtest.svelte';

	export let role: any;
	let selectedPickerTab = 'byquery';
	let pickedRole = role;
	let pickedLeaderString = '';
	let pickedQueryString = '';
	export let existingRoles: any[];
	export let readonly;
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
			selectedPickerTab = 'byquery';
		} else if (pickedValue.startsWith('L:')) {
			pickedLeaderString = pickedValue.substring(2);
			lstr = pickedLeaderString;
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

	$: {
		let a = selectedPickerTab;
		console.log(selectedPickerTab);
	}
</script>

<InputGroup size="sm">
	<InputGroupText>Role</InputGroupText>
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
	<TabContent on:tab={(e) => toggleTab(e)}>
		<TabPane tabId="byleader" tab="by Leader">
			<InputGroup size="sm">
				<InputGroupText>Leader Title</InputGroupText>
				<Input bind:value={pickedLeaderString} />
			</InputGroup>
			<Button
				color="primary"
				class="w-100"
				on:click={(e) => {
					e.preventDefault();
					setRoleTo('L:' + pickedLeaderString);
					lstr = pickedLeaderString;
				}}
			>
				Set by Leader
			</Button>
			Colon separated leaders' title, for example: "director" will search workflow doer's director upwards
			along the orgchart tree. "director:CTO:CEO" will search doer's director and CTO and CEO upwards
			along the orgchart tree.
			<hr />
			<div>Try out:</div>
			<div class="overflow-scroll w-100 bg-light">
				<OrgChartRelationTest {user} show={{ leader: true }} {lstr} {useThisLeader} />
			</div>
		</TabPane>
		<TabPane tabId="byquery" tab="by Query">
			<InputGroup size="sm">
				<InputGroupText>Orgchart Query:</InputGroupText>
				<Input bind:value={pickedQueryString} />
			</InputGroup>
			<Button
				color="primary"
				class="w-100"
				on:click={(e) => {
					e.preventDefault();
					setRoleTo('Q:' + pickedQueryString);
					qstr = pickedQueryString;
				}}
			>
				Set by Query String
			</Button>
			Format: [dep1 regexp]/(pos1:pos2) & [dep2 regexp]/(pos3:pos4) &...
			<hr />
			<div>Try out:</div>
			<div class="overflow-scroll w-100 bg-light">
				<OrgChartRelationTest {user} show={{ query: true }} {qstr} {useThisQuery} />
			</div>
		</TabPane>
	</TabContent>
{/if}
