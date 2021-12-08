<script lang="ts">
	import * as api from '$lib/api';
	import {
		Container,
		Icon,
		Form,
		Input,
		InputGroup,
		InputGroupText,
		Button,
		Card,
		CardHeader,
		CardTitle,
		CardBody
	} from 'sveltestrap';
	export let user;
	let staff_email = user.email;
	let staff_relation = 'VP:GM:Director:Leader';
	let qstr = '/staff&/CEO';
	let leaders = [];
	let staffs = [];
	async function testGetLeader(e) {
		e.preventDefault();
		leaders = await api.post(
			'orgchart/getleader',
			{ uid: staff_email, leader: staff_relation },
			user.sessionToken
		);
		console.log('>>>', leaders);
	}
	async function testGetStaff(e) {
		e.preventDefault();
		staffs = await api.post('orgchart/getstaff', { qstr: qstr }, user.sessionToken);
		console.log('>>>', staffs);
	}
</script>

<Container>
	<div class="fs-4">Get a user's Leader</div>
	<Form>
		<InputGroup>
			<InputGroupText>Staff Email:</InputGroupText>
			<Input type="text" bind:value={staff_email} />
		</InputGroup>
		<InputGroup>
			<InputGroupText>Position:</InputGroupText>
			<Input type="text" bind:value={staff_relation} />
		</InputGroup>
		<Button on:click={testGetLeader}>Test</Button>
	</Form>
	Find those leaders in upper position of the specifed stafff
	<Card>
		<CardHeader>
			<CardTitle>Result:</CardTitle>
		</CardHeader>
		<CardBody>
			<ul>
				{#each leaders as rel, index (rel)}
					<li>{rel.position}: {rel.uid}</li>
				{/each}
			</ul>
		</CardBody>
	</Card>
	<div class="fs-4">Get any people in organization</div>
	<Form>
		<InputGroup>
			<InputGroupText>Query String:</InputGroupText>
			<Input type="text" bind:value={qstr} />
		</InputGroup>
		<Button on:click={testGetStaff}>Test</Button>
	</Form>
	QueryString格式为： ouReg1/pos1:pos2&ouReg2/pos3:pos4
	<ul>
		<li>ouReg是ou的regexp字符串，因此支持单部门、多部门</li>
		<li>pos1:pos2为用：分割的岗位名称</li>
		<li>& 表示可以多个查询合并使用</li>
	</ul>
	<Card>
		<CardHeader>
			<CardTitle>Result:</CardTitle>
		</CardHeader>
		<CardBody>
			<ul>
				{#each staffs as rel, index (rel)}
					<li>
						{rel.position.indexOf('staff') > -1 ? '' : rel.position}: {rel.cn}({rel.uid}) of {rel.ou}
					</li>
				{/each}
			</ul>
		</CardBody>
	</Card>
</Container>
