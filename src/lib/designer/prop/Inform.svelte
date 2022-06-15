<script lang="ts">
	import { _ } from '$lib/i18n';
	import Parser from '$lib/parser';
	import {
		NavLink,
		Icon,
		Container,
		Row,
		Col,
		InputGroup,
		InputGroupText,
		Input,
		TabContent,
		TabPane,
	} from 'sveltestrap';
	import RolePicker from '$lib/designer/prop/RolePicker.svelte';
	import ChangeID from './ChangeID.svelte';

	export let nodeInfo;
	export let roleOptions = [];
	export let showHelp;
	export let readonly;
	export let jq;
	export let KFK;
	let helpShowing = false;
</script>

<Container>
	<Row cols="1">
		<ChangeID
			{jq}
			bind:idForInput={nodeInfo.nodeProps.INFORM.id}
			{KFK}
			{readonly}
			on:changeNodeId />
		<Col>
			<InputGroup size="sm">
				<InputGroupText>
					{$_('prop.label')}
				</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.label} disabled={readonly} />
			</InputGroup>
		</Col>
	</Row>
	<TabContent pills>
		<TabPane tabId="recipient" tab={$_('prop.inform.recipient')}>
			<Col>
				<RolePicker
					bind:role={nodeInfo.nodeProps.INFORM.role}
					bind:existingRoles={roleOptions}
					{readonly} />
			</Col>
		</TabPane>
		<TabPane tabId="content" tab={$_('prop.inform.content')}>
			<Row cols="1">
				<Col>
					<InputGroup size="sm">
						<InputGroupText>
							{$_('prop.inform.subject')}
						</InputGroupText>
						<Input bind:value={nodeInfo.nodeProps.INFORM.subject} disabled={readonly} />
					</InputGroup>
				</Col>
				<Col>
					<InputGroup size="sm">
						<InputGroupText>
							{$_('prop.inform.content')}
						</InputGroupText>
						<Input
							bind:value={nodeInfo.nodeProps.INFORM.content}
							type="textarea"
							class="kfk-code-input"
							disabled={readonly} />
					</InputGroup>
				</Col>
			</Row>
		</TabPane>
	</TabContent>
	<Row>
		<Col class="d-flex mt-3">
			<NavLink
				on:click={() => {
					helpShowing ? showHelp() : showHelp('INFORM');
					helpShowing = !helpShowing;
				}}
				class="ms-auto p-0 m-0">
				{#if helpShowing}
					<Icon name="chevron-left" />
					<Icon name="question-circle" />
				{:else}
					<Icon name="question-circle" />
					<Icon name="chevron-right" />
				{/if}
			</NavLink>
		</Col>
	</Row>
</Container>
