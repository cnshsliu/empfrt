<script type="ts">
	import * as api from '$lib/api';
	import { InputGroup, Button, Input, Row, Col, Badge, Icon } from 'sveltestrap';
	import { tick, createEventDispatcher } from 'svelte';
	import { session } from '$app/stores';
	const dispatch = createEventDispatcher();
	export let value = '';
	export let placeholder = '';
	export let cmtid = '';

	let checkingUserTimer = null;
	let checkingUserResult = '';
	let user = $session.user;
	let theCommentInputTextArea;

	export function focus() {
		theCommentInputTextArea && theCommentInputTextArea.focus();
	}

	function valueChagned() {
		dispatch('input', value);
		value = '';
	}
	const inputing = async (e) => {
		await tick();
		if (checkingUserTimer) clearTimeout(checkingUserTimer);
		let tmp = e.target.value;
		let m = tmp.match(/@\w+/g);
		if (m) {
			m = [...new Set(m)];
			checkingUserTimer = setTimeout(async () => {
				checkingUserResult = (await api.post(
					'check/coworkers',
					{ uids: m },
					user.sessionToken
				)) as unknown as string;
			}, 1500);
		} else {
			checkingUserResult = '';
		}
	};
</script>

<InputGroup>
	<Col class="border border-1 border-primary">
		<Row>
			<Col>
				<textarea
					bind:value
					id={'cmtinput_for_' + cmtid}
					{placeholder}
					on:input={inputing}
					class="border-0 form-control"
					bind:this={theCommentInputTextArea}
				/>
			</Col>
		</Row>
		{#if checkingUserResult}
			<Row>
				<Col>
					{@html checkingUserResult}
				</Col>
			</Row>
		{/if}
	</Col>
	<Button
		on:click={async (e) => {
			e.preventDefault();
			if (value.trim().length === 0) return;
			value = value.trim();
			checkingUserResult = '';
			dispatch('comment', value);
		}}
	>
		<i class="bi bi-chat-left-dots" />
	</Button>
</InputGroup>
