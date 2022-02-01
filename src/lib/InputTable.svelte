<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	import * as api from '$lib/api';
	import { Col, FormGroup, Label, Input } from 'sveltestrap';
	import { session } from '$app/stores';

	let user = $session.user;
	export let work: any;
	export let kvar: any;

	let cols = kvar.options.split(';');
</script>

<table>
	<tr>
		{#each cols as col, colIndex}
			<th>
				{col}
				{colIndex}
			</th>
		{/each}
	</tr>
	<tr>
		{#each cols as col, colIndex}
			<td><input /></td>
		{/each}
	</tr>
</table>
