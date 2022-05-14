<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { nbArray } from '$lib/utils';
	import { Row, Col, Icon } from 'sveltestrap';
	import Confirm from '$lib/confirm.svelte';
	import { session } from '$app/stores';
	import { createEventDispatcher, getContext } from 'svelte';
	import FileUploader from '$lib/FileUploader.svelte';
	import { ClientPermControl } from '$lib/clientperm';
	let theConfirm;
	let uploadingFile: boolean;
	let uploadedFiles = [];
	let user = $session.user;

	const dispatch = createEventDispatcher();
	export let work = null;
	export let workflow = null;
	export let title;
	export let forWhat: string = 'workflow';
	export let forWhich: string = 'unknown';
	export let forKey: string = 'unknown';
	export let forKvar: string = null;
	export let uploader = true;
	export let filetype: string = 'file';
	function downloadFile(wfid, serverId, realName, mode = 'download') {
		fetch(`${API_SERVER}/wf/attach/viewer/${wfid}/${serverId}`, {
			headers: {
				Authorization: $session.user.sessionToken,
			},
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
			$session.user.sessionToken,
		);
		switch (filetype) {
			case 'file':
				if (ret && Array.isArray(ret)) {
					work.wf.attachments = ret;
					attachments = ret;
				}
				break;
			case 'csv':
				if (nbArray(ret)) dispatch('uidCheckResult', ret);
				break;
		}
	}

	const removeAttachment = async function (serverId) {
		let ret = await api.post(
			'workflow/removeAttachment',
			{ wfid: work.wfid, attachments: [{ serverId: serverId }] },
			$session.user.sessionToken,
		);
		if (ret.error) {
			console.log(ret.message);
		} else {
			work.wf.attachments = ret;
			attachments = ret;
		}
	};
	let attachments = work ? work.wf.attachments : workflow ? workflow.attachments : [];
	let theWfid = work ? work.wfid : workflow ? workflow.wfid : '';
</script>

{#if (work && (work.allowpbo || attachments.length > 0)) || forKey !== 'pbo'}
	<Row>
		{#if work && (forKey !== 'pbo' || (forKey === 'pbo' && work.allowpbo)) && (work.status === 'ST_RUN' || ClientPermControl(user.perms, user.email, 'work', work, 'update')) && uploader}
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
						dispatch('uploading', true);
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
							dispatch('remove', serverId);
						}
					}}
					on:uploaded={async (e) => {
						uploadingFile = false;
						uploadedFiles = e.detail;
						await addPondFileToEntity();
						let serverId = uploadedFiles[0].serverId;
						dispatch('uploaded', serverId);
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
					}} />
				{filetype === 'csv' ? '请上传.csv文件或xlsx文件，不支持旧格式后缀为xls的文件' : ''}
			</Col>
		{/if}
		<Col>
			{#if title}
				{title}
			{/if}
			{#each attachments as attach}
				{#if typeof attach === 'string' && forKey === 'pbo'}
					<div class="ms-3 simplehover ">
						<a href={attach} target="_blank">{attach}</a>
					</div>
				{:else if attach.forKey === forKey}
					<div class=" ms-3">
						<span class="kfk-tag">
							{#if attach.serverId && attach.realName}
								<a
									class="kfk-link"
									href={'#'}
									on:click|preventDefault={() => {
										downloadFile(theWfid, attach.serverId, attach.realName, 'newtab');
									}}>
									{attach.realName}
									<i class="bi bi-box-arrow-up-right ms-1" />
								</a>
							{:else}
								<a class="kfk-link" href={attach} target="_blank">{attach}</a>
							{/if}
						</span>
						({attach.author ? attach.author.substring(0, attach.author.indexOf('@')) : ''})
						<a
							href={'#'}
							on:click|preventDefault={() => {
								downloadFile(theWfid, attach.serverId, attach.realName, 'download');
							}}>
							<i class="bi bi-download" />
						</a>
						<!-- 在当前提交时可以删除，一旦提交不能再删除-->
						<!-- 管理员可以删除-->
						<!-- 对当前活动拥有update权限可以删除-->
						<!-- {#if (attach.stepid === work.todoid && work.status === 'ST_RUN' && attach.author === $session.user.email) || $session.user.group === 'ADMIN' || ClientPermControl(user.perms, user.email, 'work', work, 'update')} -->
						<!-- allowpbo 指的是是否允许编辑pbo -->
						{#if work && work.allowpbo && ((attach.stepid === work.todoid && work.status === 'ST_RUN' && attach.author === $session.user.email) || $session.user.group === 'ADMIN')}
							<a
								href={'#'}
								on:click|preventDefault={(e) => {
									theConfirm.title = $_('confirm.title.areyousure');
									theConfirm.body = $_('confirm.body.deletefile');
									theConfirm.buttons = [$_('confirm.button.delete')];
									theConfirm.callbacks = [
										async () => {
											await removeAttachment(attach.serverId);
										},
									];
									theConfirm.toggle();
								}}>
								<i class="bi bi-trash ms-1" />
							</a>
						{/if}
					</div>
				{/if}
			{/each}
		</Col>
		<!-- 当前活动为Run，则当前用户可以上传，或者只要是对当前活动具有update权限，也可以上传 -->
	</Row>
	<Confirm bind:this={theConfirm} />
{/if}
