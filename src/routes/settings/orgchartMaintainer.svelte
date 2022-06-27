<svelte:options accessors={true} />

<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import { createEventDispatcher } from 'svelte';
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	import { session } from '$app/stores';
	import { setFadeMessage } from '$lib/Notifier';
	import OrgChartCsvFormat from './orgchartcsvformat.svelte';
	import type { EmpResponse, OrgMembers, oneArgFunc } from '$lib/types';
	import { Input, InputGroupText, InputGroup, Container, Button, Row, Col } from 'sveltestrap';
	const dispatch = createEventDispatcher();
	let allOUs = [];
	let files: any;
	let content;
	let errMsg;
	let pickedNewOU = 'root';
	let user = $session.user;
	let fileSaver = null;
	let default_user_password = '';
	let admin_password = '';

	let new_ou_id = '';
	let new_ou_name = '';
	let new_user_ou_id = '';
	let new_user_name = '';
	let new_user_email = '';
	let delete_user_email = '';
	let delete_ou_id = '';
	async function uploadOrgChart(e: Event) {
		e.preventDefault();
		const formData = new FormData();
		formData.append('password', admin_password);
		formData.append('default_user_password', default_user_password);
		formData.append('file', files[0]);
		try {
			await fetch(`${API_SERVER}/orgchart/import`, {
				method: 'POST',
				headers: {
					Authorization: user.sessionToken,
				},
				body: formData,
			})
				.then((response) => response.json())
				.then(async (result) => {
					if (result.error) {
						setFadeMessage(result.message, 'warning');
					} else {
						refreshAllOUs().then();
						dispatch('refreshOrgChart');
					}
				})
				.catch((error) => {
					console.error('Error:', error);
					setFadeMessage(error.message, 'warning');
				});
		} catch (err) {
			console.error(err);
		}
	}

	let usersNotStaff = [];

	const getUserNotStaff = async function () {
		usersNotStaff = (await api.post('users/notstaff', {}, user.sessionToken)) as any;
	};
	const deleteUser = async function (email) {
		(await api.post('account/remove', { emailtobedel: email }, user.sessionToken)) as any;
		usersNotStaff = usersNotStaff.filter((u) => {
			return u.email !== email;
		});
	};

	export const setPickedStaff = function (pickedStaff) {
		new_user_ou_id = pickedStaff.ou;
		new_user_name = pickedStaff.cn;
		new_user_email = pickedStaff.uid;
		delete_user_email = pickedStaff.uid;
		pickedNewOU = pickedStaff.ou;
	};

	export const setPickedOU = function (pickedOU) {
		new_ou_id = pickedOU.ou;
		new_ou_name = pickedOU.cn;
		delete_ou_id = pickedOU.ou;
	};

	const refreshAllOUs = async () => {
		allOUs = await api.post('orgchart/allous', {}, user.sessionToken);
		for (let i = 0; i < allOUs.length; i++) {
			let tblChars = '';
			tblChars = '・・'.repeat(allOUs[i].level);
			allOUs[i].prefix = tblChars;
		}
	};

	onMount(async () => {
		await refreshAllOUs();
	});
</script>

<form class="new" enctype="multipart/form-data">
	<Container class="text-nowrap">
		<div class="mt-5" />
		<InputGroup>
			<InputGroupText>{$_('setting.orgchart.adminpwd')}</InputGroupText>
			<Input bind:value={admin_password} type="password" required={true} />
		</InputGroup>
		<InputGroup>
			<InputGroupText>{$_('setting.orgchart.emp_pwd')}</InputGroupText>
			<Input bind:value={default_user_password} type="password" required={true} />
		</InputGroup>
		<InputGroup class="mt-2">
			<InputGroupText>{$_('setting.orgchart.ou_id')}</InputGroupText>
			<Input bind:value={new_user_ou_id} />
			<InputGroupText>{$_('setting.orgchart.emp_name')}</InputGroupText>
			<Input bind:value={new_user_name} />
			<InputGroupText>{$_('setting.orgchart.emp_email')}</InputGroupText>
			<Input bind:value={new_user_email} />
			<Button
				color="primary"
				on:click={async (e) => {
					e.preventDefault();
					let res = await api.post(
						'orgchart/add',
						{
							password: admin_password,
							content: `${new_user_ou_id},${new_user_name},${new_user_email},,,,`,
							default_user_password: default_user_password,
						},
						user.sessionToken,
					);
					if (res.error) {
						setFadeMessage(res.message, 'warning');
					} else {
						dispatch('refreshOrgChart');
					}
				}}>
				{$_('setting.orgchart.btn.emp_create')}
			</Button>
		</InputGroup>
		<InputGroup class="mt-2">
			<InputGroupText>{$_('setting.orgchart.copyormovestaffto')}</InputGroupText>
			<select class="form-select" bind:value={pickedNewOU}>
				{#each allOUs as aOU, aOUIndex}
					<option value={aOU.ou}>{aOU.prefix}{aOU.cn}</option>
				{/each}
			</select>
			<button
				class="btn btn-primary"
				on:click|preventDefault={async () => {
					let res = await api.post(
						'orgchart/copyormovestaff',
						{
							action: 'delete',
							uid: new_user_email,
							from: new_user_ou_id,
							to: pickedNewOU,
							cn: new_user_name,
						},
						user.sessionToken,
					);
					if (res.error) {
						setFadeMessage($_(`error.${res.error}`), 'warning');
					} else {
						dispatch('refreshOrgChart');
					}
				}}>
				{$_('setting.orgchart.btn.removeentry')}
			</button>
			<button
				class="btn btn-primary"
				on:click|preventDefault={async () => {
					await api.post(
						'orgchart/copyormovestaff',
						{
							action: 'copy',
							uid: new_user_email,
							from: new_user_ou_id,
							to: pickedNewOU,
							cn: new_user_name,
						},
						user.sessionToken,
					);
					dispatch('refreshOrgChart');
				}}>
				{$_('setting.orgchart.btn.copyto')}
			</button>
			<button
				class="btn btn-primary"
				on:click|preventDefault={async () => {
					await api.post(
						'orgchart/copyormovestaff',
						{
							action: 'move',
							uid: new_user_email,
							from: new_user_ou_id,
							to: pickedNewOU,
							cn: new_user_name,
						},
						user.sessionToken,
					);
					dispatch('refreshOrgChart');
				}}>
				{$_('setting.orgchart.btn.moveto')}
			</button>
		</InputGroup>
		<!--InputGroup class="mt-2">
			<InputGroupText>{$_('setting.orgchart.emp_email')}</InputGroupText>
			<Input bind:value={delete_user_email} />
			<Button
				color="primary"
				on:click={async (e) => {
					e.preventDefault();
					let res = await api.post(
						'orgchart/add',
						{
							password: admin_password,
							content: `D,${delete_user_email},,,,,,`,
							default_user_password: 'not required',
						},
						user.sessionToken,
					);
					if (res.error) {
						setFadeMessage(res.message, 'warning');
					} else {
						dispatch('refreshOrgChart');
					}
				}}>
				{$_('setting.orgchart.btn.emp_delete')}
			</Button>
		</InputGroup -->
		<InputGroup class="mt-2">
			<InputGroupText>{$_('setting.orgchart.ou_id')}</InputGroupText>
			<Input bind:value={new_ou_id} />
			<InputGroupText>{$_('setting.orgchart.ou_name')}</InputGroupText>
			<Input bind:value={new_ou_name} />
			<Button
				color="primary"
				on:click={async (e) => {
					e.preventDefault();
					let res = await api.post(
						'orgchart/add',
						{
							password: admin_password,
							content: `${new_ou_id},${new_ou_name},,,,,`,
							default_user_password: 'not required',
						},
						user.sessionToken,
					);
					if (res.error) {
						setFadeMessage(res.message, 'warning');
					} else {
						refreshAllOUs().then();
						dispatch('refreshOrgChart');
					}
				}}>
				{$_('setting.orgchart.btn.ou_create')}
			</Button>
		</InputGroup>
		<InputGroup class="mt-2">
			<InputGroupText>{$_('setting.orgchart.ou_id')}</InputGroupText>
			<Input bind:value={delete_ou_id} />
			<Button
				color="primary"
				on:click={async (e) => {
					e.preventDefault();
					let res = await api.post(
						'orgchart/add',
						{
							password: admin_password,
							content: `D,${delete_ou_id},,,,,,`,
							default_user_password: 'not required',
						},
						user.sessionToken,
					);
					if (res.error) {
						setFadeMessage(res.message, 'warning');
					} else {
						refreshAllOUs().then();
						dispatch('refreshOrgChart');
					}
				}}>
				{$_('setting.orgchart.btn.ou_delete')}
			</Button>
		</InputGroup>
		<InputGroup class="mt-5">
			<InputGroupText>{$_('setting.orgchart.exportxlsx')}</InputGroupText>
			<Button
				size="sm"
				color="primary"
				on:click={async (e) => {
					e.preventDefault();
					api
						.postSimple('orgchart/export', { password: admin_password }, user.sessionToken)
						.then((res) => {
							return res.blob();
						})
						.then(async (data) => {
							if (fileSaver === null) {
								fileSaver = await import('file-saver');
							}
							fileSaver.saveAs(data, 'orgchart.xlsx');
							/*
							//If dont' like file-saver, you can save file like below:
							var a = document.createElement('a');
							a.href = window.URL.createObjectURL(data);
							a.download = 'orgchart.xlsx';
							a.click();
							*/
						});
				}}>
				{$_('setting.orgchart.btn.export')}
			</Button>
		</InputGroup>
		<InputGroup class="mt-5">
			<InputGroupText>{$_('setting.orgchart.importxlsx')}</InputGroupText>
			<input class="form-control" name="file" accept=".xlsx" type="file" bind:files />
			<Button size="sm" on:click={uploadOrgChart} color="primary">
				{$_('setting.orgchart.btn.import')}
			</Button>
		</InputGroup>
		<OrgChartCsvFormat />
		{#if errMsg}
			{errMsg}
		{/if}
	</Container>
</form>
<Container class="mt-5">
	<Button on:click={getUserNotStaff}>Get users who are not in Orgchart</Button>
	<Row cols="1" class="mt-1">
		{#each usersNotStaff as uns, index}
			<Col class="mt-1">
				<Row>
					<Col>
						{uns.username}({uns.email})
					</Col>
					<Col>
						<Button
							on:click={async (e) => {
								await deleteUser(uns.email);
							}}>
							Delete
						</Button>
					</Col>
				</Row>
			</Col>
		{/each}
	</Row>
</Container>
