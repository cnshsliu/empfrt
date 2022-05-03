<script lang="ts">
	import { Container, Row, Col, Button, InputGroup, InputGroupText, Input } from 'sveltestrap';
	import { _ } from '$lib/i18n';
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
	export let setFadeMessage: any;

	if (myorg.smtp) {
		smtp = myorg.smtp;
		delete smtp._id;
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
			setFadeMessage(ret.message, 'warning');
		} else {
			setFadeMessage("Orgnazation's SMTP setting has been saved", 'success');
		}
	};
</script>

<Container class="mt-3">
	{#if user.group !== 'ADMIN'}
		<div class="w-100 text-center fs-3">Email setting is managed by org admin</div>
	{:else}
		<Row cols="1">
			<Col class="d-flex justify-content-end mt-2">
				<InputGroup class="mb-1">
					<InputGroupText>{$_('setting.adminpwd')}</InputGroupText>
					<Input
						type="password"
						bind:value={password_for_admin}
						placeholder={$_('setting.adminpwd_ph')}
					/>
				</InputGroup>
			</Col>
			<Col class="d-flex justify-content-end mt-2">
				<InputGroupText>{$_('setting.smtp.server')}</InputGroupText>
				<InputGroup class="mb-1">
					<Input id="smtp_host" type="text" bind:value={smtp.host} placeholder="" />
				</InputGroup>
			</Col>
			<Col class="d-flex justify-content-end mt-2">
				<InputGroupText>{$_('setting.smtp.port')}</InputGroupText>
				<InputGroup class="mb-1">
					<Input id="smtp_port" type="number" bind:value={smtp.port} placeholder="" />
				</InputGroup>
			</Col>
			<Col class="d-flex justify-content-end mt-2">
				<InputGroupText>{$_('setting.smtp.secure')}</InputGroupText>
				<InputGroup class="mb-1">
					<Input id="smtp_secure" type="checkbox" checked={smtp.secure} />
				</InputGroup>
			</Col>
			<Col class="d-flex justify-content-end mt-2">
				<InputGroupText>{$_('setting.smtp.user')}</InputGroupText>
				<InputGroup class="mb-1">
					<Input
						id="smtp_username"
						type="text"
						bind:value={smtp.username}
						placeholder={$_('setting.smtp.user_ph')}
					/>
				</InputGroup>
			</Col>
			<Col class="d-flex justify-content-end mt-2">
				<InputGroupText>{$_('setting.smtp.pwd')}</InputGroupText>
				<InputGroup class="mb-1">
					<Input
						id="smtp_password"
						type="password"
						bind:value={smtp.password}
						placeholder={$_('setting.smtp.pwd_ph')}
					/>
				</InputGroup>
			</Col>
			<Col class="d-flex justify-content-end mt-2">
				<InputGroupText>{$_('setting.smtp.from')}</InputGroupText>
				<InputGroup class="mb-1">
					<Input
						id="smtp_from"
						type="text"
						bind:value={smtp.from}
						placeholder={$_('setting.smtp.from_ph')}
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
					{$_('setting.set')}
				</Button>
			</Col>
		</Row>
	{/if}
</Container>
