<svelte:options accessors />

<script lang="ts">
	import {
		Icon,
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
	import { onMount } from 'svelte';
	import { filterStore } from '$lib/empstores';
	import { session } from '$app/stores';
	export let object_type: string;
	let filter_doer: string;
	export let filter_template: string;
	export let user: User;
	export let delegators;
	export let filter_status: string;
	export let statuses_label: string;
	export let fields: string[] = ['statuses'];
	export let templates: string[] = [];
	export let statuses: radioOption[] = [
		{
			value: 'ST_RUN',
			label: 'Running'
		}
	];
	let statusMessage = '';
	const dispatch = createEventDispatcher();
	function radioChanged(e) {
		dispatch('filterStatusChange', e.target.value);
		statusMessage = getStatusMessage(e.target.value);
	}
	function tplChanged(e) {
		console.log('>>>>>>>FilterTemplateChanged');
		tplChangedTo((e.target as HTMLInputElement).value);
	}
	function tplChangedTo(value) {
		$filterStore.tplid = value;
		dispatch('filterTemplateChange');
	}

	function doerChanged() {
		$filterStore.doer = filter_doer;
		dispatch('filterDoerChange');
	}

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

	export function reload() {
		if (object_type === 'work items') filter_status = $filterStore.workStatus;
		else filter_status = $filterStore.wfStatus;
		filter_template = $filterStore.tplid;
		filter_doer = $filterStore.doer;
		statusMessage = getStatusMessage(filter_status);
	}
	export function reset() {
		filter_status = 'All';
		filter_template = '';
		filter_doer = user.email;
		statusMessage = getStatusMessage(filter_status);
	}
	onMount(async () => {
		reload();
	});
</script>

{#if fields.indexOf('statuses') > -1}
	<Container class="kfk-tab-menu">
		<Row>
			<Col xs="auto"><Icon name="ui-radios" />&nbsp; {statuses_label}</Col>
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
{#if fields.indexOf('templatepicker') > -1}
	<Row class="mt-1">
		<InputGroup>
			<InputGroupText>Template:</InputGroupText>
			<Input
				type="select"
				name="selectTpl"
				id="tplSelect"
				bind:value={filter_template}
				on:change={tplChanged}
			>
				<option value="">--All Template--</option>
				{#each templates as tpl, index (tpl)}
					{#if tpl !== $filterStore.tplid}
						<option value={tpl}>{tpl}</option>
					{:else}
						<option value={tpl} selected>--&gt;&gt; {tpl}</option>
					{/if}
				{/each}
			</Input>
			<Button
				on:click={(e) => {
					e.preventDefault;
					filter_template = '';
					tplChangedTo('');
				}}>All</Button
			>
		</InputGroup>
	</Row>
{/if}
{#if fields.indexOf('doer') > -1}
	<Row class="mt-0">
		<Col>
			{#if user.group === 'ADMIN'}
				<InputGroup class="kfk-input-template-name d-flex">
					<InputGroupText>
						<Icon name="person-badge" />&nbsp; List workitems assigned to
					</InputGroupText>
					<input
						class="flex-fill"
						name="other_doer"
						bind:value={filter_doer}
						aria-label="User Email"
						placeholder="Input user email to query his/her workitems"
					/>
					<Button on:click={doerChanged} color="primary">List&gt;</Button>
					<Button
						on:click={() => {
							filter_doer = user.email;
							doerChanged();
						}}
						color="secondary"
					>
						Mine&gt;
					</Button>
				</InputGroup>
			{:else if delegators.length > 0}
				<InputGroup>
					<InputGroupText>
						<Icon name="person-badge" />&nbsp; View works for delegator:
					</InputGroupText>
					<Input type="select" name="select" id="exampleSelect" bind:value={filter_doer}>
						{#each delegators as delegator, index (delegator)}
							{#if delegator === $filterStore.doer}
								<option value={delegator} selected>{delegator}</option>
							{:else}
								<option value={delegator}>{delegator}</option>
							{/if}
						{/each}
					</Input>
					<Button on:click={doerChanged} color="primary">List&gt;</Button>
				</InputGroup>
			{/if}
		</Col>
	</Row>
{/if}
