<script context="module" lang="ts">
</script>

<script type="ts">
	import { onMount, tick } from 'svelte';
	import * as api from '$lib/api';
	import Avatar from '$lib/avatar.svelte';
	import Parser from '$lib/parser';
	import CommentEntry from '$lib/CommentEntry.svelte';
	import { goto } from '$app/navigation';
	import {
		Container,
		Row,
		Col,
		Icon,
		InputGroup,
		InputGroupText,
		Input,
		Button
	} from 'sveltestrap';
	import type { User, oneArgFunc } from '$lib/types';
	import { getNotificationsContext } from 'svelte-notifications';
	import TimeTool from '$lib/TimeTool';
	const { addNotification } = getNotificationsContext();
	export let user: User;

	let comments: any[] = [];
	onMount(async () => {
		let ret = (await api.post('comment/list', {}, user.sessionToken)) as unknown as any[] | any;
		if (ret.error) {
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
		await tick();
		await goto(`/work/@${comment.todoid}`);
	};
	const gotoProcess = async function (comment) {
		await tick();
		await goto(`/workflow/@${comment.wfid}`);
	};
	let commentIsBase64 = false;
</script>

<Container>
	<Row class="my-3">
		<Col class="d-flex justify-content-center fs-3">
			<Icon name="chat-square-dots" />
		</Col>
	</Row>
	<Row class="my-3">
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
	{#each comments as comment}
		<Row class="">
			<Col>
				<Row>
					<Col>
						{TimeTool.fromNow(comment.createdAt)}
					</Col>
				</Row>
				<Row>
					<Col class="ms-3 border-start border-3 border-primary pb-3">
						<Row>
							<Col class="col-auto">
								<Avatar avatar={comment.avatar} name={comment.cn} />
							</Col>
							<Col class="">
								<Row><Col class="col-auto">{comment.content}</Col></Row>
								<Row>
									<Col class="col-auto">
										<a
											class="nav-link m-0 p-0"
											href={'#'}
											on:click={async (e) => {
												e.preventDefault();
												await gotoWork(comment);
											}}
										>
											Work
										</a>
									</Col>
									<Col class="col-auto">
										<a
											class="nav-link m-0 p-0"
											href={'#'}
											on:click={async (e) => {
												e.preventDefault();
												await gotoProcess(comment);
											}}
										>
											Process
										</a>
									</Col>
								</Row>
							</Col>
						</Row>
					</Col>
				</Row>
			</Col>
		</Row>
	{/each}
</Container>
