<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import * as api from '$lib/api';
	import { session } from '$app/stores';
	import { getNotificationsContext } from 'svelte-notifications';
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
						setFadeMessage('Sucess', 'success');
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
</script>

<form class="new" enctype="multipart/form-data">
	<Container class="text-nowrap">
		<div class="mt-5" />
		<InputGroup>
			<InputGroupText>Admin Password:</InputGroupText>
			<Input bind:value={admin_password} type="password" required={true} />
			<InputGroupText>Default User Password:</InputGroupText>
			<Input bind:value={default_user_password} type="password" required={true} />
		</InputGroup>
		<InputGroup>
			<InputGroupText>Orgchart CSV file</InputGroupText>
			<input class="form-control" name="file" type="file" bind:files />
			<Button size="sm" on:click={uploadOrgChart} color="primary">Import</Button>
		</InputGroup>
		<InputGroup>
			<InputGroupText>Export to CSV file</InputGroupText>
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
						if (fileSaver === null) {
							fileSaver = await import('file-saver');
						}
						res = res.map((x) => x + '\n');
						var blob = new Blob(res, { type: 'text/csv;charset=utf-8' });
						fileSaver.saveAs(blob, 'orgchart.csv');
						//res.map((x) => console.log(x));
					}
				}}
			>
				Export
			</Button>
		</InputGroup>
		<InputGroup>
			<Input type="textarea" bind:value={content} />
			<Button
				color="primary"
				on:click={async (e) => {
					e.preventDefault();
					let res = await api.post(
						'orgchart/add',
						{
							password: admin_password,
							content: content,
							default_user_password: default_user_password
						},
						user.sessionToken
					);
					if (res.error) errMsg = res.message;
				}}
			>
				Update
			</Button>
		</InputGroup>
		{#if errMsg}
			{errMsg}
		{/if}
		<div>
			<pre>
	Update orgchart entry line by line, in CSV format
	Examples:
	Next line will insert or update OU AAAAA
	<code>AAAAA,Organization Unit Name,,,,,</code>

	Next line will insert or update User abcd@email.com
	<code>AAAAA,MyNameIsABCD,abcd@email.com,pos1:pos2,,,,</code>

	Next line will delete whole OU (and OU under it, root can not be deleted)
	<code>D,AAAAA</code>

	Next line will delete  a user
	<code>D,abcd@email.com</code>

</pre>
		</div>
	</Container>
</form>
