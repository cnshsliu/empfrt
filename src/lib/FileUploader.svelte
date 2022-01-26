<script type="ts">
	import { session } from '$app/stores';
	import { API_SERVER } from '$lib/Env';
	import FilePond, { registerPlugin, supported } from 'svelte-filepond';
	import { setOptions } from 'filepond';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	let user = $session.user;
	export let uploadedFiles = [];
	export let allowRemove = false;
	export let allowMultiple = false;
	export let maxFiles = 5;

	// Import the Image EXIF Orientation and Image Preview plugins
	// Note: These need to be installed separately
	// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation --save`
	//import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
	//import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

	// Register the plugins
	//registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);
	let serverUrl: string = API_SERVER + '/filepond';
	setOptions({
		server: {
			url: serverUrl,
			process: {
				url: '/process',
				headers: {
					authorization: user.sessionToken
				}
			},
			revert: {
				url: '/revert',
				headers: {
					authorization: user.sessionToken
				}
			},
			restore: '/restore?id=',
			fetch: '/fetch?data='
		},
		labelIdle: 'Drag file to here as PBO, or Browse'
	});

	// a reference to the component, used to call FilePond methods
	let pond;

	// pond.getFiles() will return the active files

	// the name to use for the internal file input
	let name = 'filepond';

	// handle filepond events
	function handleInit() {
		console.log('FilePond has initialised');
	}

	function handleAddFile(err, fileItem) {
		dispatch('uploading', 'Uploading');
	}
	function handleRemoveFile(err, fileItem) {
		recheckFiles();
		dispatch('remove', fileItem);
	}
	function handleProcessFile(err, fileItem) {
		console.log('A file has been processed', fileItem.id, fileItem.serverId, fileItem);
	}
	function handleProcessFiles(err) {
		recheckFiles();
		dispatch('uploaded', uploadedFiles);
	}
	function handleWarning(err) {
		recheckFiles();
		dispatch('warning', uploadedFiles);
	}
	function handleError(err) {
		recheckFiles();
		dispatch('error', uploadedFiles);
	}
	function recheckFiles() {
		let pondFiles = pond.getFiles();
		uploadedFiles = pondFiles.map((f) => {
			return { id: f.id, serverId: f.serverId };
		});
		uploadedFiles = uploadedFiles.filter((x) => x.serverId);
	}
</script>

<FilePond
	bind:this={pond}
	{name}
	oninit={handleInit}
	onaddfile={handleAddFile}
	onremovefile={handleRemoveFile}
	onprocessfile={handleProcessFile}
	onprocessfiles={handleProcessFiles}
	onwarning={handleWarning}
	onerror={handleError}
	allowRevert={allowRemove}
	{allowRemove}
	{allowMultiple}
	{maxFiles}
/>

<style global>
	@import 'filepond/dist/filepond.css';
	@import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
	.filepond--credits {
		display: none;
	}
</style>
