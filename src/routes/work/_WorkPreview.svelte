<script lang="ts">
	import { Container, Row, Col, Styles } from 'sveltestrap';
	import moment from 'moment';
	import type { Work } from '$lib/types';
	import { goto } from '$app/navigation';
	export let work: Work;
	export let mouseover_objid: string;

	function gotoWorkitem(work: Work) {
		goto(`/work/@${work.workid}`, { replaceState: false });
	}
</script>

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
			</a> <br />
			of <b> {work.wftitle} </b> started by
			{work.wfstarter ? work.wfstarter : ''}
		</Col>
		<Col>
			set: {moment(work.createdAt).format('LLLL')} <br />
			done: {work.doneat ? moment(work.doneat).format('LLLL') : ''}
		</Col>
	</Row>
</Container>
