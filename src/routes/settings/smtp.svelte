<script lang="ts">
	import { Container, Row, Col, Button, InputGroup, InputGroupText, Input } from 'sveltestrap';
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { User, Org, SmtpDef } from '$lib/types';
	import { onMount } from 'svelte';
	import { setFadeMessage } from '$lib/Notifier';

	let user = $session.user;
	let password_for_admin = '';
	let smtp: SmtpDef = {
		host: 'smtp.myorg.com',
		port: 465,
		secure: true,
		username: '',
		password: '',
		from: ''
	};

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
			if (ret.error && ret.error === 'NO_BRUTE') {
				setFadeMessage($_('error.NO_BRUTE'), 'warning');
			} else {
				setFadeMessage(ret.message, 'warning');
			}
		} else {
			setFadeMessage("Orgnazation's SMTP setting has been saved", 'success');
		}
	};

	onMount(async () => {
		smtp = await api.post('tnt/get/smtp', {}, user.sessionToken);
		if (smtp.error && smtp.error === 'NO_BRUTE') {
			setFadeMessage($_('error.NO_BRUTE'), 'warning');
		}
		console.log(smtp);
	});
</script>

<Container class="mt-3">
	<Row>
		<nav aria-label="breadcrumb">
			<ol class="breadcrumb">
				<li class="breadcrumb-item">
					<a
						href={'#'}
						on:click={() => {
							goto('/settings');
						}}
					>
						{$_('navmenu.settings')}
					</a>
				</li>
				<li class="breadcrumb-item active" aria-current="page">{$_('setting.smtp.nav')}</li>
			</ol>
		</nav>
	</Row>
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
