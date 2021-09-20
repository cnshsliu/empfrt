<script lang="ts">
	import { Row, Col, Icon, Styles } from 'sveltestrap';
	import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'sveltestrap';
	export let template: Template;
	export let mouseover_objid: string;
	export let deleteTemplate;
</script>

<Styles />

<Row class={mouseover_objid === template.tplid ? 'cocohighlight-2' : ''}>
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
				<Icon name="diagram-3" class="kfk-template-action-icon" />
				<div class="kfk-icon-title">Edit</div>
			</a>
			<a class="btn btn-sm" href="/template/@{template.tplid}">
				<Icon name="play-circle-fill" class="kfk-template-action-icon" />
				<div class="kfk-icon-title">Run</div>
			</a>
		{/if}
	</Col>
	<Col xs="2">
		{#if mouseover_objid === template.tplid}
			<Dropdown>
				<DropdownToggle caret color="notexist">More <Icon name="three-dots" /></DropdownToggle>
				<DropdownMenu>
					<DropdownItem>
						<a
							href={'#'}
							on:click|preventDefault={() => deleteTemplate(template.tplid)}
							class="nav-link "
							><Icon name="x" />
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
