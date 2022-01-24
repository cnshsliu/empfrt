<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import { _, mtcDate } from '$lib/i18n';
	import { Button, Icon } from 'sveltestrap';
	import { session } from '$app/stores';

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
</script>

<Icon name="vinyl" />&nbsp;
{$_('todo.pbo')}
{#each work.wf.pbo as pbo}
	<br />
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
	<Icon name="box-arrow-up-right" />
{/each}
