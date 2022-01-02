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
	import { _ } from '$lib/i18n';
	import type { User, radioOption } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import { filterStorage } from '$lib/empstores';
	export let object_type: string;
	let filter_doer: string;
	let filter_starter: string;
	let filter_tspan: string;
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
		$filterStorage.tplid = value;
		dispatch('filterTemplateChange');
	}
	function starterChanged() {
		if (filter_starter[0] === '@') {
			filter_starter = filter_starter.substring(1);
		}
		if (filter_starter !== '' && filter_starter.indexOf('@') < 0) {
			filter_starter += user.email.substring(user.email.indexOf('@'));
		}
		$filterStorage.starter = filter_starter;
		dispatch('filterStarterChange');
	}

	function doerChanged() {
		if (filter_doer[0] === '@') {
			filter_doer = filter_doer.substring(1);
		}
		if (filter_doer.indexOf('@') < 0) {
			filter_doer += user.email.substring(user.email.indexOf('@'));
		}
		$filterStorage.doer = filter_doer;
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
		if (object_type === 'work items') filter_status = $filterStorage.workStatus;
		else filter_status = $filterStorage.wfStatus;
		filter_template = $filterStorage.tplid;
		filter_doer = $filterStorage.doer;
		filter_tspan = $filterStorage.tspan;
		filter_starter = $filterStorage.starter;
		statusMessage = getStatusMessage(filter_status);
	}
	export function reset() {
		filter_status = 'All';
		filter_template = '';
		filter_doer = user.email;
		filter_starter = user.email;
		filter_tspan = '';
		statusMessage = getStatusMessage(filter_status);
	}
	onMount(async () => {
		reload();
	});
</script>

{#if fields.indexOf('statuses') > -1}
	<Container>
		<Row class="d-flex justify-content-center">
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
	</Container>
{/if}
{#if fields.includes('templatepicker') || fields.includes('doer')}
	<Row cols={{ xs: 1, md: 2 }}>
		<Col>
			<InputGroup>
				<InputGroupText>{$_('extrafilter.template')}</InputGroupText>
				<Input
					type="select"
					name="selectTpl"
					id="tplSelect"
					bind:value={filter_template}
					on:change={tplChanged}
				>
					<option value="">
						{$_('extrafilter.allTemplate')}
					</option>
					{#each templates as tpl, index (tpl)}
						{#if tpl !== $filterStorage.tplid}
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
					}}
					color="primary"
				>
					<i class="bi bi-arrow-return-left" />
				</Button>
			</InputGroup>
		</Col>
		{#if fields.indexOf('starter') > -1}
			<Col>
				<InputGroup class="kfk-input-template-name d-flex">
					<InputGroupText>{$_('extrafilter.starter')}</InputGroupText>
					<Input
						class="flex-fill"
						name="other_doer"
						bind:value={filter_starter}
						aria-label="User Email"
						placeholder="email"
					/>
					<Button on:click={starterChanged} color="primary">
						<i class="bi bi-arrow-return-left" />
					</Button>
					<Button
						on:click={() => {
							filter_starter = user.email;
							starterChanged();
						}}
						color="secondary"
					>
						{$_('extrafilter.me')}
					</Button>
					<Button
						on:click={() => {
							filter_starter = '';
							starterChanged();
						}}
						color="secondary"
					>
						{$_('extrafilter.any')}
					</Button>
				</InputGroup>
			</Col>
		{/if}
		{#if fields.indexOf('doer') > -1}
			<Col>
				{#if user.group === 'ADMIN'}
					<InputGroup class="d-flex">
						<InputGroupText>
							{$_('extrafilter.owner')}
						</InputGroupText>
						<Input
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
							{$_('extrafilter.mine')}
						</Button>
					</InputGroup>
				{:else if delegators.length > 0}
					<InputGroup>
						<InputGroupText>Delegator:</InputGroupText>
						<Input type="select" name="select" id="exampleSelect" bind:value={filter_doer}>
							{#each delegators as delegator, index (delegator)}
								{#if delegator === $filterStorage.doer}
									<option value={delegator} selected>{delegator}</option>
								{:else}
									<option value={delegator}>{delegator}</option>
								{/if}
							{/each}
						</Input>
						<Button on:click={doerChanged} color="primary">
							<i class="bi bi-arrow-return-left" />
						</Button>
					</InputGroup>
				{/if}
			</Col>
		{/if}
	</Row>
{/if}
