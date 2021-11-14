<svelte:options accessors />

<script lang="ts">
	import {
		Container,
		Row,
		InputGroup,
		InputGroupText,
		Col,
		Button,
		Input,
		FormGroup,
		Label
	} from 'sveltestrap';
	import type { User, radioOption } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	export let object_type: string;
	export let filter_doer: string;
	export let user: User;
	export let delegators;
	export let filter_status: string;
	export let statuses_label: string;
	export let fields: string[] = ['statuses'];
	export let statuses: radioOption[] = [
		{
			value: 'ST_RUN',
			label: 'Running'
		}
	];
	let statusMessage = '';
	function radioChanged(e) {
		dispatch('filterStatusChange', e.target.value);
		statusMessage = getStatusMessage(e.target.value);
	}

	const dispatch = createEventDispatcher();
	function getStatusMessage(aStatus) {
		switch (aStatus) {
			case 'ST_RUN':
				return `show running ${object_type}`;
			case 'ST_PAUSE':
				return `show paused ${object_type}`;
			case 'ST_DONE':
				return `show completed ${object_type}`;
			case 'ST_STOP':
				return `show stopped ${object_type}`;
			case 'All':
				return `show all ${object_type}`;
			default:
				return `show ${aStatus} ${object_type}`;
		}
	}

	statusMessage = getStatusMessage(filter_status);
</script>

{#if fields.indexOf('statuses') > -1}
	<Container class="kfk-tab-menu">
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
		<Row><Col class="mx-3">{statusMessage}</Col></Row>
	</Container>
{/if}
{#if fields.indexOf('doer') > -1}
	{#if user.group === 'ADMIN'}
		<Row class="mt-3">
			<Col>
				<InputGroup class="kfk-input-template-name d-flex">
					<InputGroupText>List workitems assigned to</InputGroupText>
					<input
						class="flex-fill"
						name="tplid"
						bind:value={filter_doer}
						aria-label="User Email"
						placeholder="Input user email to query his/her workitems"
					/>
				</InputGroup>
			</Col>
		</Row>
	{:else if delegators.length > 0}
		<InputGroup>
			<InputGroupText>View works for delegator:</InputGroupText>
			<Input type="select" name="select" id="exampleSelect" bind:value={filter_doer}>
				{#each delegators as delegator, index (delegator)}
					<option value={delegator}>{delegator}</option>
				{/each}
			</Input>
		</InputGroup>
	{/if}
{/if}
