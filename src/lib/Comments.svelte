<script context="module" lang="ts">
</script>

<script lang="ts">
	import Avatar from '$lib/display/Avatar.svelte';
	import TimeTool from '$lib/TimeTool';
	import { Row, Col, Button, InputGroup, Input } from 'sveltestrap';
	export let comments;
	let replyToCmtId;
</script>

<pre><code>
			{JSON.stringify(comments, null, 2)}
</code></pre>
{#each comments as cmt, cmtIndex}
	<Row>
		<Col class="d-flex col-auto">
			<Avatar uid={cmt.who} uname={cmt.whoCN} style={'avatar40'} />
		</Col>
		<Col>
			{cmt.whoCN} @{cmt.who.substring(0, cmt.who.indexOf('@'))}
			{TimeTool ? TimeTool.fromNow(cmt.createdAt) : ''}
			<br />
			<a
				href={'#'}
				on:click|preventDefault={(e) => {
					replyToCmtId = cmt._id;
				}}>Reply</a
			>
		</Col>
	</Row>
	{#if replyToCmtId === cmt._id}
		<Row>
			<Col class="ms-5 ps-3">
				<InputGroup>
					<Input type="textarea" bind:value={cmt.reply} />
					<Button
						on:click={(e) => {
							e.preventDefault();
						}}
					>
						Reply
					</Button>
				</InputGroup>
			</Col>
		</Row>
	{/if}
	<Row>
		<Col class="ms-5 ps-3">
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
		</Col>
	</Row>
{/each}
