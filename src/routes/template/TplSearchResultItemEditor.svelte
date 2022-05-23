<script lang="ts">
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { qtb } from '$lib/utils';
	import type { User } from '$lib/types';
	import BadgeWithDel from '$lib/input/BadgeWithDel.svelte';
	import AniIcon from '$lib/AniIcon.svelte';
	import { tick, createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	import { Badge, Button, Icon, Row, Col, InputGroup } from 'sveltestrap';
	import { session } from '$app/stores';
	import { filterStorage } from '$lib/empstores';
	import { ClientPermControl } from '$lib/clientperm';
	export let user: User = $session.user;
	export let token = user.sessionToken;
	export let rows;
	export let row: any;
	export let visi_rds_input: string;
	export let index: any;
	export let desc_input: string = row.desc;
	export let tplid_input: string = row.tplid;
	export let author_input: string = '';
	let tag_input: string = '';
	export let setFadeMessage: any;
	export let reloadTags: any;
	export let SetFor: any;
	const toggleDiscuss = async (row) => {
		return await api.post(
			'comment/toggle',
			{ objtype: 'template', objid: row.tplid },
			user.sessionToken,
		);
	};
</script>

{#if row.visi}
	{#if row.author === user.email}
		<div
			class="kfk-link"
			on:click={() => {
				if (SetFor.setVisiFor !== row.tplid) {
					SetFor.setVisiFor = row.tplid;
					row.checked = false;
					visi_rds_input = row.visi;
				} else {
					SetFor.setVisiFor = '';
					visi_rds_input = '';
				}
			}}>
			<AniIcon icon="people-fill" ani="aniShake" />
			{row.visi}
		</div>
	{:else}
		<div class="">
			<AniIcon icon="people-fill" ani="aniShake" />
			{row.visi}
		</div>
	{/if}
{/if}
{#if row.desc && row.desc.trim().length > 0}
	{#if row.author === user.email}
		<div
			class="kfk-link"
			on:click={() => {
				if (SetFor.setDescFor === row.tplid) {
					desc_input = '';
					SetFor.setDescFor = '';
				} else {
					desc_input = row.desc;
					SetFor.setDescFor = row.tplid;
				}
			}}>
			<AniIcon icon="card-text" ani="aniShake" />
			{row.desc}
		</div>
	{:else}
		<div class="">
			<AniIcon icon="card-text" ani="aniShake" />
			{row.desc}
		</div>
	{/if}
{/if}
{#if Array.isArray(row.tags) && row.tags.length > 0}
	<div
		class="kfk-link"
		on:click={() => {
			if (SetFor.setTagFor !== row.tplid) {
				SetFor.setTagFor = row.tplid;
			} else {
				SetFor.setTagFor = '';
			}
		}}>
		<AniIcon icon="tag" ani="aniShake" />
		{#each row.tags as tag, tagIndex}
			{#if tag.owner === user.email}
				<BadgeWithDel
					bind:text={tag.text}
					on:delete={async () => {
						let tags = await api.post(
							'tag/del',
							{ objtype: 'template', objid: row.tplid, text: tag.text },
							token,
						);
						row.tags = tags;
						row = row;
						await reloadTags();
					}} />
			{/if}
		{/each}
	</div>
{/if}
{#if SetFor.settingFor === row.tplid && user.perms && ClientPermControl(user.perms, user.email, 'template', row, 'delete')}
	<div class="card ms-0">
		<div class="card-header">
			<InputGroup>
				<div class="flex-fill">
					{$_('remotetable.template.set.title')}
				</div>
				<Button
					on:click={(e) => {
						e.preventDefault();
						row.checked = false;
						SetFor.settingFor = '';
						SetFor.setTagFor = '';
						SetFor.setAuthorFor = '';
						SetFor.setDescFor = '';
						SetFor.setWeComBotFor = '';
						SetFor.setVisiFor = '';
						visi_rds_input = '';
					}}>
					{$_('button.close')}
				</Button>
			</InputGroup>
		</div>
		<div class="card-body">
			<Row>
				<InputGroup>
					<div class="form-floating flex-fill">
						<input
							class="form-control"
							id={'input-tplid-' + index}
							placeholder="Template ID"
							bind:value={tplid_input} />
						<label for={`input-tplid-${index}`}>{$_('remotetable.template.set.tplid')}</label>
					</div>
					<Button
						color="primary"
						on:click={async (e) => {
							e.preventDefault();
							tplid_input = tplid_input.trim();
							let ret = await api.post(
								'template/rename',
								{ fromid: row.tplid, tplid: tplid_input },
								token,
							);
							if (ret.error) {
								setFadeMessage(ret.message, 'warning');
							} else {
								setFadeMessage('Success', 'success');
								row.tplid = ret;
								dispatch('tplidSet', row);
							}
						}}>
						{$_('button.set')}
					</Button>
				</InputGroup>
			</Row>
			<Row>
				<InputGroup>
					<div class="form-floating flex-fill">
						<input
							class="form-control"
							id={'input-desc-' + index}
							placeholder="Description"
							bind:value={desc_input} />
						<label for={`input-desc-${index}`}>{$_('remotetable.template.set.setdesc')}</label>
					</div>
					<Button
						color="primary"
						on:click={async (e) => {
							e.preventDefault();
							desc_input = desc_input.trim();
							let ret = await api.post(
								'template/desc',
								{ tplid: row.tplid, desc: desc_input },
								token,
							);
							if (ret.err) {
								setFadeMessage(ret.message, 'warning');
							} else {
								setFadeMessage('Success', 'success');
							}
							row.desc = desc_input;
							rows = rows;
						}}>
						{$_('button.set')}
					</Button>
				</InputGroup>
			</Row>
			<Row>
				<InputGroup>
					<div class="form-floating flex-fill">
						<input
							name={'newtag-' + index}
							class="form-control"
							id={'input-tags-' + index}
							placeholder="New tags"
							bind:value={tag_input}
							on:change={async (e) => {
								e.preventDefault();
								if (tag_input.trim().length > 0) {
									let tags = await api.post(
										'tag/add',
										{ objtype: 'template', objid: row.tplid, text: tag_input.trim() },
										token,
									);
									if (tags.error) {
										setFadeMessage(tags.message, 'warning');
									} else {
										row.tags = tags;
										row = row;
										await reloadTags();
									}
								}
								tag_input = '';
							}} />
						<label for={`input-tags-${index}`}>
							{$_('remotetable.template.set.settags')}
						</label>
					</div>
					<Button
						color="primary"
						on:click={async (e) => {
							e.preventDefault();
							if (tag_input.trim().length > 0) {
								let tags = await api.post(
									'tag/add',
									{ objtype: 'template', objid: row.tplid, text: tag_input.trim() },
									token,
								);
								if (tags.error) {
									setFadeMessage(tags.message, 'warning');
								} else {
									row.tags = tags;
									row = row;
									await reloadTags();
								}
							}
							tag_input = '';
						}}>
						{$_('button.set')}
					</Button>
				</InputGroup>
			</Row>
			<Row>
				<InputGroup>
					<div class="form-floating flex-fill">
						<input
							class="form-control"
							id={'input-owner-' + index}
							placeholder="User ID"
							bind:value={author_input} />
						<label for={`input-owner-${index}`}>{$_('remotetable.template.set.setauthor')}</label>
					</div>
					<Button
						color="primary"
						on:click={async (e) => {
							e.preventDefault();
							author_input = author_input.trim();
							if (author_input.length <= 0) return;
							let ret = await api.post(
								'template/set/author',
								{ tplid: row.tplid, author: author_input },
								token,
							);
							if (ret.error) {
								setFadeMessage(ret.message, 'warning');
							} else {
								console.log(JSON.stringify(ret));
								row.author = ret.author;
								row.authorName = ret.authorName;
								row = row;
								dispatch('authorSet', row);
							}
						}}>
						{$_('button.set')}
					</Button>
				</InputGroup>
			</Row>
			<Row>
				<InputGroup>
					<div class="form-floating flex-fill">
						<input
							class="form-control"
							id={'input-visi-pds-' + index}
							placeholder="PDS"
							bind:value={visi_rds_input} />
						<label for={`input-visi-pds-${index}`}>
							{$_('remotetable.template.set.setvisito')}
						</label>
					</div>
					<!-- svelte-ignore missing-declaration -->
					<Button
						color="primary"
						on:click={async (e) => {
							e.preventDefault();
							visi_rds_input = qtb(visi_rds_input);
							//will use temaid=""(no specified team, but may use T:team_name in pds), email = current user
							let people = await api.post('explain/pds', { pds: visi_rds_input }, token);
							console.log(people);
							row.visipeople = people;
							row.checked = true;
							rows[index] = row;
							rows = rows;
						}}>
						{$_('button.check')}
					</Button>
					<Button
						color="secondary"
						on:click={async (e) => {
							e.preventDefault();
							visi_rds_input = qtb(visi_rds_input);
							let res = await api.post(
								'template/setvisi',
								{ tplid: row.tplid, visi: visi_rds_input },
								token,
							);
							if (res.error) {
								setFadeMessage(res.message, 'warning');
							} else {
								row.visi = res.visi;
								rows[index] = row;
								rows = rows;
							}
						}}
						disabled={!row.checked}>
						{$_('button.set')}
					</Button>
					<Button
						on:click={async (e) => {
							e.preventDefault();
							SetFor.setVisiFor = '';
							visi_rds_input = '';
							row.visipeople = null;
							let res = await api.post('template/clearvisi', { tplid: row.tplid }, token);
							if (res.error) {
								setFadeMessage(res.message, 'warning');
							} else {
								row.visi = '';
								rows[index] = row;
								rows = rows;
							}
						}}>
						{$_('button.clear')}
					</Button>
				</InputGroup>
			</Row>
			<!--Row>
				<InputGroup>
					<div class="form-floating flex-fill">
						<input
							class="form-control"
							id={'input-wecombotkey-' + index}
							placeholder="WeComBot Key"
							bind:value={row.wecombotkey}
						/>
						<label for={`input-wecombotkey-${index}`}>
							{$_('remotetable.template.set.setwecombotkey')}</label
						>
					</div>
					<Button
						color="primary"
						on:click={async (e) => {
							e.preventDefault();
							row.wecombotkey = row.wecombotkey.trim();
							let ret = await api.post(
								'template/set/wecombot',
								{ tplid: row.tplid, key: row.wecombotkey },
								token
							);
							if (ret.err) {
								setFadeMessage(ret.message, 'warning');
							} else {
								setFadeMessage('Success', 'success');
							}
							rows = rows;
						}}
					>
						{$_('button.set')}
					</Button>
				</InputGroup>
			</Row -->
			{#if Array.isArray(row.visipeople)}
				<Row>
					{#each row.visipeople as visiperson}
						<div class="text-center">{visiperson.cn}({visiperson.uid})</div>
					{/each}
				</Row>
			{/if}

			{#if row.author === user.email || user.group === 'ADMIN'}
				<Row>
					<div class="form-check form-switch">
						<input
							class="form-check-input"
							type="checkbox"
							role="switch"
							id="flexSwitchCheckChecked"
							checked={row.allowdiscuss}
							on:change={async (e) => {
								row.allowdiscuss = await toggleDiscuss(row);
								row = row;
							}} />
						<label class="form-check-label" for="flexSwitchCheckChecked">
							{row.allowdiscuss ? '允许讨论' : '已关闭讨论'} （切换以切换状态）
						</label>
					</div>
				</Row>
			{/if}
		</div>
	</div>
{/if}
