<script lang="ts">
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { filterStorage } from '$lib/empstores';
	export let comment;

	const gotoUser = function (uid) {
		uid = uid.substring(1);
		//去掉uid后面的标点符号
		uid = uid.replace(/\W+$/, '');
		$filterStorage.gotoUID = uid;
		goto('/work');
	};
</script>

<div>
	{#each comment as cmt}
		{#if Array.isArray(cmt.splitted)}
			{cmt.cn}:
			{#each cmt.splitted as seg}
				{#if seg.startsWith('@')}
					<a
						href={'#'}
						class="usertag text-decoration-none"
						on:click={(e) => {
							e.preventDefault();
							gotoUser(seg);
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
			<br />
		{/if}
	{/each}
</div>
