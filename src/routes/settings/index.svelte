<script lang="ts">
	import { _ } from '$lib/i18n';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Container, Row, Col } from 'sveltestrap';

	import { title } from '$lib/title';
	$title = 'HyperFlow';
	let user = $session.user;
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
		<Col class="mt-2 d-flex align-items-stretch">
			<div class="card w-100">
				<div class="card-header">{$_('setting.personal.nav')}</div>
				<div class="card-body">
					<div class="row">
						<div class="col-auto">
							<i class="fs-1 bi bi-person-workspace" />
						</div>
						<div class="col">
							<h5 class="card-title">{$_('setting.personal.title')}</h5>
							<p class="card-text">{$_('setting.personal.body')}</p>
						</div>
					</div>
				</div>
				<div class="card-footer text-muted text-end">
					<a
						href={'#'}
						class="btn btn-success"
						on:click|preventDefault={(e) => goto('settings/personal')}>
						{$_('setting.personal.action')}
					</a>
				</div>
			</div>
		</Col>
		<Col class="mt-2 d-flex align-items-stretch">
			<div class="card w-100">
				<div class="card-header">{$_('setting.delegation.nav')}</div>
				<div class="card-body">
					<div class="row">
						<div class="col-auto">
							<i class="fs-1 bi bi-person-hearts" />
						</div>
						<div class="col">
							<h5 class="card-title">{$_('setting.delegation.title')}</h5>
							<p class="card-text">{$_('setting.delegation.body')}</p>
						</div>
					</div>
				</div>
				<div class="card-footer text-muted text-end">
					<a
						href={'#'}
						class="btn btn-success"
						on:click|preventDefault={(e) => goto('settings/delegation')}>
						{$_('setting.delegation.action')}
					</a>
				</div>
			</div>
		</Col>
		<Col class="mt-2 d-flex align-items-stretch">
			<div class="card w-100">
				<div class="card-header">{$_('setting.myfiles.nav')}</div>
				<div class="card-body">
					<div class="row">
						<div class="col-auto">
							<i class="fs-1 bi bi-cloud" />
						</div>
						<div class="col">
							<h5 class="card-title">{$_('setting.myfiles.title')}</h5>
							<p class="card-text">{$_('setting.myfiles.body')}</p>
						</div>
					</div>
				</div>
				<div class="card-footer text-muted text-end">
					<a
						href={'#'}
						class="btn btn-success"
						on:click|preventDefault={(e) => goto('settings/files')}>
						{$_('setting.myfiles.action')}
					</a>
				</div>
			</div>
		</Col>
		<Col class="mt-2 d-flex align-items-stretch">
			<div class="card w-100">
				<div class="card-header">{$_('setting.tenant.nav')}</div>
				<div class="card-body">
					<div class="row">
						<div class="col-auto">
							<i class="fs-1 bi bi-diagram-3" />
						</div>
						<div class="col">
							<h5 class="card-title">{$_('setting.tenant.title')}</h5>
							<p class="card-text">{$_('setting.tenant.body')}</p>
						</div>
					</div>
				</div>
				<div class="card-footer text-muted text-end">
					<a
						href={'#'}
						class="btn btn-success"
						on:click|preventDefault={(e) => goto('settings/tenant')}>
						{$_('setting.tenant.action')}
					</a>
				</div>
			</div>
		</Col>
		<Col class="mt-2 d-flex align-items-stretch">
			<div class="card w-100">
				<div class="card-header">{$_('setting.smtp.nav')}</div>
				<div class="card-body">
					<div class="row">
						<div class="col-auto">
							<i class="fs-1 bi bi-envelope-paper" />
						</div>
						<div class="col">
							<h5 class="card-title">{$_('setting.smtp.title')}</h5>
							<p class="card-text">{$_('setting.smtp.body')}</p>
						</div>
					</div>
				</div>
				<div class="card-footer text-muted text-end">
					<a
						href={'#'}
						class="btn btn-success"
						on:click|preventDefault={(e) => goto('settings/smtp')}>
						{$_('setting.smtp.action')}
					</a>
				</div>
			</div>
		</Col>
		<Col class="mt-2 d-flex align-items-stretch">
			<div class="card w-100">
				<div class="card-header">{$_('setting.team.nav')}</div>
				<div class="card-body">
					<div class="row">
						<div class="col-auto">
							<i class="fs-1 bi bi-people" />
						</div>
						<div class="col">
							<h5 class="card-title">{$_('setting.team.title')}</h5>
							<p class="card-text">{$_('setting.team.body')}</p>
						</div>
					</div>
				</div>
				<div class="card-footer text-muted text-end">
					<a href={'#'} class="btn btn-success" on:click|preventDefault={(e) => goto('/team')}>
						{$_('setting.team.action')}
					</a>
				</div>
			</div>
		</Col>
		<Col class="mt-2 d-flex align-items-stretch">
			<div class="card w-100">
				<div class="card-header">{$_('setting.wecombot.nav')}</div>
				<div class="card-body">
					<div class="row">
						<div class="col-auto">
							<i class="fs-1 bi bi-chat-square-text" />
						</div>
						<div class="col">
							<h5 class="card-title">{$_('setting.wecombot.title')}</h5>
							<p class="card-text">{$_('setting.wecombot.body')}</p>
						</div>
					</div>
				</div>
				<div class="card-footer text-muted text-end">
					<a
						href={'#'}
						class="btn btn-success"
						on:click|preventDefault={(e) => goto('settings/wecombot')}>
						{$_('setting.wecombot.action')}
					</a>
				</div>
			</div>
		</Col>
		<Col class="mt-2 d-flex align-items-stretch">
			<div class="card w-100">
				<div class="card-header">{$_('setting.list.nav')}</div>
				<div class="card-body">
					<div class="row">
						<div class="col-auto">
							<i class="fs-1 bi bi-list-columns-reverse" />
						</div>
						<div class="col">
							<h5 class="card-title">{$_('setting.list.title')}</h5>
							<p class="card-text">{$_('setting.list.body')}</p>
						</div>
					</div>
				</div>
				<div class="card-footer text-muted text-end">
					<a
						href={'#'}
						class="btn btn-success"
						on:click|preventDefault={(e) => goto('settings/list')}>
						{$_('setting.list.action')}
					</a>
				</div>
			</div>
		</Col>
		<Col class="mt-2 d-flex align-items-stretch">
			<div class="card w-100">
				<div class="card-header">{$_('setting.maintainance.nav')}</div>
				<div class="card-body">
					<div class="row">
						<div class="col-auto">
							<i class="fs-1 bi bi-tools" />
						</div>
						<div class="col">
							<h5 class="card-title">{$_('setting.maintainance.title')}</h5>
							<p class="card-text">{$_('setting.maintainance.body')}</p>
						</div>
					</div>
				</div>
				<div class="card-footer text-muted text-end">
					<a
						href={'#'}
						class="btn btn-success"
						on:click|preventDefault={(e) => goto('settings/maintainance')}>
						{$_('setting.maintainance.action')}
					</a>
				</div>
			</div>
		</Col>
	</Row>
</Container>
