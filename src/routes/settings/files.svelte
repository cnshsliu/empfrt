<script type="ts">
	import { Button, Container, Row, Col, InputGroup, Input } from 'sveltestrap';
	import { _ } from '$lib/i18n';
	import { session } from '$app/stores';
	import type { User, EmpResponse } from '$lib/types';
	import AniIcon from '$lib/AniIcon.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import { API_SERVER } from '$lib/Env';
	let user: User = $session.user;
	let files = [];

	async function fixPondfile() {
		await api.post('fix', {}, user.sessionToken);
	}

	async function deleteFile(serverId) {
		let res = await api.post('pondfile/mine/delete', { serverId: serverId }, user.sessionToken);
		if (res.success) {
			files = files.filter((x) => x.serverId !== serverId);
		}
	}

	function downloadFile(serverId, realName, mode = 'download') {
		fetch(`${API_SERVER}/pondfile/mine/viewer/${serverId}`, {
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

	const loadData = async (q = '', wf = '') => {
		files = await api.post('files/mine', { q: q, wf: wf }, user.sessionToken);
	};

	const onSearch = async (e) => {
		e && e.preventDefault();
		await loadData($session.q, $session.whichwf);
	};

	onMount(async () => {
		await loadData();
	});
</script>

<Container class="mt-3">
	<Row>
		<nav aria-label="breadcrumb">
			<ol class="breadcrumb">
				<li class="breadcrumb-item">
					<a
						href={'#'}
						on:click={() => {
							goto('/settings');
						}}
					>
						{$_('navmenu.settings')}
					</a>
				</li>
				<li class="breadcrumb-item active" aria-current="page">{$_('setting.myfiles.nav')}</li>
			</ol>
		</nav>
	</Row>
	<Row class="mb-2">
		<Col>
			<InputGroup>
				<div class="form-input">
					<Input
						class="form-input"
						name="searchq"
						bind:value={$session.q}
						id="searchq"
						placeholder="Search by file name"
					/>
				</div>
				<Button on:click={onSearch}><i class="bi bi-search" /></Button>
			</InputGroup>
			{#if $session.whichwf}
				In worlflow: {$session.whichwf}
				<a
					class="kfk-link kfk-tag"
					href={'#'}
					on:click|preventDefault={() => {
						delete $session.whichwf;
						onSearch(null);
					}}
				>
					Clear
				</a>
			{/if}
		</Col>
	</Row>
	<Row cols={2}>
		{#each files as file}
			<Col>
				<div class="card mt-2">
					<div class="card-header fs-4 fw-bolder">
						{file.wf
							? file.wf.attachments.realName
							: file.pondfile
							? file.pondfile.realName
							: file.serverId}
					</div>
					<div class="card-body">
						<div class="card-title kfk-tag">
							{#if file.wf}
								use in: <a href="/workflow/{file.wf.wfid}">{file.wf.wftitle}</a>
								<span>
									<a
										class="kfk-link"
										href={'#'}
										on:click|preventDefault={() => {
											$session.whichwf = file.wf.wfid;
											onSearch(null);
										}}
									>
										<AniIcon icon="filter-circle" ani="aniShake" />
										{$_('setting.myfiles.filter')}
									</a>
								</span>
							{:else}
								Spare file
							{/if}
						</div>
						<p class="card-text">
							<span class="kfk-tag">
								<a
									class="kfk-link"
									href={'#'}
									on:click|preventDefault={() => {
										downloadFile(
											file.serverId,
											file.wf
												? file.wf.attachments.realName
												: file.pondfile
												? file.pondfile.realName
												: file.serverId,
											'newtab'
										);
									}}
								>
									<AniIcon icon="box-arrow-up-right" ani="aniShake" />
									{$_('setting.myfiles.view')}
								</a>
							</span>
							<span class="kfk-tag">
								<a
									href={'#'}
									class="kfk-link"
									on:click|preventDefault={() => {
										downloadFile(
											file.serverId,
											file.wf
												? file.wf.attachments.realName
												: file.pondfile
												? file.pondfile.realName
												: file.serverId,
											'download'
										);
									}}
								>
									<AniIcon icon="download" ani="aniShake" />
									{$_('setting.myfiles.download')}
								</a>
							</span>
							{#if !file.wf}
								<span class="kfk-tag">
									<a
										href={'#'}
										class="kfk-link"
										on:click|preventDefault={() => {
											deleteFile(file.serverId);
										}}
									>
										<AniIcon icon="trash" ani="aniShake" />
										{$_('setting.myfiles.delete')}
									</a>
								</span>
							{/if}
						</p>
					</div>
				</div>
			</Col>
		{/each}
	</Row>
</Container>
{#if user.group === 'ADMIN'}
	<Button on:click={fixPondfile}>FixPondFile</Button>
{/if}
