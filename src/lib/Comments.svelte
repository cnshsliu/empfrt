<script lang="ts">
	import Avatar from '$lib/display/Avatar.svelte';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	import { session } from '$app/stores';
	import { Row, Col, Button, InputGroup, Input } from 'sveltestrap';
	import CommentInput from '$lib/input/CommentInput.svelte';
	export let TimeTool = null;
	export let comments = { count: 0, cmts: [] };
	let replyToCmtId;
</script>

{#if comments}
	{#each comments.cmts as cmt, cmtIndex}
		<Row id={'tcmt_' + cmt._id}>
			<Col class="d-flex col-auto">
				<Avatar uid={cmt.who} uname={cmt.whoCN} style={'avatar40-round5'} />
			</Col>
			<Col>
				<Row>
					<Col>
						<span class="fw-bold me-2">
							{cmt.whoCN} @{cmt.who.substring(0, cmt.who.indexOf('@'))}
						</span>
						<a
							href={'#'}
							on:click|preventDefault={(e) => {
								replyToCmtId = cmt._id;
							}}
						>
							<i class="bi bi-reply" />
						</a>
					</Col>
				</Row>
				<Row>
					<Col class="fs-6">
						{TimeTool ? TimeTool.fromNow(cmt.createdAt) : ''}
					</Col>
				</Row>
			</Col>
		</Row>
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
		</Row>
		{#if replyToCmtId === cmt._id}
			<Row cols="1" class="ms-3 border-start border-primary">
				<Col class="px-5">
					<CommentInput
						bind:value={cmt.reply}
						placeholder={'Your reply...'}
						on:comment={async (e) => {
							e.preventDefault();
							replyToCmtId = '';
							let res = await api.post(
								'comment/add',
								{
									cmtid: cmt._id,
									content: e.detail
								},
								$session.user.sessionToken
							);
							cmt.children = res;
							cmt.reply = '';
						}}
					/>
				</Col>
			</Row>
		{/if}
		<Row cols="1" class="ms-3 border-start border-primary">
			<Col>
				<svelte:self bind:comments={cmt.children} />
			</Col>
		</Row>
		{#if comments.count > comments.cmts.length && cmtIndex === comments.cmts.length - 1}
			<Row class="ms-1">
				<Col class="d-flex col-auto">
					<a
						href={'#'}
						class="usertag text-decoration-none"
						on:click|preventDefault={async (e) => {
							let res = await api.post(
								'comment/loadmorepeers',
								{
									cmtid: cmt._id,
									currentlength: comments.cmts.length
								},
								$session.user.sessionToken
							);
							comments.count = res.count;
							comments.cmts = [...comments.cmts, ...res.cmts];
						}}
					>
						<i class="bi bi-three-dots" />
					</a>
				</Col>
				<Col>&nbsp;</Col>
			</Row>
		{/if}
	{/each}
{/if}
