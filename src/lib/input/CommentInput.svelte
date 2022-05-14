<script type="ts">
	import * as api from '$lib/api';
	import { _ } from '$lib/i18n';
	import Avatar from '$lib/display/Avatar.svelte';
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
					user.sessionToken,
				)) as unknown as string;
			}, 1500);
		} else {
			checkingUserResult = '';
		}
	};
</script>

<Row class="comment-input w-100 m-0 p-0">
	<Col class="col-auto">
		<Avatar email={user.email} uname={user.username} style={'avatar40-round5'} />
	</Col>
	<Col class="p-0 border border-1 rounded border-primary">
		<Row>
			<Col>
				<textarea
					bind:value
					id={'cmtinput_for_' + cmtid}
					{placeholder}
					on:input={inputing}
					class="border-0 form-control"
					bind:this={theCommentInputTextArea} />
			</Col>
		</Row>
		<Row>
			<Col class="ms-2">
				{#if checkingUserResult}
					{@html checkingUserResult}
				{:else}
					{$_('comment.markdown_enabled')}
				{/if}
			</Col>
			<Col class="col-auto">
				<Button
					color="primary"
					class="m-1"
					on:click={async (e) => {
						e.preventDefault();
						if (value.trim().length === 0) return;
						value = value.trim();
						checkingUserResult = '';
						dispatch('comment', value);
					}}>
					<i class="bi bi-chat-left-dots" />
				</Button>
			</Col>
		</Row>
	</Col>
</Row>
