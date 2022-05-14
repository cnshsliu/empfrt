<script lang="ts">
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import {
		Card,
		CardBody,
		CardTitle,
		Container,
		Row,
		Col,
		Button,
		InputGroup,
		InputGroupText,
		Input,
	} from 'sveltestrap';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	let tobeDeleteWorkflowId = '';
	let tobeDeleteWorkflowTitle = '';
	let tobeDeleteWorkflowTplid = '';
	let tobeDeleteWorkflowStatus = 'ST_STOP';
	let user = $session.user;

	const deleteWorkflow = async (mode) => {
		switch (mode) {
			case 'byid':
				tobeDeleteWorkflowId = tobeDeleteWorkflowId.trim();
				await api.post('workflow/destroy', { wfid: tobeDeleteWorkflowId }, user.sessionToken);
				break;
			case 'bytitle':
				tobeDeleteWorkflowTitle = tobeDeleteWorkflowTitle.trim();
				await api.post(
					'workflow/destroy/by/title',
					{ wftitle: tobeDeleteWorkflowTitle },
					user.sessionToken,
				);
				break;
			case 'bytplid':
				tobeDeleteWorkflowTplid = tobeDeleteWorkflowTplid.trim();
				await api.post(
					'workflow/destroy/by/tplid',
					{ tplid: tobeDeleteWorkflowTplid },
					user.sessionToken,
				);
				break;
		}
	};
</script>

<Container>
	<Row class="mt-3">
		<nav aria-label="breadcrumb">
			<ol class="breadcrumb">
				<li class="breadcrumb-item kfk-tag">
					<a
						class="kfk-link"
						href={'#'}
						on:click={() => {
							goto('/settings');
						}}>
						{$_('navmenu.settings')}
					</a>
				</li>
				<li class="breadcrumb-item active" aria-current="page">
					{$_('setting.maintainance.nav')}
				</li>
			</ol>
		</nav>
	</Row>
	{#if user.group === 'ADMIN'}
		<Card>
			<CardBody>
				<form>
					<CardTitle>{$_('setting.maintainance.deletebizobj')}</CardTitle>
					<Row cols="1">
						<Col>
							<InputGroup>
								<InputGroupText>{$_('setting.maintainance.select_status')}</InputGroupText>
								<Input type="select" bind:value={tobeDeleteWorkflowStatus}>
									<option value="ALL">All</option>
									<option value="ST_RUN">ST_RUN</option>
									<option value="ST_DONE">ST_DONE</option>
									<option value="ST_PAUSE">ST_PAUSE</option>
									<option value="ST_STOP">ST_STOP</option>
								</Input>
							</InputGroup>
						</Col>
					</Row>
					<Row>
						<Col>
							<InputGroup>
								<InputGroupText>{$_('setting.maintainance.bywfid')}</InputGroupText>
								<Input bind:value={tobeDeleteWorkflowId} placeholder="By workflow wfid" />
								<Button
									on:click={async (e) => {
										e.preventDefault();
										await deleteWorkflow('byid');
									}}>
									Delete {tobeDeleteWorkflowStatus} Workflow
								</Button>
							</InputGroup>
						</Col>
					</Row>
					<Row>
						<Col>
							<InputGroup>
								<InputGroupText>{$_('setting.maintainance.bywftitle')}</InputGroupText>
								<Input bind:value={tobeDeleteWorkflowTitle} placeholder="by workflow title" />
								<Button
									on:click={async (e) => {
										e.preventDefault();
										await deleteWorkflow('bytitle');
									}}>
									Delete {tobeDeleteWorkflowStatus} Workflow
								</Button>
							</InputGroup>
						</Col>
					</Row>
					<Row>
						<Col>
							<InputGroup>
								<InputGroupText>{$_('setting.maintainance.bytplid')}</InputGroupText>
								<Input bind:value={tobeDeleteWorkflowTplid} placeholder="by template tplid" />
								<Button
									on:click={async (e) => {
										e.preventDefault();
										await deleteWorkflow('bytplid');
									}}>
									Delete {tobeDeleteWorkflowStatus} Template
								</Button>
							</InputGroup>
						</Col>
					</Row>
				</form>
			</CardBody>
		</Card>
	{:else}
		<Row>Only Administrator has access to operations in this section</Row>
	{/if}
</Container>
