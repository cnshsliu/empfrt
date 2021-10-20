<script lang="ts">
	import Parser from '$lib/parser';
	import {
		NavLink,
		Icon,
		Container,
		Button,
		Row,
		Col,
		InputGroup,
		InputGroupText,
		Input
	} from 'sveltestrap';

	export let nodeInfo;
	export let kvarsArr = [];
	export let roleOptions = [];
	export let showHelp;
	let helpShowing = false;
</script>

<Container>
	<Row cols="1">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Label</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.ACTION.label} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Role</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.ACTION.role} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Pick an existing role</InputGroupText>
				<Input
					type="select"
					bind:value={nodeInfo.nodeProps.ACTION.role}
					name="select"
					id="exampleSelect"
				>
					{#each roleOptions as aRoleOption}
						<option>{aRoleOption}</option>
					{/each}
				</Input>
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<Input
					id="c1"
					type="checkbox"
					label="Only finish on ALL-Done?"
					bind:checked={nodeInfo.nodeProps.ACTION.byall}
				/>
			</InputGroup>
		</Col>
		<Col class="mt-3 mt-1">
			<InputGroup size="sm"
				>Vars <Button
					color="primary"
					size="sm"
					on:click={(e) => {
						console.log('add new variable');
						e.preventDefault();
						kvarsArr.push({
							name: '',
							label: '',
							value: ''
						});
						kvarsArr = kvarsArr;
					}}>+ Add new variable</Button
				>
			</InputGroup>
		</Col>
		<Col>
			<Container>
				<Row cols="1">
					{#each kvarsArr as kvar, index}
						<Col class="mt-2">
							<InputGroup size="sm">
								<InputGroupText>Name</InputGroupText>
								<Input bind:value={kvar.name} />
								<Button
									color="primary"
									on:click={(e) => {
										e.preventDefault();
										kvarsArr.splice(index, 1);
										kvarsArr = kvarsArr;
									}}>-</Button
								>
							</InputGroup>
							<InputGroup size="sm">
								<InputGroupText>Value</InputGroupText>
								<Input bind:value={kvar.value} />
							</InputGroup>
							<InputGroup size="sm">
								<InputGroupText>Label</InputGroupText>
								<Input bind:value={kvar.label} />
							</InputGroup>
						</Col>
					{/each}
				</Row>
			</Container>
		</Col>
		<Col class="d-flex mt-3">
			<span class="kfk-property-id"> ID: {nodeInfo.nodeProps.ACTION.id} </span>
			<NavLink
				on:click={() => {
					helpShowing ? showHelp() : showHelp('ACTION');
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
