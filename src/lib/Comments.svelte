<script lang="ts">
	import { _, locale } from '$lib/i18n';
	import Avatar from '$lib/display/Avatar.svelte';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	import { session } from '$app/stores';
	import AniIcon from '$lib/AniIcon.svelte';
	import { Row, Col } from 'sveltestrap';
	import CommentInput from '$lib/input/CommentInput.svelte';
	export let TimeTool = null;
	export let comments = { count: 0, cmts: [] };
	let replyToCmtId;
	let user = $session.user;

	onMount(async () => {
		for (let i = 0; i < comments.cmts.length; i++) {
			comments.cmts[i].showChildren = true;
		}
	});
</script>

{#if comments && comments.count > 0}
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
					{#if (!cmt.children || (cmt.children && cmt.children.cmts && cmt.children.cmts.length === 0)) && cmt.who === user.email}
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
										comments.cmts.splice(cmtIndex, 1);
										comments.count--;
										comments = comments;
									}
								}}
							>
								<AniIcon icon="trash" ani="aniShake" />
							</a>
						</Col>
					{/if}
				</Row>
				<Row>
					<Col class="fs-6">
						{TimeTool ? TimeTool.fromNow(cmt.createdAt) : ''}
						{#if cmt.todoTitle}
							{$_('comment.fortodo')}
							<a href={`/work/@${cmt.context.todoid}`} role="button">
								{cmt.todoTitle} ({cmt.todoDoerCN})
							</a>
						{/if}
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
			<div class="ms-3 border-start border-primary comment-input row row-cols-1">
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
							}
						}}
					/>
				</div>
			</div>
		{/if}
		{#if cmt.children && cmt.showChildren}
			<div class="ms-3 border-start border-primary comment-child row row-cols-1">
				<div class="col">
					<svelte:self bind:comments={cmt.children} bind:TimeTool />
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
