<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import { _, mtcDate } from '$lib/i18n';
	import * as api from '$lib/api';
	import { Row, Col, Button, Icon } from 'sveltestrap';
	import { session } from '$app/stores';
	import FileUploader from '$lib/FileUploader.svelte';
	let uploadingFile;
	let uploadedFiles = [];

	export let work: any;
	function downloadFile(serverId, realName) {
		fetch(`${API_SERVER}/filepond/viewer/${serverId}`, {
			headers: {
				Authorization: $session.user.sessionToken
			}
		})
			.then((res) => {
				return res.blob();
			})
			.then((data) => {
				var a = document.createElement('a');
				a.href = window.URL.createObjectURL(data);
				a.download = realName;
				a.click();
			});
	}

	async function setPbo() {
		let ret = await api.post(
			'workflow/addFilePbo',
			{ wfid: work.wfid, pondfiles: uploadedFiles },
			$session.user.sessionToken
		);
		if (ret && Array.isArray(ret)) {
			work.wf.pbo = ret;
		}
	}
	const removePbo = async function (pbo) {
		let ret = await api.post(
			'workflow/removePbo',
			{ wfid: work.wfid, pbo: pbo },
			$session.user.sessionToken
		);
		if (ret && Array.isArray(ret)) {
			work.wf.pbo = ret;
		}
	};
</script>

<Row>
	<Col>
		<Icon name="vinyl" />&nbsp;
		{$_('todo.pbo')}
		{#each work.wf.pbo as pbo}
			<div class=" ms-3 simplehover ">
				{#if pbo.serverId && pbo.realName}
					<a
						href={'#'}
						on:click|preventDefault={() => {
							downloadFile(pbo.serverId, pbo.realName);
						}}
						>{pbo.realName}
					</a>
				{:else}
					<a href={pbo} target="_blank"> {pbo} </a>
				{/if}
				({pbo.author ? pbo.author.substring(0, pbo.author.indexOf('@')) : ''})
				<Icon name="box-arrow-up-right" />
				<a
					href={'#'}
					on:click|preventDefault={(e) => {
						removePbo({
							serverId: pbo.serverId
						});
					}}
				>
					<i class="bi bi-trash" />
				</a>
			</div>
		{/each}
	</Col>
	{#if work.status === 'ST_RUN'}
		<Col>
			<FileUploader
				on:uploading={(e) => {
					uploadingFile = true;
				}}
				on:remove={async (e) => {
					uploadingFile = false;
					let serverId = null;
					for (let i = 0; i < uploadedFiles.length; i++) {
						if (uploadedFiles[i].id === e.detail.id) {
							serverId = uploadedFiles[i].serverId;
							break;
						}
					}
					if (serverId) {
						await removePbo({ id: e.detail.id, serverId: serverId });
					}
				}}
				on:uploaded={async (e) => {
					uploadingFile = false;
					uploadedFiles = e.detail;
					console.log(uploadedFiles);
					await setPbo();
				}}
				on:warning={async (e) => {
					uploadingFile = false;
					uploadedFiles = e.detail;
					console.log(uploadedFiles);
					await setPbo();
				}}
				on:error={async (e) => {
					uploadingFile = false;
					uploadedFiles = e.detail;
					console.log(uploadedFiles);
					await setPbo();
				}}
			/>
		</Col>
	{/if}
</Row>
