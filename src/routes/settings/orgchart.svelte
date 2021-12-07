<script lang="ts">
	import { onMount } from 'svelte';
	import * as api from '$lib/api';
	import { Container, Row, Col, Button, InputGroup, InputGroupText, Input } from 'sveltestrap';
	let orgchartlist = [];
	export let user;
	function findOu(ocl, ouId) {
		let ret = null;
		for (let i = 0; i < ocl.length; i++) {
			if (ocl[i].ou === ouId && ocl[i].uid === `OU-${ouId}`) {
				ret = ocl[i];
			}
		}
		return ret;
	}
	function findStaffUnderOu(ocl, ouId) {
		let ret = [];
		for (let i = 0; i < ocl.length; i++) {
			if (ocl[i].ou === ouId && ocl[i].uid.startsWith('OU-') === false) {
				ret.push(ocl[i]);
			}
		}
		return ret;
	}
	function findOuUnderOu(ocl, ouId) {
		let ret = [];
		for (let i = 0; i < ocl.length; i++) {
			if (
				ocl[i].uid.startsWith('OU-') &&
				((ouId === 'root' && ocl[i].ou.length === 5) ||
					(ocl[i].ou.indexOf(ouId) === 0 && ocl[i].ou.length === ouId.length + 5))
			) {
				ret.push(ocl[i]);
			}
		}
		return ret;
	}
	async function expandOrgChart(ou, include = false) {
		console.log('refresh org chart', ou);
		let ret = await api.post('orgchart/expand', { ou: ou, include: include }, user.sessionToken);
		console.log(JSON.stringify(ret, null, 2));
		orgchartlist = ret;
	}
	onMount(() => {
		expandOrgChart('root', true);
	});
</script>

<Container class="mt-3">
	OrgChart
	{JSON.stringify(orgchartlist)}
</Container>
