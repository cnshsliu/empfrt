<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { session } from '$app/stores';
	import { getNotificationsContext } from 'svelte-notifications';
	import OrgChartCsvFormat from './orgchartcsvformat.svelte';
	const { addNotification } = getNotificationsContext();
	import type { EmpResponse, OrgMembers, oneArgFunc } from '$lib/types';
	import { Input, InputGroupText, InputGroup, Container, Button } from 'sveltestrap';
	let files: any;
	let content;
	let errMsg;
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
					Authorization: user.sessionToken
				},
				body: formData
			})
				.then((response) => response.json())
				.then(async (result) => {
					console.log(result.logs);
					if (result.error) {
						setFadeMessage(result.message, 'warning');
					} else {
						setFadeMessage('Sucess, refresh orgchart please.', 'success');
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

	async function saveResult(res) {
		if (fileSaver === null) {
			fileSaver = await import('file-saver');
		}
		var BOM = '\uFEFF';
		res = res.map((x) => {
			x = x.replace(/[\r|\n]/, '');
			return x + '\n';
			//return x;
		});
		res.unshift(BOM);
		var csvData = res;
		var blob = new Blob(csvData, { type: 'text/csv;charset=UTF-8' });
		fileSaver.saveAs(blob, 'orgchart.csv');
		//res.map((x) => console.log(x));
	}
</script>

<form class="new" enctype="multipart/form-data">
	<Container class="text-nowrap">
		<div class="mt-5" />
		<InputGroup>
			<InputGroupText>{$_('setting.orgchart.adminpwd')}</InputGroupText>
			<Input bind:value={admin_password} type="password" required={true} />
		</InputGroup>
		<InputGroup class="mt-2">
			<InputGroupText>{$_('setting.orgchart.ou_id')}</InputGroupText>
			<Input bind:value={new_user_ou_id} />
			<InputGroupText>{$_('setting.orgchart.emp_name')}</InputGroupText>
			<Input bind:value={new_user_name} />
			<InputGroupText>{$_('setting.orgchart.emp_email')}</InputGroupText>
			<Input bind:value={new_user_email} />
			<InputGroupText>{$_('setting.orgchart.emp_pwd')}</InputGroupText>
			<Input bind:value={default_user_password} type="password" required={true} />
			<Button
				color="primary"
				on:click={async (e) => {
					e.preventDefault();
					let res = await api.post(
						'orgchart/add',
						{
							password: admin_password,
							content: `${new_user_ou_id},${new_user_name},${new_user_email},,,,`,
							default_user_password: default_user_password
						},
						user.sessionToken
					);
					if (res.error) {
						setFadeMessage(res.message, 'warning');
					} else {
						setFadeMessage('Success, refresh orgchart please', 'success');
					}
				}}
			>
				{$_('setting.orgchart.btn.emp_create')}
			</Button>
		</InputGroup>
		<InputGroup class="mt-2">
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
							default_user_password: 'not required'
						},
						user.sessionToken
					);
					if (res.error) {
						setFadeMessage(res.message, 'warning');
					} else {
						setFadeMessage('Success, refresh orgchart please', 'success');
					}
				}}
			>
				{$_('setting.orgchart.btn.emp_delete')}l
			</Button>
		</InputGroup>
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
							default_user_password: 'not required'
						},
						user.sessionToken
					);
					if (res.error) {
						setFadeMessage(res.message, 'warning');
					} else {
						setFadeMessage('Success, refresh orgchart please', 'success');
					}
				}}
			>
				{$_('setting.orgchart.btn.ou_cretae')}
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
							default_user_password: 'not required'
						},
						user.sessionToken
					);
					if (res.error) {
						setFadeMessage(res.message, 'warning');
					} else {
						setFadeMessage('Success, refresh orgchart please', 'success');
					}
				}}
			>
				{$_('setting.orgchart.btn.ou_delete')}
			</Button>
		</InputGroup>
		<InputGroup class="mt-5">
			<InputGroupText>{$_('setting.orgchart.exportcsv')}</InputGroupText>
			<Button
				size="sm"
				color="primary"
				on:click={async (e) => {
					e.preventDefault();
					let res = await api.post(
						'orgchart/export',
						{ password: admin_password },
						user.sessionToken
					);
					if (res.error) {
						setFadeMessage(res.message, 'warning');
					} else {
						await saveResult(res);
					}
				}}
			>
				{$_('setting.orgchart.btn.export')}
			</Button>
		</InputGroup>
		<InputGroup class="mt-5">
			<InputGroupText>{$_('setting.orgchart.importcsv')}</InputGroupText>
			<input class="form-control" name="file" type="file" bind:files />
			<Button size="sm" on:click={uploadOrgChart} color="primary"
				>{$_('setting.orgchart.btn.import')}</Button
			>
		</InputGroup>
		<OrgChartCsvFormat />
		{#if errMsg}
			{errMsg}
		{/if}
	</Container>
</form>
