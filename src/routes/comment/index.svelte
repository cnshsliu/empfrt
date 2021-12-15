<script context="module" lang="ts">
	let TimeTool = null;
	export async function load({ page, fetch, session }) {
		TimeTool = (await import('$lib/TimeTool')).default;
		return {
			props: {
				user: session.user
			}
		};
	}
</script>

<script type="ts">
	import { onMount } from 'svelte';
	import * as api from '$lib/api';
	import Parser from '$lib/parser';
	import CommentEntry from '$lib/CommentEntry.svelte';
	import { goto } from '$app/navigation';
	import { Container, Row, Col, InputGroup, InputGroupText, Input, Button } from 'sveltestrap';
	import type { User, oneArgFunc } from '$lib/types';
	import { getNotificationsContext } from 'svelte-notifications';
	const { addNotification } = getNotificationsContext();
	export let user: User;

	let comments: any[] = [];
	onMount(async () => {
		let ret = (await api.post('comment/list', {}, user.sessionToken)) as unknown as any[] | any;
		if (ret.error) {
			console.log(ret.message);
			//eslint-disable-next-line
			(addNotification as oneArgFunc)({
				text: ret.message,
				position: 'bottom-center',
				type: 'warning',
				removeAfter: 4000
			});
		} else {
			comments = ret;
		}
	});

	let deleteBeforeDays = 7;
	const deleteMessages = async function () {
		let ret = (await api.post(
			'comment/deletebeforedays',
			{ beforeDays: deleteBeforeDays },
			user.sessionToken
		)) as unknown as any[] | any;
	};

	const gotoWork = async function (comment) {
		goto(`/work/@${comment.workid}`);
	};
	let commentIsBase64 = false;
</script>

<Container class="mt-5">
	{#each comments as comment}
		<Row class="mb-2">
			<Col>
				<div>{TimeTool.fromNow(comment.createdAt)}</div>
				<div class="ms-3">
					<CommentEntry bind:comment={comment.content} bind:base64={commentIsBase64} />
					-- {comment.cn}
					<span
						class="usertag"
						on:click={(e) => {
							e.preventDefault();
							gotoWork(comment);
						}}
					>
						Goto work
					</span>
				</div>
			</Col>
		</Row>
	{/each}
	<Row class="mt-5">
		<Col>
			<form>
				<InputGroup>
					<InputGroupText>Delete messages</InputGroupText>
					<Input type="select" bind:value={deleteBeforeDays}>
						<option value="1">1 day ago</option>
						<option value="7">1 week ago</option>
						<option value="30">1 month ago</option>
						<option value="90">3 months ago</option>
						<option value="180">half year ago</option>
						<option value="365">a year ago</option>
					</Input>
					<Button
						on:click={async (e) => {
							e.preventDefault();
							await deleteMessages();
						}}>Delete</Button
					>
				</InputGroup>
			</form>
		</Col>
	</Row>
</Container>
