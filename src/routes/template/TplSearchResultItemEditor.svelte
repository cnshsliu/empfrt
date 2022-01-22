<script lang="ts">
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { qtb } from '$lib/utils';
	import type { User } from '$lib/types';
	import BadgeWithDel from '$lib/input/BadgeWithDel.svelte';
	import AniIcon from '$lib/AniIcon.svelte';
	import { Badge, Button, Icon, Row, InputGroup } from 'sveltestrap';
	import { session } from '$app/stores';
	import { SetFor, filterStorage } from '$lib/empstores';
	export let user: User = $session.user;
	export let token = user.sessionToken;
	export let rows2;
	export let row: any;
	export let visi_rds_input: string;
	export let index: any;
	export let desc_input: string;
	export let author_input: string;
	let tag_input: string = '';
	export let setFadeMessage: any;
	export let reloadTags: any;
</script>

{#if row.visi}
	{#if row.author === user.email}
		<div
			class="ms-5 kfk-link"
			on:click={() => {
				if ($SetFor.setVisiFor !== row.tplid) {
					$SetFor.setVisiFor = row.tplid;
					row.checked = false;
					visi_rds_input = row.visi;
				} else {
					$SetFor.setVisiFor = '';
					visi_rds_input = '';
				}
			}}
		>
			<AniIcon icon="people-fill" ani="aniShake" />
			{row.visi}
		</div>
	{:else}
		<div class="ms-5">
			<AniIcon icon="people-fill" ani="aniShake" />
			{row.visi}
		</div>
	{/if}
{/if}
{#if $SetFor.setVisiFor === row.tplid}
	<div class="ms-5">
		<Row>
			<InputGroup>
				<div class="form-floating flex-fill">
					<input
						class="form-control"
						id={'input-visi-pds-' + index}
						placeholder="PDS"
						bind:value={visi_rds_input}
					/>
					<label for={`input-visi-pds-${index}`}> {$_('remotetable.setvisito')} </label>
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
						rows2[index] = row;
						rows2 = rows2;
					}}
				>
					{$_('button.check')}
				</Button>
				<Button
					color="success"
					on:click={async (e) => {
						e.preventDefault();
						visi_rds_input = qtb(visi_rds_input);
						let res = await api.post(
							'template/setvisi',
							{ tplid: row.tplid, visi: visi_rds_input },
							token
						);
						if (res.error) {
							setFadeMessage(res.message, 'warning');
						} else {
							row.visi = res.visi;
							rows2[index] = row;
							rows2 = rows2;
						}
					}}
					disabled={!row.checked}
				>
					{$_('button.set')}
				</Button>
				<Button
					on:click={async (e) => {
						e.preventDefault();
						$SetFor.setVisiFor = '';
						visi_rds_input = '';
						row.visipeople = null;
						let res = await api.post('template/clearvisi', { tplid: row.tplid }, token);
						if (res.error) {
							setFadeMessage(res.message, 'warning');
						} else {
							row.visi = '';
							rows2[index] = row;
							rows2 = rows2;
						}
					}}
				>
					{$_('button.clear')}
				</Button>
				<Button
					on:click={(e) => {
						e.preventDefault();
						row.checked = false;
						$SetFor.setVisiFor = '';
						visi_rds_input = '';
					}}
				>
					{$_('button.close')}
				</Button>
			</InputGroup>
		</Row>
		{#if Array.isArray(row.visipeople)}
			<Row>
				{#each row.visipeople as visiperson}
					<div class="text-center">{visiperson.cn}({visiperson.uid})</div>
				{/each}
			</Row>
		{/if}
	</div>
{/if}
{#if row.desc && row.desc.trim().length > 0}
	{#if row.author === user.email}
		<div
			class="ms-5 kfk-link"
			on:click={() => {
				if ($SetFor.setDescFor === row.tplid) {
					desc_input = '';
					$SetFor.setDescFor = '';
				} else {
					desc_input = row.desc;
					$SetFor.setDescFor = row.tplid;
				}
			}}
		>
			<AniIcon icon="card-text" ani="aniShake" />
			{row.desc}
		</div>
	{:else}
		<div class="ms-5">
			<AniIcon icon="card-text" ani="aniShake" />
			{row.desc}
		</div>
	{/if}
{/if}
{#if $SetFor.setDescFor === row.tplid}
	<div class="ms-5">
		<Row>
			<InputGroup>
				<div class="form-floating flex-fill">
					<input
						class="form-control"
						id={'input-desc-' + index}
						placeholder="Description"
						bind:value={desc_input}
					/>
					<label for={`input-desc-${index}`}> set description to: </label>
				</div>
				<Button
					color="primary"
					on:click={async (e) => {
						e.preventDefault();
						desc_input = desc_input.trim();
						let ret = await api.post(
							'template/desc',
							{ tplid: row.tplid, desc: desc_input },
							token
						);
						row.desc = desc_input;
						rows2 = rows2;
					}}
				>
					{$_('button.set')}
				</Button>
				<Button
					on:click={(e) => {
						e.preventDefault();
						$SetFor.setDescFor = '';
						desc_input = '';
					}}
				>
					{$_('button.close')}
				</Button>
			</InputGroup>
		</Row>
	</div>
{/if}
{#if Array.isArray(row.tags) && row.tags.length > 0}
	<div
		class="ms-5 kfk-link"
		on:click={() => {
			if ($SetFor.setTagFor !== row.tplid) {
				$SetFor.setTagFor = row.tplid;
			} else {
				$SetFor.setTagFor = '';
			}
		}}
	>
		<AniIcon icon="tag" ani="aniShake" />
		{#each row.tags as tag, tagIndex}
			{#if tag.owner === user.email}
				<BadgeWithDel
					bind:text={tag.text}
					on:delete={async () => {
						let tags = await api.post(
							'tag/del',
							{ objtype: 'template', objid: row.tplid, text: tag.text },
							token
						);
						row.tags = tags;
						row = row;
						await reloadTags();
					}}
				/>
			{/if}
		{/each}
	</div>
{/if}
{#if $SetFor.setTagFor === row.tplid}
	<div class="ms-5">
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
									token
								);
								row.tags = tags;
								row = row;
								await reloadTags();
							}
							tag_input = '';
						}}
					/>
					<label for={`input-tags-${index}`}> input new tags delimited by space/;/, </label>
				</div>
				<Button
					color="primary"
					on:click={async (e) => {
						e.preventDefault();
						if (tag_input.trim().length > 0) {
							let tags = await api.post(
								'tag/add',
								{ objtype: 'template', objid: row.tplid, text: tag_input.trim() },
								token
							);
							row.tags = tags;
							row = row;
							await reloadTags();
						}
						tag_input = '';
					}}
				>
					{$_('button.set')}
				</Button>
				<Button
					on:click={(e) => {
						e.preventDefault();
						$SetFor.setTagFor = '';
					}}
				>
					{$_('button.close')}
				</Button>
			</InputGroup>
		</Row>
	</div>
{/if}
{#if $SetFor.setAuthorFor === row.tplid}
	<div class="ms-5">
		<Row>
			<InputGroup>
				<div class="form-floating flex-fill">
					<input
						class="form-control"
						id={'input-owner-' + index}
						placeholder="User ID"
						bind:value={author_input}
					/>
					<label for={`input-owner-${index}`}> Set author to (user id): </label>
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
							token
						);
						if (ret.error) {
							setFadeMessage(ret.message, 'warning');
						} else {
							console.log(JSON.stringify(ret));
							row.author = ret.author;
							row.authorName = ret.authorName;
							rows2[index] = row;
							rows2 = rows2;
						}
					}}
				>
					{$_('button.set')}
				</Button>
				<Button
					on:click={(e) => {
						e.preventDefault();
						$SetFor.setAuthorFor = '';
						author_input = '';
					}}
				>
					{$_('button.close')}
				</Button>
			</InputGroup>
		</Row>
	</div>
{/if}
