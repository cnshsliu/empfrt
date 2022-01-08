<script lang="ts">
	import * as api from '$lib/api';
	import type { User, EmpResponse } from '$lib/types';
	import {
		Container,
		Row,
		Col,
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
	export let user: User;
	export let show: any;
	export let useThisLeader: any;
	export let useThisQuery: any;
	let staff_email = user.email;
	export let lstr: string;
	export let qstr: string;
	let leaders = [];
	let staffs = [];
	async function testGetLeader(e: Event) {
		e.preventDefault();
		let res = await api.post(
			'orgchart/getleader',
			{ uid: staff_email, leader: lstr },
			user.sessionToken
		);
		if (res.error) {
			console.error(res.message);
		} else {
			leaders = res as any[];
		}
	}
	async function testGetStaff(e: Event) {
		e.preventDefault();
		let res = <EmpResponse>await api.post('orgchart/getstaff', { qstr: qstr }, user.sessionToken);
		if (res.error) {
			console.error(res.message);
		} else {
			staffs = res as any[];
		}
	}
</script>

<Container>
	{#if !show || (show && show.leader)}
		<div class="fs-5">Get a user's Leader</div>
		<Form>
			<Row cols="1">
				<Col>
					<InputGroup>
						<InputGroupText>Staff Email:</InputGroupText>
						<Input type="text" bind:value={staff_email} />
					</InputGroup>
				</Col>
				<Col>
					<InputGroup>
						<InputGroupText>Position:</InputGroupText>
						<Input type="text" bind:value={lstr} />
					</InputGroup>
				</Col>
			</Row>
			<Row>
				<Col>
					<Button on:click={testGetLeader} color="primary">Test</Button>
				</Col>
				{#if useThisLeader}
					<Col class="d-flex justify-content-end">
						<Button
							class="adjust-self-right"
							on:click={(e) => {
								e.preventDefault();
								useThisLeader(lstr);
							}}
						>
							Use this
						</Button>
					</Col>
				{/if}
			</Row>
		</Form>
		<!-- Find those leaders in upper position of the specifed staff comma separated leaders' title, for example:
		"director" will search workflow doer's director upwards along the orgchart tree. "director:CTO:CEO"
		will search doer's director and CTO and CEO upwards along the orgchart tree.-->
		{#if Array.isArray(leaders)}
			<Card>
				<CardHeader>
					<CardTitle>Result:</CardTitle>
				</CardHeader>
				<CardBody>
					<ul>
						{#each leaders as rel}
							<li>{rel.position}: {rel.uid}</li>
						{/each}
					</ul>
				</CardBody>
			</Card>
		{/if}
	{/if}
	{#if !show || (show && show.query)}
		<div class="fs-5">Query people in organization</div>
		<Form>
			<InputGroup>
				<InputGroupText>Query String:</InputGroupText>
				<Input type="text" bind:value={qstr} />
			</InputGroup>
			<Row>
				<Col>
					<Button on:click={testGetStaff} color="primary">Test</Button>
				</Col>
				{#if useThisQuery}
					<Col class="d-flex justify-content-end">
						<Button
							on:click={(e) => {
								e.preventDefault();
								useThisQuery(qstr);
							}}
						>
							Use this
						</Button>
					</Col>
				{/if}
			</Row>
		</Form>
		<!-- QueryString格式为： ouReg1/pos1:pos2&ouReg2/pos3:pos4...
		<ul>
			<li>ouReg是ou的regexp字符串，因此支持单部门、多部门</li>
			<li>pos1:pos2为用：分割的岗位名称</li>
			<li>& 表示可以多个查询合并使用</li>
		</ul>
		-->
		{#if Array.isArray(staffs)}
			<Card>
				<CardHeader>
					<CardTitle>Result:</CardTitle>
				</CardHeader>
				<CardBody>
					<ul>
						{#each staffs as rel}
							<li>
								{rel.position.indexOf('staff') > -1 ? '' : rel.position}: {rel.cn}({rel.uid}) of {rel.ou}
							</li>
						{/each}
					</ul>
				</CardBody>
			</Card>
		{/if}
	{/if}
</Container>
