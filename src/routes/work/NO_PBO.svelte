<script lang="ts">
	import { Container } from 'sveltestrap';
</script>

<Container>
	<h1>PBO</h1>
	<p>means Primary Business Object</p>

	<p>Normally, it's an URL points to an resource the workflow will run about it.</p>
	<p>
		You may use any meaningful string as a PBO, however, other user can view the PBO directly if it
		is an URL no matter whether this URL is public accessible or restriced (for example, the PBO URL
		points to something in your enterprise intranet, this PBO's access is controlled by your
		intranet policy)
	</p>

	<p>You may specify PBO when starting the workflow</p>
</Container>
