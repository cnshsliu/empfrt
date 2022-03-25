<script lang="ts">
	import Parser from '$lib/parser';
	import { _ } from '$lib/i18n';
	import { qtb } from '$lib/utils';
	import SetValue from './SetValue.svelte';
	import {
		NavLink,
		Icon,
		Container,
		Row,
		Col,
		InputGroup,
		InputGroupText,
		Input,
		Button
	} from 'sveltestrap';

	export let nodeInfo;
	export let showHelp;
	export let readonly;
	let helpShowing = false;
	let showEditor = true;
	if (readonly) showEditor = false;
	if (Parser.isEmpty(nodeInfo.caseValue)) {
		nodeInfo.caseValue = '';
	}
	if (Parser.isEmpty(nodeInfo.setValue)) {
		nodeInfo.setValue = '';
	} else {
		try {
			nodeInfo.setValue = Parser.base64ToCode(nodeInfo.setValue);
		} catch (e) {
			nodeInfo.setValue = '';
		}
	}
	$: {
		nodeInfo.setValue = qtb(nodeInfo.setValue);
		console.log(nodeInfo.setValue);
	}
</script>

<Container>
	<Row cols="1" class="mt-2">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>{$_('prop.connect.decision')}</InputGroupText>
				<Input bind:value={nodeInfo.caseValue} disabled={readonly} />
			</InputGroup>
			<InputGroup>
				<InputGroupText>{$_('prop.connect.setValue')}</InputGroupText>
				<Input class="ms-1" value={nodeInfo.setValue} disabled={true} />
				{#if !readonly}
					<Button
						on:click={(e) => {
							e.preventDefault();
							showEditor = !showEditor;
						}}
					>
						<Icon name={showEditor ? 'chevron-up' : 'chevron-down'} />
					</Button>
				{/if}
			</InputGroup>
		</Col>
		{#if !readonly && showEditor}
			<Col>
				<SetValue bind:value={nodeInfo.setValue} />
			</Col>
		{/if}
		<Col class="d-flex mt-3">
			<span class="kfk-property-id" />
			<NavLink
				on:click={() => {
					helpShowing ? showHelp() : showHelp('CONNECT');
					helpShowing = !helpShowing;
				}}
				class="ms-auto p-0 m-0"
			>
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
