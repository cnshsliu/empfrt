<script lang="ts">
	import { _ } from '$lib/i18n';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Container, Row, Col } from 'sveltestrap';

	import { title } from '$lib/title';
	$title = 'HyperFlow';
	let user = $session.user;
	const sections = [
		{
			icon: 'bi-person-workspace',
			header: $_('setting.personal.nav'),
			title: $_('setting.personal.nav'),
			body: $_('setting.personal.body'),
			dest: 'settings/personal',
			button: $_('setting.personal.action'),
		},
		{
			icon: 'bi-diagram-3',
			header: $_('setting.tenant.nav'),
			title: $_('setting.tenant.nav'),
			body: $_('setting.tenant.body'),
			dest: 'settings/tenant',
			button: $_('setting.tenant.action'),
		},
		{
			icon: 'bi-person-hearts',
			header: $_('setting.delegation.nav'),
			title: $_('setting.delegation.nav'),
			body: $_('setting.delegation.body'),
			dest: 'settings/delegation',
			button: $_('setting.delegation.action'),
		},
		{
			icon: 'bi-cloud',
			header: $_('setting.myfiles.nav'),
			title: $_('setting.myfiles.nav'),
			body: $_('setting.myfiles.body'),
			dest: 'settings/myfiles',
			button: $_('setting.myfiles.action'),
		},
		{
			icon: 'bi-envelope-paper',
			header: $_('setting.smtp.nav'),
			title: $_('setting.smtp.nav'),
			body: $_('setting.smtp.body'),
			dest: 'settings/smtp',
			button: $_('setting.smtp.action'),
		},
		{
			icon: 'bi-people',
			header: $_('setting.team.nav'),
			title: $_('setting.team.nav'),
			body: $_('setting.team.body'),
			dest: '/team',
			button: $_('setting.team.action'),
		},
		{
			icon: 'bi-chat-square-text',
			header: $_('setting.wecombot.nav'),
			title: $_('setting.wecombot.nav'),
			body: $_('setting.wecombot.body'),
			dest: 'settings/wecombot',
			button: $_('setting.wecombot.action'),
		},
		{
			icon: 'bi-list-columns-reverse',
			header: $_('setting.list.nav'),
			title: $_('setting.list.nav'),
			body: $_('setting.list.body'),
			dest: 'settings/list',
			button: $_('setting.list.action'),
		},
		{
			icon: 'bi-tools',
			header: $_('setting.maintainance.nav'),
			title: $_('setting.maintainance.nav'),
			body: $_('setting.maintainance.body'),
			dest: 'settings/maintainance',
			button: $_('setting.maintainance.action'),
		},
	];
</script>

<svelte:head>
	<title>Settings • HyperFlow</title>
</svelte:head>
<Container class="mt-3">
	<nav aria-label="breadcrumb">
		<ol class="breadcrumb">
			<li class="breadcrumb-item">
				{$_('navmenu.settings')}
			</li>
		</ol>
	</nav>
	<Row cols={{ xs: 1, md: 2, lg: 3, xl: 4 }} class="mt-2 d-flex align-items-stretch">
		{#each sections as section}
			<Col class="mt-2 d-flex align-items-stretch">
				<div class="card w-100">
					<div class="card-header">{section.header}</div>
					<div class="card-body">
						<div class="row">
							<div class="col-auto">
								<i class={'fs-1 bi ' + section.icon} />
							</div>
							<div class="col">
								<h5 class="card-title">{section.title}</h5>
								<p class="card-text">{section.body}</p>
							</div>
						</div>
					</div>
					<div class="card-footer text-muted text-end">
						<a
							href={'#'}
							class="btn btn-success"
							on:click|preventDefault={(e) => goto(section.dest)}>
							{section.button}
						</a>
					</div>
				</div>
			</Col>
		{/each}
	</Row>
</Container>
