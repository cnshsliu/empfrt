<script context="module" lang="ts">
	export const ssr = false;
	export async function load({ page, fetch, session }) {
		const fileId = page.params.fileId;
		return {
			props: {
				fileId: fileId
			}
		};
	}
</script>

<script lang="ts">
	import { session } from '$app/stores';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	import type { EmpResponse } from '$lib/types';
	export let fileId;
	let user = $session.user;
	let csvRows: any;
	let errMsg = '';

	onMount(async () => {
		csvRows = await api.post('cells/read', { fileId: fileId }, user.sessionToken);
		if (csvRows.error) {
			errMsg = csvRows.message;
		} else {
			console.log(csvRows);
		}
	});
</script>

{fileId}
{#if errMsg !== ''}
	{errMsg}
{:else if csvRows && csvRows.cells}
	<table class="celltable">
		<thead>
			<tr>
				{#each csvRows.cells[0] as col, cindex}
					<th>{col}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each csvRows.cells as row, rindex}
				{#if rindex > 0}
					<tr>
						{#each row as col, cindex}
							<td>{col}</td>
						{/each}
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
{/if}

<style>
	.celltable {
		font-family: Arial, Helvetica, sans-serif;
		border-collapse: collapse;
		width: 100%;
	}
	.celltable td,
	.celltable th {
		border: 1px solid #ddd;
		padding: 8px;
	}

	.celltable tr:nth-child(even) {
		background-color: #f2f2f2;
	}

	.celltable tr:hover {
		background-color: #ddd;
	}

	.celltable th {
		padding-top: 12px;
		padding-bottom: 12px;
		text-align: left;
		background-color: #4caf50;
		color: white;
	}
</style>
