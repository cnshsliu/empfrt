<script lang="ts">
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { qtb } from '$lib/utils';
	import type { User } from '$lib/types';
	import AniIcon from '$lib/AniIcon.svelte';
	import { Badge, Button, Icon, Row, InputGroup } from 'sveltestrap';
	import { session } from '$app/stores';
	export let token;
	export let rows2;
	export let row: any;
	export let visi_rds_input: string;
	export let user: User;
	export let index: any;
	export let desc_input: string;
	let tag_input: string = '';
	export let setFadeMessage: any;
	export let reloadTags: any;
</script>

{#if row.visi}
	{#if row.author === user.email}
		<div
			class="ms-5 kfk-link"
			on:click={() => {
				if ($session.setVisiFor !== row.tplid) {
					$session.setVisiFor = row.tplid;
					row.checked = false;
					visi_rds_input = row.visi;
				} else {
					$session.setVisiFor = '';
					visi_rds_input = '';
				}
				console.log($session.setVisiFor);
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
{#if $session.setVisiFor === row.tplid}
	<div class="ms-5">
		<Row>
			<InputGroup>
				<div class="form-floating flex-fill">
					<input
						class="form-control"
						id={'input-visi-rds-' + index}
						placeholder="RDS"
						bind:value={visi_rds_input}
					/>
					<label for={`input-visi-rds-${index}`}> {$_('remotetable.setvisito')} </label>
				</div>
				<!-- svelte-ignore missing-declaration -->
				<Button
					color="primary"
					on:click={async (e) => {
						e.preventDefault();
						visi_rds_input = qtb(visi_rds_input);
						//will use temaid=""(no specified team, but may use T:team_name in rds), email = current user
						let people = await api.post('explain/pds', { rds: visi_rds_input }, token);
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
						$session.setVisiFor = '';
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
						$session.setVisiFor = '';
						visi_rds_input = '';
						console.log($session.setVisiFor);
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
				if ($session.addDescFor === row.tplid) {
					desc_input = '';
					$session.addDescFor = '';
				} else {
					desc_input = row.desc;
					$session.addDescFor = row.tplid;
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
{#if $session.addDescFor === row.tplid}
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
						$session.addDescFor = '';
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
			if ($session.setTagFor !== row.tplid) {
				$session.setTagFor = row.tplid;
			} else {
				$session.setTagFor = '';
			}
		}}
	>
		<AniIcon icon="tag" ani="aniShake" />
		{#each row.tags as tag, tagIndex}
			{#if tag.owner === user.email}
				<Badge pill color="light" class="kfk-tag text-primary border border-primary">
					{tag.text}
					<a
						href={'#'}
						on:click|preventDefault|stopPropagation={async () => {
							let tags = await api.post(
								'tag/del',
								{ objtype: 'template', objid: row.tplid, text: tag.text },
								token
							);
							row.tags = tags;
							row = row;
							await reloadTags();
						}}
					>
						<Icon name="x" />
					</a>
				</Badge>
			{/if}
		{/each}
	</div>
{/if}
{#if $session.setTagFor === row.tplid}
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
						$session.setTagFor = '';
					}}
				>
					{$_('button.close')}
				</Button>
			</InputGroup>
		</Row>
	</div>
{/if}
