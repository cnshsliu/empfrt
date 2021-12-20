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
	import * as api from '$lib/api';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import {
		Button,
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
	import { whichTabStore } from '$lib/empstores';
	import { onMount } from 'svelte';

	let isMenuOpen = true;

	const toggle = () => (isMenuOpen = !isMenuOpen);
	async function logout() {
		await post(`/auth/logout`);
		whichTabStore.set(null);

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
	});
</script>

{#if $session.user && $session.user.tenant && $session.user.tenant.css}
	<link href={$session.user.tenant.css} rel="stylesheet" type="text/css" />
{/if}
{#if $page.query.has('iframe') === false}
	<div class={navmenu_class}>
		<Navbar id="myNavBar" class="flex-fill kfk-w-75 " expand="sm">
			<div class="d-flex">
				<div class="d-inline-block col-6 p-0 ml-3">
					<div class="kfk-org-logo org-logo">&nbsp;</div>
				</div>
				<div
					class="d-inline-block col-6 mx-1 align-self-center kfk-header-username tnt-header-username"
				>
					{$session.user ? $session.user.username : 'Metatocome'}
				</div>
			</div>
			<button
				class="navbar-toggler"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarSupportedContent"
				aria-controls="navbarSupportedContent"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon" />
			</button>
			<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<Nav class="ms-auto">
					<NavItem>
						<NavLink href="/" class="py-2 ps-0 pe-3" active={$page.path === '/'}>Home</NavLink>
					</NavItem>
					<NavItem>
						<NavLink href="/docs" class="py-2 ps-0 pe-3" active={$page.path === '/docs'}
							>Docs</NavLink
						>
					</NavItem>
					{#if $session.user}
						<NavItem>
							<NavLink class="py-2 ps-0 pe-3" href="/template" active={$page.path === '/template'}>
								Template
							</NavLink>
						</NavItem>
						<NavItem>
							<NavLink class="py-2 ps-0 pe-3" href="/workflow" active={$page.path === '/workflow'}>
								Workflow
							</NavLink>
						</NavItem>
						<NavItem>
							<NavLink class="py-2 ps-0 pe-3" href="/work" active={$page.path === '/work'}>
								Worklist
							</NavLink>
						</NavItem>
						<Dropdown>
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
										<Col
											>{$session.user && $session.user.tenant ? $session.user.tenant.name : ''}
										</Col>
										<Col>{DEPLOY_MODE === 'private' ? 'ENTERPRISE' : 'SaaS'}</Col>
									</Row>
								</Container>
								<DropdownItem divider />
								<DropdownItem
									class="text-center"
									on:click={(e) => {
										goto('/settings');
									}}
								>
									Settings
								</DropdownItem>
								<DropdownItem
									class="text-center"
									on:click={(e) => {
										goto('/team');
									}}
								>
									Teaming
								</DropdownItem>
								<DropdownItem
									class="text-center"
									on:click={(e) => {
										goto('/comment');
									}}
								>
									Messages
								</DropdownItem>
								<DropdownItem divider />
								<DropdownItem class="text-center" on:click={logout}>
									<Icon name="door-open" /> Logout
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					{:else}
						<NavItem>
							<NavLink href="/login" class="nav-link" active={$page.path === '/login'}
								>Sign in</NavLink
							>
						</NavItem>
						<NavItem>
							<NavLink href="/register" class="nav-link" active={$page.path === '/register'}>
								Sign up
							</NavLink>
						</NavItem>
					{/if}
				</Nav>
			</div>
		</Navbar>
	</div>
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
		width: 36px;
		height: 36px;
		border-radius: 18px;
		border: 1px solid rgba(200, 200, 255, 0.8);
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
	.navbar-toggler-icon {
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%280, 0, 0, 0.55%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
	}
</style>
