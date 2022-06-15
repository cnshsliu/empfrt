<script lang="ts">
	import { _ } from '$lib/i18n';
	import Parser from '$lib/parser';
	import ChangeID from './ChangeID.svelte';
	import {
		NavLink,
		Icon,
		Container,
		Row,
		Col,
		InputGroup,
		InputGroupText,
		Input,
	} from 'sveltestrap';

	export let nodeInfo;
	export let showHelp;
	export let readonly;
	export let jq;
	export let KFK;
	let helpShowing = false;
	let timerCodePrefix = '+';
	if (Parser.isEmpty(nodeInfo.nodeProps.TIMER.code)) {
		nodeInfo.nodeProps.TIMER.code = '+0:0:0:0:15:0';
	}
	let g = nodeInfo.nodeProps.TIMER.code.match(
		/(start)?(\+?)(\d+:)?(\d+:)?(\d+:)?(\d+:)?(\d+:)?(\d+)?/,
	);
	let t = [];
	let procType = 'START+';
	if (g !== null) {
		t = [
			parseInt(g[3]),
			parseInt(g[4]),
			parseInt(g[5]),
			parseInt(g[6]),
			parseInt(g[7]),
			parseInt(g[8]),
		];
		if (g[1] && g[2]) {
			//如果 start+ 开头
			//表示该时间为从流程启动开始往后的一个时间点
			procType = 'START+';
			timerCodePrefix = 'start+';
		} else if (g[2]) {
			//如果 只有 +号 开头
			//表示该时间为从现在开始往后的一个时间点
			procType = 'NOW+';
			timerCodePrefix = '+';
		} else {
			procType = 'FIXTIME';
			timerCodePrefix = '';
			//如果前面没有 start+,也没有+号, 则表示该时间为固定设定时间
		}
	} else {
		//如果 配置字符串格式有误,则缺省为从现在往后60分钟
		//TODO: 发邮件给管理员
		t = [0, 0, 0, 0, 60, 0];
		procType = 'NOW+';
		timerCodePrefix = '+';
	}
	t[0] = t[0] === 'NaN' ? 0 : t[0];
	t[1] = t[1] === NaN ? 0 : t[1];
	t[2] = t[2] === NaN ? 0 : t[2];
	t[3] = t[3] === NaN ? 0 : t[3];
	t[4] = t[4] === NaN ? 0 : t[4];
	t[5] = t[5] === NaN ? 0 : t[5];
	let tips = ['', '', '', ''];
	$: {
		nodeInfo.nodeProps.TIMER.code =
			timerCodePrefix + t[0] + ':' + t[1] + ':' + t[2] + ':' + t[3] + ':' + t[4] + ':' + t[5];
		tips[1] =
			timerCodePrefix === 'start+'
				? `节点将在流程启动后的`
				: timerCodePrefix === '+'
				? `节点将在上一节点完成后`
				: `节点将固定在`;
		tips[2] =
			timerCodePrefix === 'start+'
				? `${t[0] === 0 ? '' : t[0] + '年'}${t[1] === 0 ? '' : t[1] + '月'}${
						t[2] === 0 ? '' : t[2] + '天'
				  }${t[3] === 0 ? '' : t[3] + '小时'}${t[4] === 0 ? '' : t[4] + '分钟'}${
						t[5] === 0 ? '' : t[5] + '秒'
				  }`
				: timerCodePrefix === '+'
				? `${t[0] === 0 ? '' : t[0] + '年'}${t[1] === 0 ? '' : t[1] + '月'}${
						t[2] === 0 ? '' : t[2] + '天'
				  }${t[3] === 0 ? '' : t[3] + '小时'}${t[4] === 0 ? '' : t[4] + '分钟'}${
						t[5] === 0 ? '' : t[5] + '秒'
				  }`
				: `${t[0] === 0 ? '' : t[0] + '年'}${t[1] === 0 ? '' : t[1] + '月'}${
						t[2] === 0 ? '' : t[2] + '日'
				  }${t[3] === 0 ? '' : t[3] + '点'}${t[4] === 0 ? '' : t[4] + '分钟'}${
						t[5] === 0 ? '' : t[5] + '秒'
				  }`;
		tips[3] =
			timerCodePrefix === 'start+'
				? `后, 将流程流向下一节点`
				: timerCodePrefix === '+'
				? `后, 将流程流向下一节点`
				: `时, 将流程流向下一节点`;
		tips[0] = tips[1] + tips[2] + tips[3];
	}
</script>

<Container>
	<Row cols="1">
		<ChangeID {jq} bind:idForInput={nodeInfo.nodeProps.TIMER.id} {KFK} {readonly} on:changeNodeId />
		<Col>
			<InputGroup size="sm">
				<InputGroupText>
					{$_('prop.label')}
				</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.label} disabled={readonly} />
			</InputGroup>
		</Col>
	</Row>
	<Row cols="1">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>
					{$_('prop.timer.code')}
				</InputGroupText>
				<span class="kfk-timer-code ms-1">{nodeInfo.nodeProps.TIMER.code}</span>
			</InputGroup>
		</Col>
		<Col>
			<Container>
				<Row cols="1">
					<Col>{tips[1]}</Col>
					<Col>{tips[2]}</Col>
					<Col>{tips[3]}</Col>
				</Row>
			</Container>
		</Col>
		<Col class="mt-2">
			<InputGroup size="sm" disabled={readonly}>
				<InputGroupText>
					{$_('prop.timer.type')}
				</InputGroupText>
				<Input
					class="ms-1"
					type="radio"
					bind:group={timerCodePrefix}
					value="start+"
					label={$_('prop.timer.fromstart')}
					disabled={readonly} />
				<Input
					class="ms-1"
					type="radio"
					bind:group={timerCodePrefix}
					value="+"
					label={$_('prop.timer.fromnow')}
					disabled={readonly} />
				<Input
					class="ms-1"
					type="radio"
					bind:group={timerCodePrefix}
					value=""
					label={$_('prop.timer.fix')}
					disabled={readonly} />
			</InputGroup>
		</Col>
		<Col>
			<Container class="mt-2 kfk-timer-input">
				<Row cols="2">
					<Col>
						<InputGroup class="d-flex justify-content-start">
							<Input type="number" bind:value={t[0]} disabled={readonly} />
							<span class="align-self-center">年</span>
						</InputGroup>
					</Col>
					<Col>
						<InputGroup>
							<Input type="number" bind:value={t[1]} disabled={readonly} />
							<span class="align-self-center">月</span>
						</InputGroup>
					</Col>
					<Col>
						<InputGroup>
							<Input type="number" bind:value={t[2]} disabled={readonly} />
							<span class="align-self-center">日</span>
						</InputGroup>
					</Col>
					<Col>
						<InputGroup>
							<Input type="number" bind:value={t[3]} disabled={readonly} />
							<span class="align-self-center">时</span>
						</InputGroup>
					</Col>
					<Col>
						<InputGroup>
							<Input type="number" bind:value={t[4]} disabled={readonly} />
							<span class="align-self-center">分</span>
						</InputGroup>
					</Col>
					<Col>
						<InputGroup>
							<Input type="number" bind:value={t[5]} disabled={readonly} />
							<span class="align-self-center">秒</span>
						</InputGroup>
					</Col>
				</Row>
			</Container>
		</Col>
		<Col class="d-flex mt-3">
			<NavLink
				on:click={() => {
					helpShowing ? showHelp() : showHelp('TIMER');
					helpShowing = !helpShowing;
				}}
				class="ms-auto p-0 m-0">
				{#if helpShowing}
					<Icon name="chevron-left" />
					<Icon name="question-circle" />
				{:else}
					<Icon name="question-circle" />
					<Icon name="chevron-right" />
				{/if}
			</NavLink>
		</Col>
	</Row>
</Container>
