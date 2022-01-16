<script lang="ts">
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { qtb } from '$lib/utils';
	import { getNotificationsContext } from 'svelte-notifications';
	import PDSResolver from '$lib/input/PDSResolver.svelte';
	const { addNotification } = getNotificationsContext();
	import type { oneArgFunc } from '$lib/types';
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

	let thePdsResolver;
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
	export function setFadeMessage(
		message: string,
		type = 'warning',
		pos = 'bottom-right',
		time = 2000
	) {
		(addNotification as oneArgFunc)({
			text: message,
			position: pos,
			type: type,
			removeAfter: time
		});
	}

	let resolver_label = $_('prop.action.p10t.pds');
	let resolver_btnText = $_('prop.action.button.tryit');
</script>

<PDSResolver
	bind:this={thePdsResolver}
	bind:value={role}
	{readonly}
	bind:label={resolver_label}
	bind:btnText={resolver_btnText}
/>
{#if !readonly}
	<InputGroup size="sm">
		<InputGroupText>
			{$_('prop.action.p10t.pick')}
		</InputGroupText>
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
{/if}
