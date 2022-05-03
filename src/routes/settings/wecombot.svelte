<script type="ts">
	import { Button, Container, Row, Col, InputGroup, InputGroupText, Input } from 'sveltestrap';
	import { _ } from '$lib/i18n';
	import type { User, EmpResponse } from '$lib/types';
	import { onMount } from 'svelte';
	import type { KFKError } from '$lib/types';
	import * as api from '$lib/api';
	export let user: User;
	export let setFadeMessage: any;

	let bots = [];
	const setWeComTodoBot = async (bot) => {
		bot.tplid = bot.tplid.trim();
		if (bot.tplid.length === 0) {
			return;
		} else {
			if (bot.key.length !== 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'.length) {
				bot.key = '';
				bots = bots;
			} else {
				await api.post('wecombot/todo/set', bot, user.sessionToken);
			}
		}
	};
	onMount(async () => {
		bots = (await api.post('wecombot/todo/get', {}, user.sessionToken)) as unknown as any;
		if ((bots as unknown as KFKError)['err']) {
			setFadeMessage((bots as unknown as KFKError)['message'], 'warning');
			bots = [];
		}
	});
</script>

<Container class="mt-3">
	{#each bots as bot}
		<Row cols="1" class="mt-1">
			<Col>
				<InputGroup class="mb-1">
					<InputGroupText>{$_('setting.wecombot.tplid')}</InputGroupText>
					<input class="form-control" type="text" placeholder="Template" bind:value={bot.tplid} />
					<InputGroupText>{$_('setting.wecombot.key')}</InputGroupText>
					<input class="form-control" type="text" placeholder="WecomBot Key" bind:value={bot.key} />
					<Button
						on:click={async (e) => {
							e.preventDefault();
							await setWeComTodoBot(bot);
						}}
					>
						{$_('setting.set')}
					</Button>
				</InputGroup>
			</Col>
		</Row>
	{/each}
	<Row>
		<Button
			on:click={async (e) => {
				e.preventDefault();
				bots.push({ tplid: '', key: '' });
				bots = bots;
			}}
		>
			Add One {bots.length}
		</Button>
	</Row>
</Container>
