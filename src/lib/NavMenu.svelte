<script context="module" lang="ts">
	export async function load({ page, session }) {
		const { user } = session;
		return {
			props: {
				user
			}
		};
	}
</script>

<script lang="ts">
	import { page, session } from '$app/stores';
	import {
		Button,
		Row,
		Col,
		Icon,
		Styles,
		Navbar,
		NavbarToggler,
		NavbarBrand,
		Nav,
		NavItem,
		NavLink,
		Dropdown,
		DropdownToggle,
		DropdownMenu,
		DropdownItem,
		Container
	} from 'sveltestrap';
	import { goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import { whichTabStore } from '$lib/empstores';

	let isMenuOpen = false;

	function handleUpdate(event) {
		isMenuOpen = event.detail.isOpen;
	}
	async function logout() {
		await post(`/auth/logout`);
		whichTabStore.set(null);

		// this will trigger a redirect, because it
		// causes the `load` function to run again
		$session.user = null;
	}

	export let user;
	user = $session.user;
</script>

{#if $session.user && $session.user.tenant && $session.user.tenant.css}
	<link href={$session.user.tenant.css} rel="stylesheet" type="text/css" />
{/if}
<Styles />
{#if $page.query.has('iframe') === false}
	<Navbar class="light px-5 kfknavbar" light expand="md">
		<NavbarBrand href="/">
			<Container>
				<Row cols="2" class="d-flex w-100 align-items-center">
					<Col>
						<div class="kfk-org-logo org-logo" />
					</Col>
					<Col>{$session.user ? $session.user.username : 'Metatocome'}</Col>
				</Row>
			</Container>
		</NavbarBrand>
		<NavbarToggler on:click={() => (isMenuOpen = !isMenuOpen)} />
		<Nav class="ms-auto" navbar>
			{#if $session.user}
				<NavItem>
					<NavLink rel="prefetch" href="/template" active={$page.path === '/template'}>
						<Icon name="code-square" />&nbsp;Template
					</NavLink>
				</NavItem>
				<NavItem>
					<NavLink rel="prefetch" href="/workflow" active={$page.path === '/workflow'}>
						<Icon name="bar-chart-steps" />&nbsp;Workflow
					</NavLink>
				</NavItem>
				<NavItem>
					<NavLink rel="prefetch" href="/work" active={$page.path === '/work'}>
						<Icon name="list-check" />&nbsp;Worklist
					</NavLink>
				</NavItem>
				<NavItem>
					<NavLink rel="prefetch" href="/team" active={$page.path === '/team'}>
						<Icon name="person-lines-fill" />&nbsp;Team
					</NavLink>
				</NavItem>
				<Dropdown>
					{#if $session.user && $session.user.avatar}
						<DropdownToggle nav>
							<img
								src={$session.user.avatar}
								class="kfk-avatar-small img-thumbnail"
								alt={$session.user.username}
							/>
						</DropdownToggle>
					{:else}
						<DropdownToggle nav>
							<div class="kfk-avatar-letter-small">
								{$session.user ? $session.user.username : 'ME'}
							</div>
						</DropdownToggle>
					{/if}
					<DropdownMenu end>
						<Container style="width:300px; text-align:center;">
							<Row cols="1">
								<Col style="text-align:center;">
									{#if $session.user}
										{#if $session.user.avatar}
											<img
												src={$session.user.avatar}
												class="kfk-avatar-middle  img-thumbnail"
												alt={$session.user.username}
											/>
										{:else}
											<div class="w-100 d-flex justify-content-center">
												<div class="kfk-avatar-letter-middle img-thumbnail">
													{$session.user.username}
												</div>
											</div>
										{/if}
									{:else}
										<div class="w-100 d-flex justify-content-center">
											<div class="kfk-avatar-letter-middle img-thumbnail">ME</div>
										</div>
									{/if}
								</Col>
								<Col class="fw-bold mt-2">{$session.user ? $session.user.username : ''}</Col>
								<Col>{$session.user && $session.user.tenant ? $session.user.tenant.name : ''}</Col>
								<Col class="mt-3">
									<Button
										on:click={(e) => {
											goto('/settings');
										}}
									>
										Manage your account
									</Button>
								</Col>
							</Row>
						</Container>
						<DropdownItem divider />
						<DropdownItem class="text-center" on:click={logout}>
							<Icon name="door-open" /> Logout
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			{:else}
				<NavItem>
					<NavLink rel="prefetch" href="/login" class="nav-link" active={$page.path === '/login'}>
						Sign in
					</NavLink>
				</NavItem>
				<NavItem>
					<NavLink
						rel="prefetch"
						href="/register"
						class="nav-link"
						active={$page.path === '/register'}
					>
						Sign up
					</NavLink>
				</NavItem>
			{/if}
		</Nav>
	</Navbar>
{/if}

<style>
	.kfk-avatar-small {
		width: 32px;
		height: 32px;
		border-radius: 16px;
	}
	.kfk-avatar-middle {
		width: 80px;
		height: 80px;
	}
	.kfk-avatar-letter-small {
		width: 32px;
		height: 32px;
		border-radius: 16px;
		background-color: rgba(0, 0, 255, 0.05);
		font-size: 24px;
		font-weight: bolder;
		overflow: hidden;
	}
	.kfk-avatar-letter-middle {
		width: 80px;
		height: 80px;
		background-color: rgba(0, 0, 255, 0.05);
		font-size: 36px;
		font-weight: bolder;
		overflow: hidden;
		text-align: cetner;
	}
</style>
