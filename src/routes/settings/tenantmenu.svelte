<script type="ts">
	import { _ } from '$lib/i18n';
	import { goto } from '$app/navigation';

	const items = [
		{ target: '/settings', text: 'navmenu.settings' },
		{ target: '/settings/tenant', text: 'setting.tenant.nav' },
		{ target: '/settings/orgchart', text: 'setting.orgchart.nav' },
		{ target: '/settings/members', text: 'setting.members.nav' },
		{ target: '/settings/resign', text: 'setting.resign.nav' },
		{ target: '/settings/tenant_others', text: 'setting.tenant_others.nav' },
	];
</script>

<nav aria-label="breadcrumb">
	<ol class="breadcrumb">
		{#each items as item}
			<li class="breadcrumb-item kfk-tag">
				<a
					class="kfk-link"
					href={'#'}
					on:click={() => {
						goto(item.target);
					}}>
					{$_(item.text)}
				</a>
			</li>
		{/each}
	</ol>
</nav>
