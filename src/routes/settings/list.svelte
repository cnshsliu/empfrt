<script type="ts">
	import * as api from '$lib/api';
	import { _ } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { setFadeMessage } from '$lib/Notifier';
	import type { EmpResponse, OrgMembers, oneArgFunc } from '$lib/types';
	import {
		Container,
		Row,
		Col,
		Button,
		InputGroup,
		InputGroupText,
		Input,
		Badge,
	} from 'sveltestrap';
	let lists = [];
	const refreshList = async function () {
		lists = (await api.post('list/list', {}, $session.user.sessionToken)) as unknown as any[];
	};
	let user = $session.user;
	let myEmail = user.email;

	let newlist = { name: '', key: 'Default', items: '' };
	let newkey = '';
	let newitems = '';
	let newName = '';
	let updateList = '';
	let updateKey = '';
	let changeNameOf = '';
	let addKeyFor = '';

	refreshList();
</script>

<Container class="mt-3">
	<Row>
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
				<li class="breadcrumb-item active" aria-current="page">{$_('setting.list.nav')}</li>
			</ol>
		</nav>
	</Row>
	<Row><span class="text-center fs-3">New List</span></Row>
	<Row>
		<InputGroup>
			<InputGroupText>New List name</InputGroupText>
			<Input bind:value={newlist.name} />
		</InputGroup>
		<InputGroup>
			<InputGroupText>Default items</InputGroupText>
			<Input type="textarea" bind:value={newlist.items} />
			<Button
				color="primary"
				on:click={async (e) => {
					e.preventDefault();
					newlist.items = newlist.items.replace('；', ';');
					newlist.items = newlist.items.replace('，', ',');
					let ret = await api.post('list/set', newlist, user.sessionToken);
					if (ret.error) {
						setFadeMessage(ret.message, 'warning');
					} else {
						setFadeMessage('Success', 'success');
						refreshList();
					}
				}}>
				Create
			</Button>
		</InputGroup>
	</Row>
	{#each lists as list}
		<Container class="border rounded border-3 mt-2 p-2">
			<Row cols="3" class="mt-2 bg-light mx-2 p-2">
				<Col class="fs-3">{list.name}</Col>
				<Col>Author {list.author}</Col>
				{#if list.author === myEmail}
					<Col class="d-flex justify-content-end">
						<Button
							class="btn-sm m-2"
							color="primary"
							on:click={async (e) => {
								e.preventDefault();
								changeNameOf = list.name;
								newName = list.name;
								newlist.name = '';
								addKeyFor = '';
							}}>
							Change Name
						</Button>
						<Button
							class="btn-sm m-2"
							color="primary"
							on:click={async (e) => {
								e.preventDefault();
								addKeyFor = list.name;
								changeNameOf = '';
								newName = '';
								newkey = '';
								newitems = '';
							}}>
							Add a key
						</Button>
						<Button
							class="btn-sm m-2"
							color="primary"
							on:click={async (e) => {
								e.preventDefault();
								await api.post('list/del/listorkey', { name: list.name }, user.sessionToken);
								refreshList();
							}}>
							Delete
						</Button>
					</Col>
				{/if}
				{#if changeNameOf === list.name}
					{#if list.author === user.email}
						Change name form
						<InputGroup>
							<InputGroupText>Key name</InputGroupText>
							<Input bind:value={newName} />
							<Button
								color="primary"
								on:click={async (e) => {
									e.preventDefault();
									let ret = await api.post(
										'list/change/name',
										{ name: list.name, newName: newName },
										user.sessionToken,
									);
									if (ret.error) {
										setFadeMessage(ret.message, 'warning');
									} else {
										setFadeMessage('Success', 'success');
									}
								}}>
								Change
							</Button>
							<Button
								on:click={(e) => {
									changeNameOf = '';
								}}>
								Cancel
							</Button>
						</InputGroup>
					{:else}
						Sorry, not created by you
					{/if}
				{/if}
				{#if addKeyFor === list.name}
					Add key form
					<InputGroup>
						<InputGroupText>Key name</InputGroupText>
						<Input bind:value={newkey} />
					</InputGroup>
					<InputGroup>
						<InputGroupText>List items</InputGroupText>
						<Input type="textarea" bind:value={newitems} />
						<Button
							color="primary"
							on:click={async (e) => {
								e.preventDefault();
								let ret = await api.post(
									'list/set',
									{ name: list.name, key: newkey, items: newitems },
									user.sessionToken,
								);
								if (ret.error) {
									setFadeMessage(ret.message, 'warning');
								} else {
									newkey = '';
									newitems = '';
									refreshList();
								}
							}}>
							Add
						</Button>
						<Button
							on:click={(e) => {
								addKeyFor = '';
							}}>
							Cancel
						</Button>
					</InputGroup>
				{/if}
			</Row>
			{#each list.entries as entry, keyindex}
				<Container class={'pb-2 ' + (keyindex < list.entries.length - 1 ? 'border-bottom' : '')}>
					<div class="mx-2 d-flex mt-2">
						<div class="flex-grow-1">
							<span class="fs-5">KEY({keyindex + 1}/{list.entries.length}): {entry.key}</span>
							<br />
							{#each entry.items.split(/[\s|;|,]/) as aItem}
								<Badge pill class="mx-1 bg-white border border-primary text-primary ">
									{aItem}
								</Badge>
							{/each}
						</div>
						<div>
							<Button
								on:click={(e) => {
									e.preventDefault();
									updateList = list.name;
									updateKey = entry.key;
								}}>
								Update
							</Button>
							<Button
								color="warning"
								on:click={async (e) => {
									e.preventDefault();
									await api.post(
										'list/del/listorkey',
										{ name: list.name, key: entry.key },
										user.sessionToken,
									);
									refreshList();
								}}>
								Delete
							</Button>
						</div>
					</div>
					{#if updateList === list.name && updateKey === entry.key}
						<Row class="mx-3">
							<Col>
								<InputGroup class="mt-1">
									<Input type="textarea" bind:value={entry.items} />
									<Button
										on:click={async (e) => {
											e.preventDefault();
											entry.items = entry.items
												.split(/[\s|;|,]/)
												.filter((x) => x.trim().length > 0)
												.join(';');
											let ret = await api.post(
												'list/set',
												{ name: list.name, key: entry.key, items: entry.items },
												user.sessionToken,
											);
											if (ret.error) {
												setFadeMessage(ret.message, 'warning');
											} else {
												setFadeMessage('Success', 'success');
												updateList = '';
											}
										}}>
										Update
									</Button>
								</InputGroup>
							</Col>
						</Row>
					{/if}
				</Container>
			{/each}
		</Container>
	{/each}
</Container>
