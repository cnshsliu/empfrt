<script context="module">
	export function load({ session }) {
		const { user } = session;
		console.log(user);
		if (!user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}

		return {
			props: { user }
		};
	}
</script>

<script lang="ts">
	import { session } from '$app/stores';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { User, KFKError } from '$lib/types';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import { post } from '$lib/utils';
	import {
		Container,
		Row,
		Col,
		Button,
		TabContent,
		TabPane,
		Fade,
		Card,
		InputGroup,
		InputGroupText,
		Input,
		FormGroup,
		Label
	} from 'sveltestrap';

	export let user: User;
	let fade_message = '';
	let timeoutID = null;
	let fade_timer: any;
	let input_members = '';
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	let in_progress: boolean;
	let orgname;

	interface membersDef {
		email: string;
		displayName?: string;
		status: string;
	}
	let membersToAdd: membersDef[] = [
		{ email: 'liukehong@gmail.com', displayName: 'liugamil', status: 'creating' },
		{ email: 'liukehong@gmail.com', displayName: 'liugamil', status: 'created' },
		{ email: 'liukehong@gmail.com', displayName: 'liugamil', status: 'duplicated' },
		{ email: 'liukehong@gmail.com', displayName: 'liugamil', status: 'failed' }
	];

	function setFadeMessage(message: string, time = 2000) {
		fade_message = message;
		if (fade_timer) clearTimeout(fade_timer);
		fade_timer = setTimeout(() => {
			fade_message = '';
		}, time);
	}

	async function save() {
		in_progress = true;

		let ret = await api.post(
			'account/profile/update',
			{ email: user.email, username: user.username, password: user.password },
			user.sessionToken
		);
		if (ret.error) {
			setFadeMessage(ret.message);
		} else {
			//eslint-disable-next-line
			if (ret.user) {
				$session.user = ret.user;
				setFadeMessage('修改用户信息成功');
			} else {
				setFadeMessage('错误');
			}
		}

		in_progress = false;
	}
	async function setMyTenantName() {
		in_progress = true;

		let ret = await api.post('tnt/name/save', { orgname: orgname }, user.sessionToken);
		if (ret.error) {
			setFadeMessage(ret.message);
		} else {
			//eslint-disable-next-line
			if (ret.user) {
				setFadeMessage('Orgniazation name is set succesfully');
			} else {
				setFadeMessage('Error');
			}
		}

		in_progress = false;
	}

	async function save_new_members() {
		let membersArray = input_members.split('\n');
		membersToAdd = membersArray
			.filter((x) => {
				return x.trim() !== '';
			})
			.map((x) => {
				x = x.trim();
				if (x !== '') {
					let tmp = x.split(':');
					return { email: tmp[0], displayName: tmp[1] ?? '', status: 'Waiting' };
				}
			});
	}

	let generatedJoinCode = '';
	let userDefinedJoinCode = '';
	let joinorgwithcode = '';

	async function generateJoinCode() {
		let res = (await api.post('tnt/joincode/new', {}, user.sessionToken)) as Record<string, any>;
		if (res.error) {
			setFadeMessage(res.message);
		} else if (res.joincode) {
			fade_message = '';
			generatedJoinCode = res.joincode;
		}
	}

	async function setUserDefinedJoinCode() {
		let res = (await api.post(
			'tnt/joincode/save',
			{ joincode: userDefinedJoinCode },
			user.sessionToken
		)) as Record<string, any>;
		if (res.error) {
			setFadeMessage(res.message);
		} else if (res.joincode) {
			fade_message = '';
			generatedJoinCode = res.joincode;
		}
	}

	async function joinOrgWithCode() {
		let res = (await api.post(
			'tnt/join',
			{ joincode: joinorgwithcode },
			user.sessionToken
		)) as Record<string, any>;
		if (res.message) setFadeMessage(res.message);
	}

	let userInfoNotChange = true;

	function onInputChange() {
		userInfoNotChange = false;
		console.log('userInfoNotChange');
	}
</script>

<svelte:head>
	<title>Settings • HyperFlow</title>
</svelte:head>
<Container>
	<TabContent>
		<TabPane tabId="personal" tab="Personal" active>
			<h1 class="text-xs-center">Personel</h1>
			<form on:submit|preventDefault={save}>
				<Container>
					<Row cols="2">
						<Col>
							<input
								class="form-control"
								type="text"
								placeholder="URL of profile picture"
								bind:value={user.avatar}
								on:input={() => {
									onInputChange();
								}}
							/>
						</Col>
						<Col>
							<input
								class="form-control form-control-lg"
								type="text"
								placeholder="Username"
								bind:value={user.username}
								on:input={() => {
									onInputChange();
								}}
							/>
						</Col>
						<Col>
							<input
								class="form-control form-control-lg"
								type="email"
								placeholder="Email"
								bind:value={user.email}
								on:input={() => {
									onInputChange();
								}}
							/>
						</Col>
						<Col>
							<input
								class="form-control form-control-lg"
								type="password"
								placeholder="New Password"
								bind:value={user.password}
								on:input={() => {
									onInputChange();
								}}
							/>
						</Col>
						<Col>
							<button
								class="btn btn-lg btn-primary pull-xs-right"
								type="submit"
								disabled={in_progress || userInfoNotChange}
							>
								Update Settings
							</button>
						</Col>
					</Row>
				</Container>
			</form>
			<Container class="mt-5">
				<Row cols="1">
					<Col>
						<InputGroup>
							<InputGroupText>Join Org with joincode:</InputGroupText>
							<Input bind:value={joinorgwithcode} placeholder="Orgniazation name" />
							<Button
								color="primary"
								on:click={(e) => {
									e.preventDefault();
									joinOrgWithCode();
								}}
							>
								Join
							</Button>
						</InputGroup>
					</Col>
				</Row>
			</Container>
			<Fade isOpen={fade_message != ''}>
				<Card body>
					{fade_message}
				</Card>
			</Fade>
		</TabPane>
		<TabPane tabId="tenant" tab="Org">
			<h1 class="text-xs-center">Orgnization</h1>
			<Container>
				<Row cols="1">
					<Col>
						<InputGroup>
							<InputGroupText>Set Org Name to:</InputGroupText>
							<Input bind:value={orgname} placeholder="Orgniazation name" />
							<Button
								color="primary"
								on:click={(e) => {
									e.preventDefault();
									setMyTenantName();
								}}
							>
								Set
							</Button>
						</InputGroup>
					</Col>
					<Col class="mt-3 mt-1">
						<InputGroup>
							<InputGroupText>Generated Join Code</InputGroupText>
							<Input bind:value={generatedJoinCode} />
							<Button
								color="primary"
								on:click={(e) => {
									e.preventDefault();
									generateJoinCode();
								}}
							>
								Generate Now
							</Button>
						</InputGroup>
					</Col>
					<Col class="mt-3 mt-1">
						<InputGroup>
							<InputGroupText>Self-defined Join Code</InputGroupText>
							<Input bind:value={userDefinedJoinCode} />
							<Button
								color="primary"
								on:click={(e) => {
									e.preventDefault();
									setUserDefinedJoinCode();
								}}
							>
								Use it
							</Button>
						</InputGroup>
					</Col>
				</Row>
				<Fade isOpen={fade_message != ''} class="mt-3">
					<Card body>
						{fade_message}
					</Card>
				</Fade>
			</Container>
		</TabPane>
		<TabPane tabId="members" tab="Members">
			<h1 class="text-xs-center">Members</h1>
			<Container>
				<Row cols="1" />
				<Col>
					<FormGroup>
						<Label for="input_members">Paste Members</Label>
						<Input type="textarea" name="text" id="input_members" bind:value={input_members} />
					</FormGroup>
				</Col>
				<Col>
					<Button
						disabled={in_progress}
						on:click={(e) => {
							e.preventDefault();
							save_new_members();
						}}>Save</Button
					>
					{JSON.stringify(membersToAdd)}
				</Col>
				<Col>
					<table class="w-100">
						<thead>
							<tr> <th> Email</th> <th>Display Nme</th> <th> Status </th> </tr>
						</thead>
						<tbody>
							{#each membersToAdd as member, index (member)}
								<tr
									transition:scale|local={{ start: 0.7 }}
									animate:flip={{ duration: 200 }}
									class:odd={index % 2 !== 0}
									class:even={index % 2 === 0}
								>
									<td data-label="Email">
										{member.email}
									</td>
									<td data-label="Display Name">{member.displayName}</td>
									<td> {member.status} </td>
								</tr>
							{/each}
						</tbody>
					</table>
				</Col>
			</Container>
		</TabPane>
	</TabContent>
</Container>
