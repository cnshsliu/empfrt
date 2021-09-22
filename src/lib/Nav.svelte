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
					<a rel="prefetch" href="/team" class="nav-link" class:active={$page.path === '/team'}>
						<i class="ion-compose" />&nbsp;Team
					</a>
				</li>

				<li class="nav-item">
					<a
						rel="prefetch"
						href="/worklist"
						class="nav-link"
						class:active={$page.path === '/worklist'}
					>
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
