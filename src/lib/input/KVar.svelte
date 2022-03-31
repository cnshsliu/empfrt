<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	import * as api from '$lib/api';
	import { Col, FormGroup, Label, Input } from 'sveltestrap';
	import { debugOption } from '$lib/empstores';
	import { text_area_resize } from '$lib/autoresize_textarea';
	import List from '$lib/input/List.svelte';
	import InputTable from '$lib/input/Table.svelte';
	import { session } from '$app/stores';
	import WorkFile from '$lib/workfile.svelte';

	let user = $session.user;
	let check_timer = null;
	let whichtoChange: string = '';
	let serverListKey: string = '';
	export let work: any;
	export let kvar: any;
	export let i: number;
	let cssClasses: string = '';
	let checkingMsgs = '';

	const onInputUser = function (kvar, ser) {
		kvar.class = 'LOADING';
		if (check_timer) clearTimeout(check_timer);
		check_timer = setTimeout(async () => {
			let ret = await api.post('check/coworker', { whom: kvar.value }, user.sessionToken);
			if (ret.error) {
				cssClasses = 'is-invalid';
				checkingMsgs = ret.message;
			} else {
				cssClasses = 'valid';
				checkingMsgs = `${ret.username}(${ret.email})`;
				kvar.value = ret.email;
				work.kvarsArr = work.kvarsArr;
			}

			check_timer = null;
		}, 1000);
	};
</script>

{#if kvar.ui.includes('input')}
	{#if kvar.breakrow}
		<div class="w-100" />
	{/if}
	{#if ['textarea', 'tbl'].includes(kvar.type)}
		<div class="w-100" />
	{/if}
	<Col class={' p-1 ' + (['textarea', 'tbl'].includes(kvar.type) ? ' w-100' : '')}>
		{#if $debugOption === 'yes'}
			<div class="text-wrap text-break">{JSON.stringify(kvar)}</div>
		{/if}
		<FormGroup>
			<Label>{kvar.label}{kvar.required ? '*' : ''}</Label>
			{kvar.type}
			{#if kvar.formula && kvar.formula.length > 0}
				{#if work.rehearsal}
					<div>{kvar.formula}</div>
				{/if}
				<div>{kvar.value}</div>
			{:else if kvar.type === 'textarea'}
				<textarea
					name={kvar.name}
					bind:value={kvar.value}
					placeholder={kvar.placeholder}
					required={kvar.required}
					use:text_area_resize
					class="form-control"
					on:change={(e) => {
						e.preventDefault();
						dispatch('kvar_value_input_changed', kvar);
					}}
				/>
			{:else if kvar.type === 'tbl'}
				<InputTable {kvar} rehearsal={work.rehearsal} readonly={false} />
			{:else if kvar.type === 'file'}
				<WorkFile
					{work}
					title={null}
					forWhat={'workflow'}
					forWhich={work.wfid}
					forKey={kvar.name}
					forKvar={kvar.label}
				/>
			{:else if ['select', 'checkbox', 'radio', 'user'].includes(kvar.type) === false}
				<Input
					type={['dt', 'datetime'].includes(kvar.type)
						? 'datetime-local'
						: ['string', 'plaintext'].includes(kvar.type)
						? 'text'
						: kvar.type}
					name={kvar.name}
					bind:value={kvar.value}
					id={kvar.id ? kvar.id : `input_${kvar.name}`}
					placeholder={kvar.placeholder}
					required={kvar.required}
					on:change={(e) => {
						e.preventDefault();
						dispatch('kvar_value_input_changed', kvar);
					}}
				/>
			{:else if kvar.type === 'user'}
				<Input
					class={cssClasses}
					name={kvar.name}
					bind:value={kvar.value}
					id={kvar.id}
					placeholder={kvar.placeholder}
					required={kvar.required}
					autocomplete="off"
					on:input={(e) => {
						e.preventDefault();
						onInputUser(kvar, i);
					}}
					on:change={(e) => {
						e.preventDefault();
						dispatch('kvar_value_input_changed', kvar);
					}}
					aria-describedby={'validationServerUsernameFeedback' + i}
				/>
				<div id={'validationServerUsernameFeedback' + i} class="invalid-feedback">
					{checkingMsgs}
				</div>
				{#if cssClasses === 'valid'}
					{checkingMsgs}
				{/if}
			{:else if kvar.type === 'checkbox'}
				<div class="form-check form-switch">
					<input
						class="form-check-input"
						type="checkbox"
						role="switch"
						bind:checked={kvar.value}
						id={'chk-' + (kvar.id ? kvar.id : kvar.name)}
						on:change={(e) => {
							e.preventDefault();
							dispatch('kvar_value_input_changed', kvar);
						}}
					/>
				</div>
			{:else if kvar.type === 'radio'}
				{#each kvar.options as option}
					<Input
						type="radio"
						bind:group={kvar.value}
						value={option}
						label={option}
						on:change={(e) => {
							e.preventDefault();
							//eslint-disable-next-line
							let selectedValue = e.target.value;
							dispatch('kvar_value_input_changed', { name: kvar.name, value: selectedValue });
						}}
					/>
				{/each}
			{:else if kvar.type === 'select'}
				<List
					{kvar}
					{whichtoChange}
					{serverListKey}
					on:change={(e) => {
						e.preventDefault();
						dispatch('kvar_value_input_changed', e.detail);
					}}
					on:changelist={(e) => {
						let tmp = e.detail.split('/');
						if (tmp[0].length > 0) {
							whichtoChange = tmp[0];
							serverListKey = tmp[1];
						}
					}}
				/>
			{/if}
		</FormGroup>
	</Col>
	{#if ['textarea', 'tbl'].includes(kvar.type)}
		<div class="w-100" />
	{/if}
{/if}
