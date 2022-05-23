<svelte:options accessors />

<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import { session } from '$app/stores';
	import * as api from '$lib/api';
	import { tick, onMount } from 'svelte';
	export let tplid;
	export let style;
	let cover = true;
	let tenant = $session.user.tenant._id;
	let imgUrl = `${API_SERVER}/template/cover/${tenant}/${tplid}?token=${$session.user.sessionToken}`;
	onMount(async () => {});
	export const refresh = () => {
		console.log('Refresh cover');
		cover = true;
		imgUrl = imgUrl + '?t=' + new Date().getTime();
	};
</script>

{#if cover}
	<img
		src={imgUrl}
		class={style}
		alt="cover"
		on:error={(e) => {
			cover = false;
		}} />
{:else}
	<div class="kfk-cover-virtual text-center">
		{(() => {
			//如有中文，取出中文
			try {
				var reg = /[\u4e00-\u9fa5]/g;
				let m = tplid.match(reg);
				if (m) return m.join('');
				else return tplid;
			} catch (err) {
				return tplid;
			}
		})()}
	</div>
{/if}
