<script lang="ts">
	import { title } from '$lib/title';
	import DocQuickStart from './_Quickstart.svelte';
	import DocIntroduction from './_Introduction.svelte';
	import DocSidebar from './_Sidebar.svelte';
	$title = 'HyperFlow';
	let tplid;
</script>

<svelte:head>
	<title>Metatocome Documents</title>
</svelte:head>
<div class="container-fluid">
	<div class="row flex-xl-nowrap">
		<div class="col-12 col-md-3 col-xl-2 bd-sidebar sticky-top">
			<DocSidebar />
		</div>
		<div class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content">
			<DocIntroduction />
			<DocQuickStart />
		</div>
		<div class="d-none d-xl-block col-xl-2 bd-toc">Toc</div>
	</div>
</div>
