<script type="ts">
	import { session } from '$app/stores';
	import { API_SERVER } from '$lib/Env';
	import FilePond, { registerPlugin, supported } from 'svelte-filepond';
	import { setOptions } from 'filepond';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	let user = $session.user;
	export let uploadedFiles = [];

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
		console.log('A file has been added', fileItem);
		console.log('A file has been added', fileItem.id, fileItem.serverId);
	}
	function handleRemoveFile(err, fileItem) {
		console.log('A file has been removed', fileItem.id, fileItem.serverId, fileItem);
		uploadedFiles = uploadedFiles.filter((x) => {
			return x.id !== fileItem.id;
		});
	}
	function handleProcessFile(err, fileItem) {
		console.log('A file has been processed', fileItem.id, fileItem.serverId, fileItem);
		uploadedFiles.push({ id: fileItem.id, serverId: fileItem.serverId });
	}
	function handleProcessFiles(err) {
		dispatch('uploaded', 'Uploaded');
	}
</script>

<FilePond
	bind:this={pond}
	{name}
	allowMultiple={true}
	oninit={handleInit}
	onaddfile={handleAddFile}
	onremovefile={handleRemoveFile}
	onprocessfile={handleProcessFile}
	onprocessfiles={handleProcessFiles}
/>

<style global>
	@import 'filepond/dist/filepond.css';
	@import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
	.filepond--credits {
		display: none;
	}
</style>
