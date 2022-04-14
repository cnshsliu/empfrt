<script lang="ts">
	import Avatar from '$lib/display/Avatar.svelte';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	import { session } from '$app/stores';
	import { Row, Col, Button, InputGroup, Input } from 'sveltestrap';
	let TimeTool = null;
	export let comments;
	let replyToCmtId;

	onMount(async () => {
		TimeTool = (await import('$lib/TimeTool')).default;
	});
</script>

{#each comments as cmt, cmtIndex}
	<Row>
		<Col class="d-flex col-auto">
			<Avatar uid={cmt.who} uname={cmt.whoCN} style={'avatar40'} />
		</Col>
		<Col>
			<span class="fw-bold">
				{cmt.whoCN} @{cmt.who.substring(0, cmt.who.indexOf('@'))}
				{TimeTool ? TimeTool.fromNow(cmt.createdAt) : ''}
			</span>
			<a
				href={'#'}
				on:click|preventDefault={(e) => {
					replyToCmtId = cmt._id;
				}}
			>
				Reply
			</a>
		</Col>
	</Row>
	{#if replyToCmtId === cmt._id}
		<Row>
			<Col class="ms-5 ps-3">
				<InputGroup>
					<Input type="textarea" bind:value={cmt.reply} />
					<Button
						on:click={async (e) => {
							e.preventDefault();
							if (cmt.reply.trim() === '') return;
							replyToCmtId = '';
							let res = await api.post(
								'comment/add',
								{
									cmtid: cmt._id,
									content: cmt.reply.trim()
								},
								$session.user.sessionToken
							);
							console.log(res);
							cmt.children = res;
						}}
					>
						Reply
					</Button>
				</InputGroup>
			</Col>
		</Row>
	{/if}
	<Row cols="1" class="ms-3 border-start border-primary">
		<Col>
			<div class="ms-5 mb-3">
				{#each cmt.splitted as seg}
					{#if seg.startsWith('@')}
						<a
							href={'#'}
							class="usertag text-decoration-none"
							on:click={(e) => {
								e.preventDefault();
								//gotoUser(seg);
							}}
						>
							{seg + ' '}
						</a>
					{:else if seg.startsWith('http')}
						{@html `<a href='${seg}' target='_blank'>${seg}</a> `}
					{:else}
						{seg + ' '}
					{/if}
				{/each}
			</div>
		</Col>
		<Col>
			<svelte:self bind:comments={cmt.children} />
		</Col>
	</Row>
{/each}
