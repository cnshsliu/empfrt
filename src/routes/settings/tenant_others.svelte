<script type="ts">
	import {
		Button,
		Container,
		Row,
		Col,
		InputGroup,
		InputGroupText,
		Label,
		Input,
		Card,
		CardBody,
		CardFooter,
		CardHeader,
		CardSubtitle,
		CardText,
		CardTitle,
	} from 'sveltestrap';
	import TimeZone from '$lib/Timezone';
	import TimeTool from '$lib/TimeTool';
	import { session } from '$app/stores';
	import { setFadeMessage } from '$lib/Notifier';
	import { onMount } from 'svelte';
	import TenantMenu from './tenantmenu.svelte';
	import { _ } from '$lib/i18n';
	import type { User, EmpResponse } from '$lib/types';
	import { post } from '$lib/utils';
	import * as api from '$lib/api';

	let user: User = $session.user;
	let myorg: any = {
		orgname: '',
		orgtheme: '',
		orgtimezone: '',
		orgleveltags: '',
		owner: '',
	};

	let orgname = '';

	async function refreshMyOrg() {
		myorg = await api.post('tnt/my/org', {}, user.sessionToken);
		console.log(myorg);
	}

	onMount(async () => {
		try {
			await refreshMyOrg();
		} catch (e) {}
	});
</script>

<form>
	<Container class="mt-3 mb-3">
		<Row>
			<TenantMenu />
		</Row>
		<div class="w-100 text-center fs-3">{orgname}</div>
		<div class="w-100 text-center fs-6">
			{$_('setting.tenant.administrator')}: {myorg.owner === user.email ? 'Me' : myorg.owner}
		</div>
		<div class="w-100 text-center fs-6">
			{$_('setting.tenant.myrole')}: {user.group}
		</div>
		{#if user.group === 'ADMIN'}
			<form>
				<Card class="mt-3">
					<CardHeader><CardTitle>{$_('setting.tenant.myorg')}</CardTitle></CardHeader>
					<CardBody>
						<InputGroup class="mb-1">
							<input
								class="ms-3 form-check-input"
								type="checkbox"
								bind:checked={myorg.allowemptypbo}
								on:change={async (e) => {
									e.preventDefault();

									let ret = await api.post(
										'tnt/set/allowemptypbo',
										{ allow: myorg.allowemptypbo },
										user.sessionToken,
									);
									if (ret.error) {
										setFadeMessage(ret.message, 'warning');
									} else {
										if (ret.allowemptypbo) {
											setFadeMessage($_('setting.tenant.allowemptypbo_true'));
										} else {
											setFadeMessage($_('setting.tenant.allowemptypbo_false'));
										}
										console.log(ret.allowemptypbo);
									}
								}} />
							{$_('setting.tenant.allowemptypbo')}
						</InputGroup>
					</CardBody>
				</Card>
			</form>
		{:else}
			{myorg.allowemptypbo ? 'Allow Empty PBO' : 'Empty PBO not allowed'}
		{/if}
	</Container>
</form>
