<script>
	import { onMount } from 'svelte';
	import { Input } from 'sveltestrap';
	import { filterStorage } from '$lib/empstores';

	let locale_value = 'en';

	function switchLocale(event) {
		event.preventDefault();
		$filterStorage.locale = event.target.value;

		//dispatch('locale-changed', event.target.value);
	}
	onMount(async () => {
		let tmp = $filterStorage.locale;
		if (tmp !== undefined && tmp !== null) {
			locale_value = tmp;
		}
	});
</script>

<Input type="select" bind:value={locale_value} on:change={switchLocale}>
	<option value="en">English</option>
	<option value="zh-CN">中文</option>
</Input>
