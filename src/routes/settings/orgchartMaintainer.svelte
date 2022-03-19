<script lang="ts">
	import { API_SERVER } from '$lib/Env';
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
		res = res.map((x) => x + '\n');
		var blob = new Blob(res, { type: 'text/csv;charset=utf-8' });
		fileSaver.saveAs(blob, 'orgchart.csv');
		//res.map((x) => console.log(x));
	}
</script>

<form class="new" enctype="multipart/form-data">
	<Container class="text-nowrap">
		<div class="mt-5" />
		<InputGroup>
			<InputGroupText>Admin password is required:</InputGroupText>
			<Input bind:value={admin_password} type="password" required={true} />
		</InputGroup>
		<InputGroup class="mt-2">
			<InputGroupText>OU_ID:</InputGroupText>
			<Input bind:value={new_user_ou_id} />
			<InputGroupText>Name:</InputGroupText>
			<Input bind:value={new_user_name} />
			<InputGroupText>Email:</InputGroupText>
			<Input bind:value={new_user_email} />
			<InputGroupText>Password:</InputGroupText>
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
				New or update User
			</Button>
		</InputGroup>
		<InputGroup class="mt-2">
			<InputGroupText>Email:</InputGroupText>
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
				Delete User by email
			</Button>
		</InputGroup>
		<InputGroup class="mt-2">
			<InputGroupText>OU_ID:</InputGroupText>
			<Input bind:value={new_ou_id} />
			<InputGroupText>Name:</InputGroupText>
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
				New or update OU
			</Button>
		</InputGroup>
		<InputGroup class="mt-2">
			<InputGroupText>OU_ID:</InputGroupText>
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
				Delete OU by ID
			</Button>
		</InputGroup>
		<InputGroup class="mt-5">
			<InputGroupText>Export the whole OrgChart to CSV file</InputGroupText>
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
				Export
			</Button>
		</InputGroup>
		<InputGroup class="mt-5">
			<InputGroupText>Import from Orgchart CSV file</InputGroupText>
			<input class="form-control" name="file" type="file" bind:files />
			<Button size="sm" on:click={uploadOrgChart} color="primary">Import</Button>
		</InputGroup>
		<OrgChartCsvFormat />
		{#if errMsg}
			{errMsg}
		{/if}
	</Container>
</form>
