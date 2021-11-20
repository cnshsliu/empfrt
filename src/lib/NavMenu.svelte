<script lang="ts">
	import { page, session } from '$app/stores';
	import { title } from '$lib/title';
	import {
		Button,
		Row,
		Col,
		Icon,
		Styles,
		Collapse,
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

	let user = $session.user;
</script>

{#if user && user.tenant && user.tenant.css}
	<link href={user.tenant.css} rel="stylesheet" type="text/css" />
{/if}
<Styles />
{#if $page.query.has('iframe') === false}
	<Navbar class="light px-5 kfknavbar" light expand="md">
		<NavbarBrand href="/">
			<Container>
				<Row cols="2" class="d-flex w-100 align-items-center">
					<Col class="kfk-org-logo org-logo" />
					<Col>Metatocome</Col>
				</Row>
			</Container>
		</NavbarBrand>
		<NavbarToggler on:click={() => (isMenuOpen = !isMenuOpen)} />
		<Nav class="ms-auto" navbar>
			{#if user}
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
					{#if user && user.avatar}
						<DropdownToggle nav>
							<img src={user.avatar} class="kfk-avatar-small img-thumbnail" alt={user.username} />
						</DropdownToggle>
					{:else}
						<DropdownToggle nav>
							<div class="kfk-avatar-letter-small">
								{user ? user.username : 'ME'}
							</div>
						</DropdownToggle>
					{/if}
					<DropdownMenu end>
						<Container style="width:300px; text-align:center;">
							<Row cols="1">
								<Col>
									{#if user}
										{#if user.avatar}
											<img
												src={user.avatar}
												class="kfk-avatar-middle  img-thumbnail"
												alt={user.username}
											/>
										{:else}
											<div class="kfk-avatar-letter-middle">
												{user.username}
											</div>
										{/if}
									{:else}
										<div class="kfk-avatar-letter-middle img-thumbnail">ME</div>
									{/if}
								</Col>
								<Col class="fw-bold mt-2">{user ? user.username : ''}</Col>
								<Col>{user && user.tenant ? user.tenant.name : ''}</Col>
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
</style>
