<script type="ts">
	import { session } from '$app/stores';
	import { API_SERVER } from '$lib/Env';
	import { onMount } from 'svelte';
	let user = $session.user;

	let serverUrl: string = API_SERVER + '/filedrop';
	let dropArea;

	onMount(async () => {
		console.log('onMount');
		dropArea = document.getElementById('droparea');
		dropArea.addEventListener('drop', async function (e) {
			e.preventDefault();
			e.dataTransfer.effectAllowed = 'copy';
			e.dataTransfer.dropEffect = 'copy';
			console.log(e.dataTransfer.files);
		});
	});
</script>

<div id="droparea" class="w-100" style="height:200px">Drop file here</div>
