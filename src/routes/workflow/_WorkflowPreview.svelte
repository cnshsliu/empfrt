<script lang="ts">
	import type { Workflow } from '$lib/types';
	import * as api from '$lib/api';
	import moment from 'moment';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { Row, Col, Icon } from 'sveltestrap';
	import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'sveltestrap';
	export let workflow: Workflow;
	export let mouseover_objid: string;
	export let opWorkflow: { (wfid: string, op: string): void };
</script>

<Row class={mouseover_objid === workflow.wfid ? 'kfk-highlight-2' : ''}>
	<Col xs="8">
		<div>
			<a href="/workflow/@{workflow.wfid}" class="preview-link kfk-workflow-id">
				{workflow.wftitle}
				{workflow.status}
			</a>
			<div class="kfk-workflow-info">
				{workflow.starter}
				<span class="date"> {moment(workflow.createdAt).format('LLLL')} </span>
			</div>
		</div>
	</Col>
	<Col xs="2">
		<a class="btn btn-sm" href="/workflow/@{workflow.wfid}">
			<Icon name="pencil-square" class="kfk-workflow-action-icon" /> Monitor
		</a>
		{#if workflow.status === 'ST_RUN'}
			<a
				class="btn btn-sm"
				href={'#'}
				on:click|preventDefault={() => opWorkflow(workflow, 'pause')}
			>
				<Icon name="play-circle-fill" class="kfk-workflow-action-icon" /> Pause
			</a>
		{:else if workflow.status === 'ST_PAUSE'}
			<a
				class="btn btn-sm"
				href={'#'}
				on:click|preventDefault={() => opWorkflow(workflow, 'resume')}
			>
				<Icon name="play-circle-fill" class="kfk-workflow-action-icon" /> Resume
			</a>
		{/if}
	</Col>
	<Col xs="2">
		{#if mouseover_objid === workflow.wfid}
			<Dropdown>
				<DropdownToggle caret color="notexist" class="btn-sm">More</DropdownToggle>
				<DropdownMenu>
					<DropdownItem>
						<a
							href={'#'}
							on:click|preventDefault={() => opWorkflow(workflow, 'startAnother')}
							class="nav-link "
							><Icon name="trash" />
							Start Another
						</a>
					</DropdownItem>
					<DropdownItem>
						<a
							href={'#'}
							on:click|preventDefault={() => opWorkflow(workflow, 'viewTemplate')}
							class="nav-link "
							><Icon name="trash" />
							View Template
						</a>
					</DropdownItem>
					<DropdownItem>
						<a
							href={'#'}
							on:click|preventDefault={() => opWorkflow(workflow, 'destroy')}
							class="nav-link "
							><Icon name="trash" />
							Delete this workflow
						</a>
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		{/if}
	</Col>
</Row>
