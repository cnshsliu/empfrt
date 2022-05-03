<script context="module" lang="ts">
	export async function load({ url, params, fetch, session }) {}
</script>

<script lang="ts">
	import { _, locale } from '$lib/i18n';
	import Avatar from '$lib/display/Avatar.svelte';
	import { slide, fade, blur } from 'svelte/transition';
	import Transition from '$lib/Transition.svelte';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	import { session } from '$app/stores';
	import AniIcon from '$lib/AniIcon.svelte';
	import { Row, Col } from 'sveltestrap';
	import CommentInput from '$lib/input/CommentInput.svelte';
	export let TimeTool = null;
	export let comments;
	let replyToCmtId;
	let thumbnum_changed = 0;
	let user = $session.user;

	onMount(async () => {});
	const thumb = (e, cmt, direction) => {
		e.preventDefault();
		api
			.post('comment/thumb', { cmtid: cmt._id, thumb: direction }, user.sessionToken)
			.then((res) => {
				if (res.error) {
				} else {
					console.log(res);
					thumbnum_changed += 1;
					cmt.upnum = res.upnum;
					cmt.downnum = res.downnum;
				}
			});
	};
</script>

{#each comments as cmt, cmtIndex}
	<Transition effect={slide} enable={cmt.transition}>
		<Row id={'tcmt_' + cmt._id} class="mt-2 bt-2">
			<Col class="d-flex col-auto">
				<Avatar email={cmt.who} uname={cmt.whoCN} style={'avatar40-round5'} />
			</Col>
			<Col>
				<Row>
					<Col class="col-auto">
						<span class="fw-bold me-2">
							{cmt.whoCN} @{cmt.who.substring(0, cmt.who.indexOf('@'))}
						</span>
						ReplyTO:WHOM {cmt.objid}
						{#if cmt.children && cmt.children && cmt.children.length}
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
					{#if (!cmt.children || (cmt.children && cmt.children.length === 0)) && cmt.who === user.email}
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
										comments.splice(cmtIndex, 1);
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
					<Col class="fs-6 kfk-tag fw-bolder">
						{TimeTool ? TimeTool.fromNow(cmt.createdAt) : ''}
						{#if cmt.todoTitle}
							{$_('comment.fortodo')}
							<a href={`/work/${cmt.context.todoid}`} role="button">
								{cmt.todoTitle} ({cmt.todoDoerCN})
							</a>
						{/if}
					</Col>
				</Row>
			</Col>
		</Row>
		<Row cols="1" class="ms-3 border-start border-primary">
			<Col>
				<div class="ms-5">
					{@html cmt.mdcontent2}
				</div>
			</Col>
		</Row>
		<div class="ms-3 border-start border-primary comment-input row row-cols-1">
			<div class="col px-5 pb-2">
				<span class="kfk-tag">
					<a href={'#'} class="kfk-link" on:click={(e) => thumb(e, cmt, 'up')}>
						{#key thumbnum_changed}
							{#if cmt.upnum > 0}
								<AniIcon icon="hand-thumbs-up-fill" ani="aniShake" />
							{:else}
								<AniIcon icon="hand-thumbs-up" ani="aniShake" />
							{/if}
							{cmt.upnum}
						{/key}
					</a>
				</span>
				<span class="kfk-tag">
					<a
						href={'#'}
						role="button"
						class="kfk-link kfk-tag"
						on:click={(e) => thumb(e, cmt, 'down')}
					>
						{#if cmt.downnum > 0}
							<AniIcon icon="hand-thumbs-down-fill" ani="aniShake" />
						{:else}
							<AniIcon icon="hand-thumbs-down" ani="aniShake" />
						{/if}
						{#key thumbnum_changed}
							{cmt.downnum}
						{/key}
					</a>
				</span>
				<span class="kfk-tag ms-3">
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
							Reply <AniIcon icon="backspace-fill" ani="aniShake" />
						{:else}
							Reply <AniIcon icon="reply-fill" ani="aniShake" />
						{/if}
					</a>
				</span>
			</div>
			{#if replyToCmtId === cmt._id}
				<div class="col px-5 pb-2">
					<CommentInput
						bind:value={cmt.reply}
						cmtid={cmt._id}
						placeholder={'Your reply...'}
						on:close={async (e) => (replyToCmtId = '')}
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
								//cmt.children = res.comments;
								if (cmt.children === undefined) {
									cmt.children = [];
								}
								cmt.transition = false;
								cmt.children.unshift(res.thisComment);
								for (let i = 0; i < cmt.children.length; i++) {
									cmt.children[i].transition = i === 0;
								}
								cmt.children = cmt.children;
								cmt.showChildren = true;
								cmt.reply = '';
							}
						}}
					/>
				</div>
			{/if}
		</div>
		{#if cmt.showChildren && cmt.children.length > 0}
			<div class="ms-3 border-start border-primary comment-child row row-cols-1">
				<div class="col">
					<svelte:self bind:comments={cmt.children} bind:TimeTool />
				</div>
			</div>
		{/if}
	</Transition>
{/each}
