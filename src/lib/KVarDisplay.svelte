<script lang="ts">
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { Col, FormGroup, Label, Input } from 'sveltestrap';
	import { debugOption } from '$lib/empstores';
	import Parser from '$lib/parser';
	import { text_area_resize } from '$lib/autoresize_textarea';
	import List from '$lib/input/List.svelte';
	import { session } from '$app/stores';
	import WorkFile from '$lib/workfile.svelte';
	import DisplayTable from '$lib/display/table.svelte';

	let user = $session.user;
	let check_timer = null;
	export let work;
	export let kvar;
</script>

{#if kvar.ui.includes('context') || work.rehearsal}
	{#if kvar.breakrow}
		<div class="w-100" />
	{/if}
	{#if ['textarea', 'tbl'].includes(kvar.type)}
		<div class="w-100" />
	{/if}
	<Col class={' p-2 ' + (['textarea', 'tbl'].includes(kvar.type) ? ' w-100' : '')}>
		<div class="fs-5  border-bottom border-primary border-1">
			{#if kvar.label === 'Starter'}
				{$_('todo.Starter')}{@html work.rehearsal ? '<br/>' + kvar.name : ''}
			{:else if kvar.label === 'StarterCN'}
				{$_('todo.StarterCN')}{@html work.rehearsal ? '<br/>' + kvar.name : ''}
			{:else if kvar.label === 'StarterOU'}
				{$_('todo.StarterOU')}{@html work.rehearsal ? '<br/>' + kvar.name : ''}
			{:else if kvar.label.startsWith('OUof_')}
				{$_('todo.OUof') + '(' + kvar.label.substring(5) + ')'}{@html work.rehearsal
					? '<br/>' + kvar.name
					: ''}
			{:else}
				{kvar.label}{@html work.rehearsal ? '<br/>' + kvar.name : ''}
			{/if}
			<br />
		</div>
		<span class="kfk-kvar-value-display">
			{#if kvar.type === 'textarea'}
				{@html Parser.newlineToBreak(kvar.value)}
			{:else if kvar.type === 'url'}
				<a href={kvar.value} target="_blank">{kvar.value}</a>
			{:else if kvar.type === 'file'}
				<WorkFile
					{work}
					title={null}
					forWhat={'workflow'}
					forWhich={work.wfid}
					forKey={kvar.name}
					forKvar={kvar.label}
					uploader={false}
				/>
			{:else if kvar.type === 'tbl'}
				<DisplayTable {kvar} />
			{:else if work.rehearsal}
				{kvar.display ? kvar.value + '(' + kvar.display + ')' : kvar.value}
			{:else}
				{kvar.display ? kvar.display : kvar.value}
			{/if}
		</span>
	</Col>
	{#if ['textarea', 'tbl'].includes(kvar.type) || kvar.name === 'ou_SOU'}
		<div class="w-100" />
	{/if}
{/if}
