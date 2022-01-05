<script lang="ts">
	import { _ } from '$lib/i18n';
	import { Button, FormGroup, Input, Label, InputGroup, InputGroupText } from 'sveltestrap';
	import { session } from '$app/stores';
	import * as api from '$lib/api';
	import { goto } from '$app/navigation';
	export let work;
	export let iframeMode;
	let transferee = '';
	let valid_tansferee = false;
	let input_class = '';
	let check_transfee = false;
	let status = '';
	let msg = '';
	let check_timer = null;

	const checkTransfeee = async function () {
		status = 'checking';
		input_class = 'input_spinning';
		msg = '';
		if (check_timer) clearTimeout(check_timer);
		check_timer = setTimeout(async () => {
			let ret = await api.post('check/coworker', { whom: transferee }, $session.user.sessionToken);
			if (ret) {
				if (ret.error) {
					status = 'wrong';
					input_class = 'input_wrong';
					msg = ret.message;
				} else {
					status = 'good';
					input_class = 'input_good';
					msg = `${ret.username}(${ret.email})`;
				}
			} else {
				status = 'wrong';
				input_class = 'input_wrong';
				msg = `${transferee} does not exist`;
			}
			check_timer = null;
		}, 1000);
	};
</script>

{#if work.transferable}
	{$_('todo.transferable')}
	<InputGroup>
		<InputGroupText>
			Transfer to
			{$_('todo.transferto')}
		</InputGroupText>
		<Input
			type="text"
			placeholder="whom? "
			bind:value={transferee}
			on:input={checkTransfeee}
			class={input_class}
		/>
		<Button
			disabled={status !== 'good'}
			on:click={async (e) => {
				e.preventDefault();
				await api.post(
					'transfer/work',
					{
						todoid: work.todoid,
						whom: transferee
					},
					$session.user.sessionToken
				);
				goto(iframeMode ? '/work?iframe' : '/work');
			}}
		>
			{$_('todo.transfer')}
		</Button>
	</InputGroup>
	{msg}
{:else}
	{$_('todo.notTransferable')}
{/if}
