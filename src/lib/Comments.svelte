<script lang="ts">
	import Avatar from '$lib/display/Avatar.svelte';
	import * as api from '$lib/api';
	import { fade, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { session } from '$app/stores';
	import AniIcon from '$lib/AniIcon.svelte';
	import { Row, Col, Button, InputGroup, Input } from 'sveltestrap';
	import CommentInput from '$lib/input/CommentInput.svelte';
	export let TimeTool = null;
	export let comments = { count: 0, cmts: [] };
	export let deletableCommentIds = new Set();
	export let timeoutHash = {};
	export let deleteNewCommentTimeout;
	let replyToCmtId;

	onMount(async () => {
		for (let i = 0; i < comments.cmts.length; i++) {
			comments.cmts[i].showChildren = true;
		}
	});
</script>

{#if comments}
	{#each comments.cmts as cmt, cmtIndex}
		<Row id={'tcmt_' + cmt._id}>
			<Col class="d-flex col-auto">
				<Avatar uid={cmt.who} uname={cmt.whoCN} style={'avatar40-round5'} />
			</Col>
			<Col>
				<Row>
					<Col class="col-auto">
						<span class="fw-bold me-2">
							{cmt.whoCN} @{cmt.who.substring(0, cmt.who.indexOf('@'))}
						</span>
						<span>
							<a
								href={'#'}
								class="kfk-link"
								on:click|preventDefault={(e) => {
									if (replyToCmtId === cmt._id) {
										replyToCmtId = '';
									} else {
										replyToCmtId = cmt._id;
									}
								}}
							>
								{#if replyToCmtId === cmt._id}
									<AniIcon icon="x" ani="aniShake" />
								{:else}
									<AniIcon icon="reply-fill" ani="aniShake" />
								{/if}
							</a>
						</span>
						{#if cmt.children && cmt.children.cmts && cmt.children.cmts.length}
							<span class="ms-3">
								<a
									class="kfk-link"
									href={'#'}
									on:click|preventDefault={(e) => {
										cmt.showChildren = !cmt.showChildren;
									}}
								>
									{#if cmt.showChildren}
										<AniIcon icon="caret-up" ani="aniShake" />
									{:else}
										<AniIcon icon="caret-right-fill" ani="aniShake" />
									{/if}
								</a>
							</span>
						{/if}
					</Col>
					{#if deletableCommentIds.has(cmt._id)}
						<Col class="col-auto">
							<a
								href={'#'}
								class="kfk-link"
								on:click={async (e) => {
									e.preventDefault();
									let res = await api.post(
										'comment/delete',
										{ commentid: cmt._id },
										$session.user.sessionToken
									);
									if (res.error) {
										console.log(res.message);
									} else {
										comments = res.comments;
									}
								}}
							>
								<AniIcon icon="trash" ani="aniShake" />
							</a>
							{(timeoutHash[cmt._id] >= 10 ? '' : '0') + timeoutHash[cmt._id]}
						</Col>
					{/if}
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
			<div
				class="ms-3 border-start border-primary comment-input row row-cols-1"
				transition:slide={{ delay: 250, duration: 300, easing: quintOut }}
			>
				<div class="col px-5 pb-2">
					<CommentInput
						bind:value={cmt.reply}
						cmtid={cmt._id}
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
							if (res.error) {
								console.log(res.message);
							} else {
								cmt.children = res.comments;
								for (let i = 0; i < cmt.children.cmts.length; i++) {
									cmt.children.cmts[i].showChildren = true;
								}
								cmt.reply = '';
								let thisId = res.thisComment._id;
								deletableCommentIds.add(thisId);
								let timeout = deleteNewCommentTimeout;
								timeoutHash[thisId] = timeout;
								let timeoutInterval = setInterval(() => {
									if (timeout === 0) {
										deletableCommentIds.delete(thisId);
										deletableCommentIds = deletableCommentIds;
										clearInterval(timeoutInterval);
										delete timeoutHash[thisId];
										timeoutHash = timeoutHash;
									} else {
										timeout--;
										timeoutHash[thisId] = timeout;
										timeoutHash = timeoutHash;
									}
								}, 1000);
							}
						}}
					/>
				</div>
			</div>
		{/if}
		{#if cmt.children && cmt.showChildren}
			<div
				class="ms-3 border-start border-primary comment-child row row-cols-1"
				transition:fade={{ delay: 250, duration: 300 }}
			>
				<div class="col">
					<svelte:self
						bind:comments={cmt.children}
						bind:deletableCommentIds
						bind:timeoutHash
						bind:TimeTool
						bind:deleteNewCommentTimeout
					/>
				</div>
			</div>
		{/if}
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
