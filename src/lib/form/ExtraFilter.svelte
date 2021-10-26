<svelte:options accessors />

<script lang="ts" .>
	import { Row, Col, Button, Input } from 'sveltestrap';
	import type { radioOption } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	export let filter_doer: string;
	export let filter_status: string;
	export let statuses_label: string;
	export let fields: string[] = ['statuses'];
	export let statuses: radioOption[] = [
		{
			value: 'ST_RUN',
			label: 'Running'
		}
	];
	function radioChanged(e) {
		dispatch('filterStatusChange', e.target.value);
	}

	const dispatch = createEventDispatcher();
</script>

{#if fields.indexOf('doer') > -1}
	<Row>
		<Col>
			<input
				name="tplid"
				bind:value={filter_doer}
				aria-label="User Email"
				placeholder="Input user email to query his/her workitems"
				class="kfk-input-template-name"
			/>
		</Col>
	</Row>
{/if}
{#if fields.indexOf('statuses') > -1}
	<Row>
		<Col xs="auto">{statuses_label}</Col>
		{#each statuses as status, index (status)}
			<Col xs="auto">
				<Input
					type="radio"
					bind:group={filter_status}
					value={status.value}
					label={status.label}
					on:input={(e) => radioChanged(e)}
				/>
			</Col>
		{/each}
	</Row>
{/if}
