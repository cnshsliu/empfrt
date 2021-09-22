<script lang="ts">
	import * as api from '$lib/api';
	import { Container, Row, Col, Icon, Styles } from 'sveltestrap';
	import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Badge } from 'sveltestrap';
	import { Table } from 'sveltestrap';
	import { enhance, enhanceAddOneRoleMember } from '$lib/form';
	export let work: Work;
	export let mouseover_objid: string;

	export let user;
</script>

<Styles />

<Container class={mouseover_objid === work._id ? 'kfk-highlight-2' : ''}>
	<Row>
		<Col>{work.title}</Col>
		<Col>{work.tplid}</Col>
		<Col>{work.status}</Col>
		<Col>{work.wfstatus}</Col>
	</Row>
</Container>
