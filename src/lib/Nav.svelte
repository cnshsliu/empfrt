<script lang="ts">
	import { page, session } from '$app/stores';
	import { Container, Col, Row } from 'sveltestrap';
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
	export let form_status = { create: false, search: false, sort: false };
	export let template: Template;
	export let user: User;
	export let lastSearchCondition: string = '';
	function hide_all_form() {
		Object.keys(form_status).forEach((key) => {
			form_status[key] = false;
		});
	}
	function show_create_template_form() {
		hide_all_form();
		form_status['create'] = true;
	}
	function show_search_template_form() {
		hide_all_form();
		form_status['search'] = true;
	}
</script>

<nav class="navbar navbar-light kfknavbar">
	<div class="container">
		<a rel="prefetch" class="navbar-brand" href="/">conduit</a>
		<ul class="nav navbar-nav pull-xs-right">
			<li class="nav-item">
				<a rel="prefetch" class="nav-link" class:active={$page.path === '/'} href="/">Home</a>
			</li>

			{#if $session.user}
				<li class="nav-item">
					<a
						rel="prefetch"
						href="/template"
						class="nav-link"
						class:active={$page.path === '/template'}
					>
						<i class="ion-compose" />&nbsp;Template
					</a>
				</li>
				<li class="nav-item">
					<a rel="prefetch" href="/editor" class="nav-link" class:active={$page.path === '/editor'}>
						<i class="ion-compose" />&nbsp;New Post
					</a>
				</li>

				<li class="nav-item">
					<a
						rel="prefetch"
						href="/settings"
						class="nav-link"
						class:active={$page.path === '/settings'}
					>
						<i class="ion-gear-a" />&nbsp;Settings
					</a>
				</li>

				<li class="nav-item">
					<a rel="prefetch" href="/profile/@{$session.user.userid}" class="nav-link">
						<!-- <img src={$user.image} class="user-pic" alt={$user.username}> -->
						{$session.user.username}
					</a>
				</li>
			{:else}
				<li class="nav-item">
					<a rel="prefetch" href="/login" class="nav-link" class:active={$page.path === '/login'}>
						Sign in
					</a>
				</li>

				<li class="nav-item">
					<a
						rel="prefetch"
						href="/register"
						class="nav-link"
						class:active={$page.path === '/register'}
					>
						Sign up
					</a>
				</li>
			{/if}
		</ul>
	</div>
</nav>
