<script lang="ts">
	import { tick, createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	import * as api from '$lib/api';
	import { _ } from '$lib/i18n';
	import { Col, FormGroup, Label, Input } from 'sveltestrap';
	import { debugOption } from '$lib/empstores';
	import { onMount } from 'svelte';
	import { text_area_resize } from '$lib/autoresize_textarea';
	import List from '$lib/input/List.svelte';
	import InputTable from '$lib/input/Table.svelte';
	import { session } from '$app/stores';
	import WorkFile from '$lib/workfile.svelte';
	import CsvDisplay from '$lib/display/CsvDisplay.svelte';

	let user = $session.user;
	let check_timer = null;
	let whichtoChange: string = '';
	let serverListKey: string = '';
	export let work: any;
	export let kvar: any;
	export let kvarIndex: number;
	let cssClasses: string = '';
	let userCheckingResult = '';
	const FULLWITHINPUTTYPES = ['textarea', 'tbl', 'file', 'csv'];

	const onInputUser = async function (kvar, ser) {
		kvar.class = 'LOADING';
		if (check_timer) clearTimeout(check_timer);
		await tick();
		console.log(kvar);
		check_timer = setTimeout(async () => {
			if (kvar.value === '' || kvar.value.trim() === '') {
				kvar.wrong_input = `${kvar.label} should not be empty`;
				userCheckingResult = kvar.wrong_input;
			} else {
				let ret = await api.post('check/coworker', { whom: kvar.value }, user.sessionToken);
				if (ret.error) {
					kvar.wrong_input = `${kvar.value} does not exist`;
					cssClasses = 'is-invalid';
					userCheckingResult = ret.message;
				} else {
					delete kvar.wrong_input;
					cssClasses = 'valid';
					userCheckingResult = `${ret.username}(${ret.email})`;
					kvar.value = ret.email;
					work.kvarsArr = work.kvarsArr;
				}

				check_timer = null;
			}
		}, 1000);
	};

	let csvUIDCheckResult = {};
	let csvFileServerIds = {};
	const removeCSV = function (fileIdOnServer, kvar) {
		kvar.value = '';
		delete csvFileServerIds[kvar.name];
		delete csvUIDCheckResult[kvar.name];
		kvar = kvar;
	};
	const uploadedCSV = function (fileIdOnServer, kvar) {
		kvar.value = fileIdOnServer;
		csvFileServerIds[kvar.name] = fileIdOnServer;
		kvar = kvar;
	};

	onMount(async () => {
		if (kvar.type === 'user') {
			if (kvar.value) {
				await onInputUser(kvar, kvarIndex);
			}
		}
	});
</script>

{#if kvar.ui.includes('input')}
	{#if kvar.breakrow}
		<div class="w-100" />
	{/if}
	{#if FULLWITHINPUTTYPES.includes(kvar.type)}
		<div class="w-100" />
	{/if}
	<Col class={' p-1 ' + (FULLWITHINPUTTYPES.includes(kvar.type) ? ' w-100' : '')}>
		{#if $debugOption === 'yes'}
			<div class="text-wrap text-break">{JSON.stringify(kvar)}</div>
		{/if}
		<FormGroup>
			<Label>{kvar.label}{kvar.required ? '*' : ''}</Label>
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
					filetype={'file'}
				/>
			{:else if kvar.type === 'csv'}
				<WorkFile
					{work}
					title={null}
					forWhat={'workflow'}
					forWhich={work.wfid}
					forKey={kvar.name}
					forKvar={kvar.label}
					filetype={'csv'}
					on:uploading={(e) => {
						delete csvUIDCheckResult[kvar.name];
						console.log(csvUIDCheckResult[kvar.name]);
						csvUIDCheckResult = csvUIDCheckResult;
					}}
					on:remove={(e) => {
						removeCSV(e.detail, kvar);
						delete csvUIDCheckResult[kvar.name];
						console.log(csvUIDCheckResult[kvar.name]);
						csvUIDCheckResult = csvUIDCheckResult;
					}}
					on:uploaded={(e) => {
						uploadedCSV(e.detail, kvar);
					}}
					on:uidCheckResult={(e) => {
						csvUIDCheckResult[kvar.name] = e.detail;
						csvUIDCheckResult = csvUIDCheckResult;
					}}
				/>
				{#if csvUIDCheckResult[kvar.name]}
					<div>{$_('csv.uidnotfound')}</div>
					<div>{csvUIDCheckResult[kvar.name]}</div>
				{/if}

				{#if csvFileServerIds[kvar.name]}
					<CsvDisplay fileId={csvFileServerIds[kvar.name]} />
				{/if}
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
					on:input={async (e) => {
						e.preventDefault();
						onInputUser(kvar, kvarIndex);
					}}
					on:change={(e) => {
						e.preventDefault();
						dispatch('kvar_value_input_changed', kvar);
					}}
					aria-describedby={'validationServerUsernameFeedback' + kvarIndex}
				/>
				<div
					id={'validationServerUsernameFeedback' + kvarIndex}
					class="invalid-feedback text-danger"
				>
					{userCheckingResult}
				</div>
				{#if cssClasses === 'valid'}
					<span class="text-danger">{userCheckingResult}</span>
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
	{#if FULLWITHINPUTTYPES.includes(kvar.type)}
		<div class="w-100" />
	{/if}
{/if}
