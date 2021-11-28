<script context="module">
	export async function load({ session }) {
		return {
			props: {
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import type { User } from '$lib/types';
	export let user: User;
	import { Container, Row, Col } from 'sveltestrap';
	import { goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import * as api from '$lib/api';
	import { Fade, Input, Card, NavLink, Button } from 'sveltestrap';
	import { onMount } from 'svelte';

	const seeItWork = async () => {
		await api.post('seeitwork', {}, user.sessionToken);
	};
</script>

<Container>
	<div class="text-center fs-3 my-5">Metatocome Learning Guide</div>
	<p>
		Metatocome Learning Guide is itself a workflow process, each section of learning guide is a step
		in this workflow. When you click the button below, the workflow template will be installed
		automatically under your account, and the process will be started automatically also.
	</p>
	<div class="text-center mb-5">
		<Button
			color="primary"
			on:click={async (e) => {
				e.preventDefault();
				await seeItWork();
			}}
		>
			Click here to start Learning Guide process
		</Button>
	</div>
	<p>
		The name of this workflow is "Metatocome Learning Guide". After clicking the above button, you
		will see it in <a href="/template">Tempalte Admin Page</a>
	</p>
	<p>
		Since the "Metatocome Learning Guide" was just started, this workflow also dispatch learning
		instruction in form of workflow tasks to you
	</p>
	<p>
		Goto <a href="/work">My Worklist</a>, you will find task named like "LG Step 1", click on it
		when you are there
	</p>
</Container>
