<script lang="ts">
	import { page, session } from '$app/stores';
	import { title } from '$lib/title';
	import { Icon, Styles } from 'sveltestrap';
</script>

<Styles />

<nav class="navbar navbar-light kfknavbar">
	<div class="container">
		<a rel="prefetch" class="navbar-brand" href="/">{$title}</a>
		<ul class="nav navbar-nav pull-xs-right">
			<li class="nav-item">
				<a rel="prefetch" class="nav-link" class:active={$page.path === '/'} href="/">
					<Icon name="house" />
					Home
				</a>
			</li>

			{#if $session.user}
				<li class="nav-item">
					<a
						rel="prefetch"
						href="/template"
						class="nav-link"
						class:active={$page.path === '/template'}
					>
						<Icon name="code-square" />&nbsp;Template
					</a>
				</li>
				<li class="nav-item">
					<a rel="prefetch" href="/team" class="nav-link" class:active={$page.path === '/team'}>
						<Icon name="person-lines-fill" />&nbsp;Team
					</a>
				</li>

				<li class="nav-item">
					<a rel="prefetch" href="/work" class="nav-link" class:active={$page.path === '/work'}>
						<Icon name="list-check" />&nbsp;Worklist
					</a>
				</li>

				<li class="nav-item">
					<a
						rel="prefetch"
						href="/settings"
						class="nav-link"
						class:active={$page.path === '/settings'}
					>
						<Icon name="gear" />&nbsp;Settings
					</a>
				</li>

				<li class="nav-item">
					<a rel="prefetch" href="/profile/@{$session.user.email}" class="nav-link">
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
