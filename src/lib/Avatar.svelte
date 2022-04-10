<script type="ts">
	import { Row, Col } from 'sveltestrap';
	export let avatar;
	export let name;
</script>

<Row class="justify-content-center">
	{#if avatar.trim()}
		<div class="d-flex justify-content-center"><img src={avatar} class="kfk-avatar-small" /></div>
	{:else}
		<div class="d-flex justify-content-center text-center kfk-avatar-letter-small">
			{name.substring(0, 1)}
		</div>
	{/if}
</Row>
<Row>
	<div class="w-100 text-center">{name}</div>
</Row>
