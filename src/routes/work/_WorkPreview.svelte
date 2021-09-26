<script lang="ts">
	import { Container, Row, Col, Styles } from 'sveltestrap';
	import type { Work } from '$lib/types';
	import { goto } from '$app/navigation';
	export let work: Work;
	export let mouseover_objid: string;

	function gotoWorkitem(work: Work) {
		goto(`/work/@${work.workid}`, { replaceState: false });
	}
</script>

work
<Styles />

<Container class={mouseover_objid === work._id ? 'kfk-highlight-2' : ''}>
	<Row>
		<Col>
			<a
				class="preview-link kfk-team-id kfk-link"
				href={'#'}
				on:click|preventDefault={() => {
					gotoWorkitem(work);
				}}
			>
				{work.title}
			</a>
		</Col>
		<Col>{work.tplid}</Col>
		<Col>{work.status}</Col>
		<Col>{work.wfstatus}</Col>
	</Row>
</Container>
