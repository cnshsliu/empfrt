<script lang="ts">
	import type { Template } from '$lib/types';
	import * as api from '$lib/api';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { Row, Col, Icon, Styles } from 'sveltestrap';
	import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'sveltestrap';
	export let template: Template;
	export let mouseover_objid: string;
	export let deleteTemplate: { (arg: string): void };
	function startWorkflow(tplid: string): void {
		setTimeout(async () => {
			await api.post('workflow/start', { tplid: tplid }, $session.user.sessionToken);
		});
	}
	function showStartWorkflowForm(tplid: string): void {
		goto(`/template/start?tplid=${tplid}`, { replaceState: false });
	}
</script>

<Styles />

<Row class={mouseover_objid === template.tplid ? 'kfk-highlight-2' : ''}>
	<Col xs="8">
		<div>
			<a href="/template/@{template.tplid}&edit" class="preview-link kfk-template-id">
				{template.tplid}
			</a>
			<div class="kfk-template-info">
				{template.author}
				<span class="date"> {new Date(template.createdAt).toDateString()} </span>
			</div>
		</div>
	</Col>
	<Col xs="2">
		{#if mouseover_objid === template.tplid}
			<a class="btn btn-sm" href="/template/@{template.tplid}&edit">
				<Icon name="pencil-square" class="kfk-template-action-icon" /> Edit
			</a>
			<a
				class="btn btn-sm"
				href={'#'}
				on:click|preventDefault={() => showStartWorkflowForm(template.tplid)}
			>
				<Icon name="play-circle-fill" class="kfk-template-action-icon" /> Run
			</a>
		{/if}
	</Col>
	<Col xs="2">
		{#if mouseover_objid === template.tplid}
			<Dropdown>
				<DropdownToggle caret color="notexist" class="btn-sm">More</DropdownToggle>
				<DropdownMenu>
					<DropdownItem>
						<a
							href={'#'}
							on:click|preventDefault={() => deleteTemplate(template.tplid)}
							class="nav-link "
							><Icon name="trash" />
							Delete this template
						</a>
					</DropdownItem>
					<DropdownItem>
						<a href="/template/@{template.tplid}&read" class="nav-link"
							><Icon name="eye-fill" />
							Read mode
						</a>
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		{/if}
	</Col>
</Row>
