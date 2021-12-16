<script lang="ts">
	import Parser from '$lib/parser';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	export let comment;
	export let base64 = true;
	let commentSplitted = [];

	const splitComment = function (str) {
		//确保@之前有空格
		str = str.replace(/([\S])@/g, '$1 @');
		//按空字符分割
		commentSplitted = str.split(/\s/);
		console.log(commentSplitted);
	};

	if (base64) splitComment(Parser.base64ToCode(comment));
	else splitComment(comment);
	const gotoUser = function (uid) {
		uid = uid.substring(1);
		//去掉uid后面的标点符号
		uid = uid.replace(/\W+$/, '');
		$session.gotoUser = uid;
		goto('/work');
	};
</script>

<div>
	{#each commentSplitted as seg}
		{#if seg.startsWith('@')}
			<a
				class="usertag text-decoration-none"
				on:click={(e) => {
					e.preventDefault();
					gotoUser(seg);
				}}
			>
				{seg + ' '}
			</a>
		{:else}
			{seg + ' '}
		{/if}
	{/each}
</div>
