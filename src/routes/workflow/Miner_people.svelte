<script lang="ts">
	import { _ } from '$lib/i18n';
	import { scaleLinear } from 'd3-scale';
	import { miningConfig } from '$lib/Stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { text } from 'svelte/internal';
	export let people = [];

	const padding = { top: 20, right: 15, bottom: 20, left: 25 };
	let popPos = { x: 0, y: 0 };
	let showTaskInfo = false;
	let theWorkInfo = '';

	//
	//三个初始值
	let miningWidth = 10;
	let width = 500;
	let height = 300;
	// 单个bar的高度
	let realBarHeight = 20;
	//
	// 两个工作流之间的间隔，相对与单个bar高度的倍数
	let number_of_empty_bars_between_wf = 0.5;
	//
	// bars之间的间隔相对与单个bar高度的倍数
	let divider_width_between_bars = 0.2;
	//
	// 下一个bar的Y位置跳过的单个bar高度的倍数
	$: barSkip = 1 + divider_width_between_bars;
	//
	//用户所选择的bar类型的数量：lasting始终在
	$: number_of_bar_types = Object.keys($miningConfig.barTypes).filter(
		(x) => $miningConfig.barTypes[x],
	).length;
	//
	//一个工作流的多个bars所占的总高度
	$: realWfHeight = realBarHeight * (1 + number_of_empty_bars_between_wf);
	//
	//整个图标所占的总高度
	$: realMiningHeight = realWfHeight * people.length;
	//
	// 工作流在Y轴上的分布
	$: yScaleWf = scaleLinear()
		.domain([0, people.length])
		.range([padding.top, realMiningHeight - padding.bottom]);

	function formatMobile(tick) {
		return "'" + tick.toString().slice(-2);
	}

	// works bar的X位置
	const getWorkBarX = (aWf, i) => 0;
	// works bar的Y位置
	const getWorkBarY = (aWf, i) => yScaleWf(i) + realBarHeight * barSkip;
	// works bar的宽度
	const getWorkBarWidth = (aWf, i) => miningWidth * (aWf.mdata.works.length / max.all_number) || 1;
	// works bar的高度
	const getWorkBarHeight = (aWf, i) => realBarHeight;

	// todos bar的X位置
	const getTodoBarX = (aWf, i) => 0;
	// todos bar的Y位置
	const getTodoBarY = (aWf, i) =>
		yScaleWf(i) + realBarHeight * ($miningConfig.barTypes.works ? 2 * barSkip : barSkip);
	// todos bar的宽度
	const getTodoBarWidth = (aWf, i) => miningWidth * (aWf.mdata.todos.length / max.all_number) || 1;
	// todos bar的高度
	const getTodoBarHeight = (aWf, i) => realBarHeight;
	const getRedlampRadius = () => realBarHeight * 0.3;

	const getTodoX = (aWf, i, todoIndex) => {
		let previousLasting = 0;
		for (let t = 0; t < todoIndex; t++) {
			previousLasting += aWf.mdata.todos[t].pureLasting > 0 ? aWf.mdata.todos[t].pureLasting : 0;
		}
		return (getTodoBarWidth(aWf, i) * previousLasting) / aWf.todos_total_lasting;
	};

	const getWorkX = (aWf, i, workIndex) => {
		let previousLasting = 0;
		for (let t = 0; t < workIndex; t++) {
			previousLasting += aWf.mdata.works[t].pureLasting > 0 ? aWf.mdata.works[t].pureLasting : 0;
		}
		return (getWorkBarWidth(aWf, i) * previousLasting) / aWf.works_total_lasting;
	};

	const setWorkInfo = (aWf, aWork) => {
		theWorkInfo = '';
		for (let i = 0; i < aWf.mdata.todos.length; i++) {
			if (aWf.mdata.todos[i].wfid === aWork.wfid && aWf.mdata.todos[i].workid === aWork.workid) {
				theWorkInfo += `${aWf.mdata.todos[i].doerCN} : ${aWf.mdata.todos[i].lastingFullText} : ${aWf.mdata.todos[i].title} <BR>`;
			}
		}
	};
	const clearWorkInfo = () => {
		theWorkInfo = '';
	};

	let max = { tasks_number: 0, longestLasting: 1, averageLasting: 1, totalLasting: 1, started: 0 };

	const reSort = () => {
		if (people.length < 1) return;
		if ($miningConfig.peopleby === 'tasks_number') {
			people.sort((a, b) => {
				return b.todos.length - a.todos.length;
			});
			max.tasks_number = people[0].todos.length;
			for (let i = 0; i < people.length; i++) {
				people[i].width = miningWidth * (people[i].todos.length / max.tasks_number);
				people[i].label = people[i].doerCN + ': ' + people[i].todos.length + $_('unit.tasks');
			}
		} else if ($miningConfig.peopleby === 'tasks_longest_lasting') {
			people.sort((a, b) => {
				return b.longestLasting - a.longestLasting;
			});
			max.longestLasting = people[0].longestLasting;
			for (let i = 0; i < people.length; i++) {
				people[i].width = miningWidth * (people[i].longestLasting / max.longestLasting);
				people[i].label =
					people[i].doerCN +
					':' +
					Math.round((people[i].longestLasting + Number.EPSILON) * 10) / 10 +
					$_('unit.days');
			}
		} else if ($miningConfig.peopleby === 'tasks_average_lasting') {
			people.sort((a, b) => {
				return b.averageLasting - a.averageLasting;
			});
			max.averageLasting = people[0].averageLasting;
			for (let i = 0; i < people.length; i++) {
				people[i].width = miningWidth * (people[i].averageLasting / max.averageLasting);
				people[i].label =
					people[i].doerCN +
					':' +
					Math.round((people[i].averageLasting + Number.EPSILON) * 10) / 10 +
					$_('unit.days');
			}
		} else if ($miningConfig.peopleby === 'tasks_total_lasting') {
			people.sort((a, b) => {
				return b.totalLasting - a.totalLasting;
			});
			max.totalLasting = people[0].totalLasting;
			for (let i = 0; i < people.length; i++) {
				people[i].width = miningWidth * (people[i].totalLasting / max.totalLasting);
				people[i].label =
					people[i].doerCN +
					':' +
					Math.round((people[i].totalLasting + Number.EPSILON) * 10) / 10 +
					$_('unit.days');
			}
		} else if ($miningConfig.peopleby === 'started_processes_number') {
			people.sort((a, b) => {
				return b.processes.length - a.processes.length;
			});
			max.started = people[0].processes.length;
			for (let i = 0; i < people.length; i++) {
				people[i].width = miningWidth * (people[i].processes.length / max.started);
				people[i].label = people[i].doerCN + ':' + people[i].processes.length;
			}
		}
		people = people;
	};

	$: people && people.length > 1 && reSort();

	onMount(async () => {
		reSort();
	});
</script>

<div class="row mt-3">
	<div class="col">&nbsp;</div>
	<div class="col-auto">
		<div class="mining_option_area">
			<select bind:value={$miningConfig.peopleby}>
				<option value="tasks_number">{$_('mining.task.number')}</option>
				<option value="tasks_longest_lasting">{$_('mining.task.longest')}</option>
				<option value="tasks_average_lasting">{$_('mining.task.average')}</option>
				<option value="tasks_total_lasting">{$_('mining.task.total')}</option>
				<option value="started_processes_number">{$_('mining.task.processes')}</option>
			</select>
		</div>
	</div>
</div>

<div
	on:mousemove={(e) => {
		popPos.x = e.pageX + realBarHeight;
		popPos.y = e.pageY;
	}}>
	<div class="row">
		<div class="text-center">
			{$_('mining.total', {
				values: { number: people.length, total: people.length },
			})}
		</div>
	</div>
	<!--div>
		{#each people as person, i}
			{#if $miningConfig.peopleby === 'tasks_number'}
				<div>{person.todos.length}</div>
			{:else}
				<div>{person.longestLasting}</div>
			{/if}
		{/each}
	</div -->
	<div
		bind:clientWidth={miningWidth}
		style={`width:100%; margin:0 auto; height: ${realMiningHeight}px;`}>
		<svg style="position: relative; width: 100%; height: 100%">
			<g class="wf_with_lasting">
				{#each people as person, i}
					<rect
						on:click|preventDefault|stopPropagation={(e) => {
							window.open(`/workflow/${person.wfid}`, `${person.wfid}`);
						}}
						x={0}
						y={yScaleWf(i)}
						width={person.width}
						height={realBarHeight} />
				{/each}
			</g>
			<g class="lasting_text" style={`font-size: ${realBarHeight * 0.8}px`}>
				{#each people as person, i}
					<!-- svelte-ignore component-name-lowercase -->
					<text
						class={(person.width || 1) < 150 ? 'shorter' : ''}
						x={person.width}
						y={yScaleWf(i) + realBarHeight * 0.5}>
						{person.label}
					</text>
				{/each}
			</g>
		</svg>
	</div>
</div>
{#if showTaskInfo}
	<div class="adjuster" style={`top: ${popPos.y}px; left: ${popPos.x}px;`}>
		<p>{@html theWorkInfo}</p>
	</div>
{/if}

<style>
	svg {
		position: relative;
		width: 100%;
		height: 500px;
	}

	.wf_with_lasting rect {
		fill: #11a;
		stroke: none;
		opacity: 0.65;
		cursor: pointer;
	}

	.lasting_text text {
		text-anchor: end;
		alignment-baseline: middle;
		dominant-baseline: middle;
		font-weight: lighter;
		fill: #ffffff;
	}

	.lasting_text text.shorter {
		text-anchor: start;
		alignment-baseline: middle;
		dominant-baseline: middle;
		font-weight: lighter;
		fill: #000000;
	}

	.mining_option_area {
		padding: 1em;
		background-color: rgba(255, 255, 255, 0.7);
		border-radius: 4px;
		display: inline-block;
	}

	.adjuster {
		position: absolute;
		width: 80%;
		padding: 1em;
		top: 0px;
		left: 0px;
		text-align: start;
		background-color: rgba(255, 255, 255, 0.7);
		border-radius: 4px;
	}
</style>
