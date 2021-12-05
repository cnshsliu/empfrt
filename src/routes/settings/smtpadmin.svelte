<script lang="ts">
	import { Container, Row, Col, Button, InputGroup, InputGroupText, Input } from 'sveltestrap';
	import type { User, Org, SmtpDef } from '$lib/types';
	let password_for_admin = '';
	let smtp: SmtpDef = {
		host: 'smtp.myorg.com',
		port: 465,
		secure: true,
		username: '',
		password: '',
		from: ''
	};
	export let myorg: Org;
	export let user: User;
	export let setFadeMessage;

	if (myorg.smtp) {
		smtp = myorg.smtp;
	}
	import * as api from '$lib/api';
	const saveSmtpSetting = async () => {
		let ret = (await api.post(
			'tnt/set/smtp',
			{
				password: password_for_admin,
				smtp: smtp
			},
			user.sessionToken
		)) as unknown as SmtpDef;
		if (ret.error) {
			setFadeMessage(ret.message);
		} else {
			setFadeMessage("Orgnazation's SMTP setting has been saved");
		}
	};
</script>

<Container class="mt-3">
	<form>
		{#if user.group !== 'ADMIN'}
			<div class="w-100 text-center fs-3">Email setting is managed by org admin</div>
		{:else}
			<Row cols="1">
				<Col class="d-flex justify-content-end mt-2">
					<InputGroup class="mb-1">
						<InputGroupText>Admin Password:</InputGroupText>
						<Input
							type="password"
							bind:value={password_for_admin}
							placeholder="Confirm with your password"
						/>
					</InputGroup>
				</Col>
				<Col class="d-flex justify-content-end mt-2">
					<InputGroupText>SMTP Server:</InputGroupText>
					<InputGroup class="mb-1">
						<Input
							id="smtp_host"
							type="text"
							bind:value={smtp.host}
							placeholder="SMTP server address"
						/>
					</InputGroup>
				</Col>
				<Col class="d-flex justify-content-end mt-2">
					<InputGroupText>SMTP Server Port:</InputGroupText>
					<InputGroup class="mb-1">
						<Input
							id="smtp_port"
							type="number"
							bind:value={smtp.port}
							placeholder="SMTP server port"
						/>
					</InputGroup>
				</Col>
				<Col class="d-flex justify-content-end mt-2">
					<InputGroupText>Secure Connection:</InputGroupText>
					<InputGroup class="mb-1">
						<Input id="smtp_secure" type="checkbox" checked={smtp.secure} />
					</InputGroup>
				</Col>
				<Col class="d-flex justify-content-end mt-2">
					<InputGroupText>SMTP user name:</InputGroupText>
					<InputGroup class="mb-1">
						<Input
							id="smtp_username"
							type="text"
							bind:value={smtp.username}
							placeholder="SMTP user name"
						/>
					</InputGroup>
				</Col>
				<Col class="d-flex justify-content-end mt-2">
					<InputGroupText>SMTP user password:</InputGroupText>
					<InputGroup class="mb-1">
						<Input
							id="smtp_password"
							type="password"
							bind:value={smtp.password}
							placeholder="SMTP user password"
						/>
					</InputGroup>
				</Col>
				<Col class="d-flex justify-content-end mt-2">
					<InputGroupText>Sent from:</InputGroupText>
					<InputGroup class="mb-1">
						<Input
							id="smtp_from"
							type="text"
							bind:value={smtp.from}
							placeholder="The sender's display name"
						/>
					</InputGroup>
				</Col>
				<Col class="d-flex justify-content-end mt-2">
					<Button
						on:click={async (e) => {
							e.preventDefault();
							await saveSmtpSetting();
						}}
					>
						Setting
					</Button>
				</Col>
			</Row>
		{/if}
	</form>
</Container>
