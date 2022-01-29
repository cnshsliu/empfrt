<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { Row, Col, Icon } from 'sveltestrap';
	import Confirm from '$lib/confirm.svelte';
	import { session } from '$app/stores';
	import FileUploader from '$lib/FileUploader.svelte';
	let theConfirm;
	let uploadingFile: boolean;
	let uploadedFiles = [];

	export let work;
	export let title;
	export let forWhat: string = 'workflow';
	export let forWhich: string = 'unknown';
	export let forKey: string = 'unknown';
	export let forKvar: string = null;
	export let uploader = true;
	function downloadFile(wfid, serverId, realName, mode = 'download') {
		fetch(`${API_SERVER}/filepond/viewer/${wfid}/${serverId}`, {
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
				if (mode === 'download') {
					a.download = realName;
				} else if (mode === 'newtab') {
					a.name = realName;
					a.target = '_blank';
				}
				a.click();
			});
	}

	async function addPondFileToEntity() {
		let ret = await api.post(
			'workflow/addFile',
			{ wfid: work.wfid, pondfiles: uploadedFiles, forKey: forKey },
			$session.user.sessionToken
		);
		if (ret && Array.isArray(ret)) {
			work.wf.attachments = ret;
		}
	}
	const removeAttachment = async function (serverId) {
		let ret = await api.post(
			'workflow/removeAttachment',
			{ wfid: work.wfid, attachments: [{ serverId: serverId }] },
			$session.user.sessionToken
		);
		if (ret.error) {
			console.log(ret.message);
		} else {
			work.wf.attachments = ret;
		}
	};
</script>

<Row>
	<Col>
		{#if title}
			{title}
		{/if}
		{#each work.wf.attachments as attach}
			{#if typeof attach === 'string' && forKey === 'pbo'}
				<div class=" ms-3 simplehover ">
					<a href={attach} target="_blank">{attach}</a>
				</div>
			{:else if attach.forKey === forKey}
				<div class=" ms-3 simplehover ">
					{#if attach.serverId && attach.realName}
						<a
							href={'#'}
							on:click|preventDefault={() => {
								downloadFile(work.wfid, attach.serverId, attach.realName, 'newtab');
							}}
							>{attach.realName}
							<Icon name="box-arrow-up-right" />
						</a>
					{:else}
						<a href={attach} target="_blank"> {attach} </a>
					{/if}
					({attach.author ? attach.author.substring(0, attach.author.indexOf('@')) : ''})
					<a
						href={'#'}
						on:click|preventDefault={() => {
							downloadFile(work.wfid, attach.serverId, attach.realName, 'download');
						}}
					>
						<Icon name="download" />
					</a>
					{#if attach.stepid === work.todoid && work.status === 'ST_RUN' && attach.author === $session.user.email}
						<a
							href={'#'}
							on:click|preventDefault={(e) => {
								theConfirm.title = $_('confirm.title.areyousure');
								theConfirm.body = $_('confirm.body.deletefile');
								theConfirm.buttons = [$_('confirm.button.delete')];
								theConfirm.callbacks = [
									async () => {
										await removeAttachment(attach.serverId);
									}
								];
								theConfirm.toggle();
							}}
						>
							<i class="bi bi-trash ms-1" />
						</a>
					{/if}
				</div>
			{/if}
		{/each}
	</Col>
	{#if work.status === 'ST_RUN' && uploader}
		<Col>
			<FileUploader
				allowRemove={false}
				allowMultiple={true}
				{forWhat}
				{forWhich}
				{forKey}
				{forKvar}
				stepid={work.todoid}
				on:uploading={(e) => {
					uploadingFile = true;
				}}
				on:remove={async (e) => {
					//remove has been disabled
					uploadingFile = false;
					let serverId = null;
					for (let i = 0; i < uploadedFiles.length; i++) {
						if (uploadedFiles[i].id === e.detail.id) {
							serverId = uploadedFiles[i].serverId;
							break;
						}
					}
					if (serverId) {
						await removeAttachment(serverId);
					}
				}}
				on:uploaded={async (e) => {
					uploadingFile = false;
					uploadedFiles = e.detail;
					console.log(uploadedFiles);
					await addPondFileToEntity();
				}}
				on:warning={async (e) => {
					uploadingFile = false;
					uploadedFiles = e.detail;
					console.log(uploadedFiles);
					await addPondFileToEntity();
				}}
				on:error={async (e) => {
					uploadingFile = false;
					uploadedFiles = e.detail;
					console.log(uploadedFiles);
					await addPondFileToEntity();
				}}
			/>
		</Col>
	{/if}
</Row>
<Confirm bind:this={theConfirm} />
