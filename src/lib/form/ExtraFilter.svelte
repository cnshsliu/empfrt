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
		Label,
	} from 'sveltestrap';
	import { _ } from '$lib/i18n';
	import { session } from '$app/stores';
	import type { User, radioOption } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import { filterStorage } from '$lib/empstores';
	export let user: User;
	export let fields: string[] = ['statuses'];
	export let statuses: radioOption[] = [
		{
			value: 'ST_RUN',
			label: 'Running',
		},
	];
	const dispatch = createEventDispatcher();

	function doSearch() {
		console.log('tplid onSearch');
		dispatch('doSearch');
	}
</script>

{#if fields.indexOf('statuses') > -1}
	<Container class="mb-2">
		<Row class="d-flex justify-content-center">
			{#each statuses as status, index (status)}
				<Col xs="auto">
					<Input
						type="radio"
						bind:group={$filterStorage.workStatus}
						value={status.value}
						label={status.label}
						on:input={doSearch} />
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
				{#key $filterStorage.tplid}
					<select
						class="form-select"
						name="selectTpl"
						id="tplSelect"
						bind:value={$filterStorage.tplid}
						on:input={doSearch}>
						<option value="">
							{$_('extrafilter.allTemplate')}
						</option>
						{#if $session.templatesForSearch}
							{#each $session.templatesForSearch as tpl, index (tpl)}
								<option value={tpl} selected={tpl === $filterStorage.tplid}>
									{tpl}
								</option>
							{/each}
						{/if}
					</select>
				{/key}
			</InputGroup>
		</Col>
		{#if fields.indexOf('starter') > -1}
			<Col>
				<InputGroup class="kfk-input-template-name d-flex">
					<InputGroupText>{$_('extrafilter.starter')}</InputGroupText>
					<Input
						class="flex-fill"
						name="other_doer"
						bind:value={$filterStorage.starter}
						aria-label="User Email"
						placeholder="email" />
					<Button on:click={doSearch} color="primary">
						<i class="bi bi-arrow-return-left" />
					</Button>
					<Button
						on:click={() => {
							$filterStorage.starter = user.email;
						}}
						color="secondary">
						{$_('extrafilter.me')}
					</Button>
					<Button
						on:click={() => {
							$filterStorage.starter = '';
							doSearch();
						}}
						color="secondary">
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
							bind:value={$filterStorage.doer}
							placeholder="Input user email to query his/her workitems" />
						<Button on:click={doSearch} color="primary">
							<i class="bi bi-arrow-return-left" />
						</Button>
						<Button
							on:click={() => {
								$filterStorage.doer = user.email;
								doSearch();
							}}
							color="secondary">
							{$_('extrafilter.mine')}
						</Button>
					</InputGroup>
				{:else if $session.delegators && $session.delegators.length > 0}
					<InputGroup>
						<InputGroupText>Delegator:</InputGroupText>
						<Input type="select" name="select" id="exampleSelect" bind:value={$filterStorage.doer}>
							{#each $session.delegators as delegator, index (delegator)}
								{#if delegator === $filterStorage.doer}
									<option value={delegator} selected>{delegator}</option>
								{:else}
									<option value={delegator}>{delegator}</option>
								{/if}
							{/each}
						</Input>
						<Button on:click={doSearch} color="primary">
							<i class="bi bi-arrow-return-left" />
						</Button>
					</InputGroup>
				{/if}
			</Col>
		{/if}
	</Row>
{/if}
