<script lang="ts">
	import type { Team } from '$lib/types';
	import { Container, Row, Col, Icon, Styles } from 'sveltestrap';
	import { Badge } from 'sveltestrap';
	export let theTeam: Team;
	$: number = JSON.stringify(theTeam.tmap);
</script>

<Styles />

<Container>
	---{number}---
	{#each theTeam.roles as aRole (aRole)}
		<div>
			{#each theTeam.tmap[aRole] as aMember (aMember.uid)}
				<Badge pill color="info" class="kfk-role-member-tag">
					{aMember.dname} &lt;{aMember.uid}&gt;
				</Badge>
			{/each}
		</div>
	{/each}
</Container>
