<script lang="ts">
	import { page, session } from '$app/stores';
	import { title } from '$lib/title';
	import {
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

	let isMenuOpen = false;

	function handleUpdate(event) {
		isMenuOpen = event.detail.isOpen;
	}
	async function logout() {
		await post(`auth/logout`);

		// this will trigger a redirect, because it
		// causes the `load` function to run again
		$session.user = null;
	}
</script>

<Styles />
<Navbar class="light px-5 kfknavbar" light expand="md">
	<NavbarBrand href="/">HyperFlow</NavbarBrand>
	<NavbarToggler on:click={() => (isMenuOpen = !isMenuOpen)} />
	<Nav class="ms-auto" navbar>
		{#if $session.user}
			<NavItem>
				<NavLink rel="prefetch" href="/template" active={$page.path === '/template'}>
					<Icon name="code-square" />&nbsp;Template
				</NavLink>
			</NavItem>
			<NavItem>
				<NavLink rel="prefetch" href="/team" active={$page.path === '/team'}>
					<Icon name="person-lines-fill" />&nbsp;Team
				</NavLink>
			</NavItem>
			<NavItem>
				<NavLink rel="prefetch" href="/work" active={$page.path === '/work'}>
					<Icon name="list-check" />&nbsp;Worklist
				</NavLink>
			</NavItem>
			<NavItem>
				<NavLink rel="prefetch" href="/workflow" active={$page.path === '/workflow'}>
					<Icon name="bar-chart-steps" />&nbsp;Workflow
				</NavLink>
			</NavItem>
			<Dropdown>
				<DropdownToggle nav caret>Me</DropdownToggle>
				<DropdownMenu end>
					<DropdownItem
						on:click={(e) => {
							goto('settings');
						}}
					>
						{$session.user.username}
					</DropdownItem>
					<DropdownItem divider />
					<DropdownItem
						on:click={(e) => {
							goto('settings');
						}}
					>
						<Icon name="gear" />&nbsp;Settings
					</DropdownItem>
					<DropdownItem divider />
					<DropdownItem on:click={logout}><Icon name="door-open" />Logout</DropdownItem>
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
