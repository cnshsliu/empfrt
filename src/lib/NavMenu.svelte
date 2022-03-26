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
	import { _ } from '$lib/i18n';
	import { page, session } from '$app/stores';
	import { Input, InputGroup, InputGroupText, Row, Col, Icon, Container } from 'sveltestrap';
	import LocaleSwitcher from '$lib/LocaleSwitcher.svelte';
	import {
		Row,
		Col,
		Icon,
		Navbar,
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
	import { DEPLOY_MODE } from '$lib/Env';
	import { whichTabStorage } from '$lib/empstores';
	import { onMount } from 'svelte';

	let isMenuOpen = true;

	const toggle = () => (isMenuOpen = !isMenuOpen);
	async function logout() {
		await post(`/auth/logout`);

		whichTabStorage.set(null);
		try {
			localStorage.clear();
		} catch (e) {}

		// this will trigger a redirect, because it
		// causes the `load` function to run again
		try {
			$session = {};
		} catch (e) {}
	}

	//To let navmenu stick to top only when scrollTop < 200, DO: AAA-*
	//AAA-1: uncomment next line
	//let navmenu_class = 'light kfk-navmenu tnt-navmenu d-flex justify-content-center';
	//AAA-2: comment next line
	let navmenu_class = 'light kfk-navmenu tnt-navmenu d-flex justify-content-center sticky-top';

	function myFunction() {
		if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
			navmenu_class = 'light kfk-navmenu tnt-navmenu d-flex justify-content-center';
		} else {
			navmenu_class = 'light kfk-navmenu tnt-navmenu d-flex justify-content-center sticky-top';
		}
	}

	onMount(async () => {
		//AAA-2: uncomment next 2 lines
		/* window.onscroll = function () {
			myFunction();
		}; */
		document.onkeyup = (e) => {
			if (e.ctrlKey && e.key === '1') {
				goto('/template');
			} else if (e.ctrlKey && e.key === '2') {
				goto('/workflow');
			} else if (e.ctrlKey && e.key === '3') {
				goto('/work');
			}
		};
	});
</script>

{#if $session.user && $session.user.tenant && $session.user.tenant.css}
	<link href={$session.user.tenant.css} rel="stylesheet" type="text/css" />
{/if}
{#if $page.query.has('iframe') === false}
	<div class={navmenu_class}>
		<Navbar id="myNavBar" class="flex-fill" expand="sm">
			<div class="d-flex">
				<div class="d-inline-block col-6 p-0 ml-3">
					<div
						class="kfk-org-logo org-logo"
						on:click={() => {
							goto('/');
						}}
					>
						&nbsp;
					</div>
				</div>
				<div
					class="d-inline-block col-6 ms-3 align-self-center kfk-header-username tnt-header-username"
				>
					{$session.user ? $session.user.username : 'Metatocome'}
				</div>
			</div>
			{#if $session.user}
				<Dropdown class="navbar-expand-sm">
					{#if $session.user && $session.user.avatar}
						<DropdownToggle nav>
							<img
								src={$session.user.avatar}
								class="kfk-avatar-small"
								alt={$session.user.username}
							/>
						</DropdownToggle>
					{:else}
						<DropdownToggle nav>
							<div class="kfk-avatar-letter-small text-center">
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
								<Col>{DEPLOY_MODE}</Col>
							</Row>
							<InputGroup>
								<InputGroupText>
									<i class="bi-translate" />
								</InputGroupText>
								<LocaleSwitcher />
							</InputGroup>
						</Container>
						<DropdownItem divider />
						<DropdownItem
							class="text-center"
							on:click={(e) => {
								goto('/settings');
							}}
						>
							{$_('navmenu.settings')}
						</DropdownItem>
						<DropdownItem
							class="text-center"
							on:click={(e) => {
								goto('/comment');
							}}
						>
							{$_('navmenu.messages')}
						</DropdownItem>
						<DropdownItem divider />
						<DropdownItem class="text-center" on:click={logout}>
							<Icon name="door-open" />
							{$_('account.signout')}
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			{/if}
			<button
				class="navbar-toggler bg-light border border-primary"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarSupportedContent"
				aria-controls="navbarSupportedContent"
				aria-expanded="true"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon" />
			</button>
			<div class="collapse navbar-collapse show" id="navbarSupportedContent">
				<Nav class="ms-auto">
					<NavItem>
						<NavLink href="/" class="py-2 ps-0 pe-3" active={$page.path === '/'}>
							{$_('navmenu.home')}
						</NavLink>
					</NavItem>
					<NavItem>
						<NavLink href="/docs" class="py-2 ps-0 pe-3">
							{$_('navmenu.doc')}
						</NavLink>
					</NavItem>
					{#if $session.user}
						<NavItem>
							<NavLink class="py-2 ps-0 pe-3" href="/template" active={$page.path === '/template'}>
								{$_('navmenu.planning')}
							</NavLink>
						</NavItem>
						<NavItem>
							<NavLink class="py-2 ps-0 pe-3" href="/workflow" active={$page.path === '/workflow'}>
								{$_('navmenu.workflow')}
							</NavLink>
						</NavItem>
						<NavItem>
							<NavLink class="py-2 ps-0 pe-3" href="/work" active={$page.path === '/work'}>
								{$_('navmenu.worklist')}
							</NavLink>
						</NavItem>
					{:else}
						<NavItem>
							<NavLink href="/login" class="nav-link" active={$page.path === '/login'}>
								{$_('account.signin')}
							</NavLink>
						</NavItem>
						<NavItem>
							<NavLink href="/register" class="nav-link" active={$page.path === '/register'}>
								{$_('account.signup')}
							</NavLink>
						</NavItem>
					{/if}
				</Nav>
			</div>
		</Navbar>
	</div>
{/if}

<style>
	.navbar-toggler-icon {
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%280, 0, 0, 0.55%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
	}
</style>
