<script lang="ts">
	import TeamPreview from './_TeamPreview.svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	export let teams: Team[];
	export let mouseover_objid: string = '';
	function setMouseOverObjid(objid: string) {
		mouseover_objid = objid;
	}
	function setMouseFocus() {}
	export let deleteTeam;
</script>

{#if teams.length === 0}
	<div class="article-preview">No teams are here... yet.</div>
{:else}
	<div>
		{#each teams as team (team._id)}
			<div
				class="container kfk_team_list_item"
				transition:scale|local={{ start: 0.7 }}
				animate:flip={{ duration: 200 }}
				on:focus={() => setMouseFocus()}
				on:mouseover={() => setMouseOverObjid(team.teamid)}
			>
				<TeamPreview {team} {mouseover_objid} {deleteTeam} />
			</div>
		{/each}
	</div>
{/if}
