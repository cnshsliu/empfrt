<script lang="ts">
	import { _ } from '$lib/i18n';
	import { scaleLinear } from 'd3-scale';
	import { miningConfig } from '$lib/Stores';
	import { goto } from '$app/navigation';
	import { text } from 'svelte/internal';
	export let wfs;
	export let filteredWfs;
	export let max;
	export let redlight_threshold;

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
	let number_of_empty_bars_between_wf = 2;
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
	$: realWfHeight =
		realBarHeight *
		(number_of_bar_types +
			(number_of_bar_types - 1) * divider_width_between_bars +
			number_of_empty_bars_between_wf);
	//
	//整个图标所占的总高度
	$: realMiningHeight = realWfHeight * wfs.length;
	//
	// 工作流在Y轴上的分布
	$: yScaleWf = scaleLinear()
		.domain([0, wfs.length])
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
</script>

<div
	on:mousemove={(e) => {
		popPos.x = e.pageX + realBarHeight;
		popPos.y = e.pageY;
	}}>
	<!--
	{#each wfs as aWf, aWfIndex}
		<div class="row">
			{aWf.wftitle}
			{aWf.createdAt}, {aWf.updatedAt}
			{aWf.lasting}/{max.lasting}
			{aWf.mdata.works?.length}/{max.works_number}
			{aWf.mdata.todos?.length}/{max.todos_number}
		</div>
	{/each}
	-->
	<div class="row mt-3">
		<div class="col">&nbsp;</div>
		<div class="col-auto">
			<div class="mining_option_area">
				<input type="checkbox" bind:checked={$miningConfig.showOnlyAboveThreshold} />
				{$_('mining.show.only_above_threshold')}
			</div>
			<div class="mining_option_area">
				<input type="checkbox" bind:checked={$miningConfig.withWhat.process} />
				<span>{$_('mining.show.with_process')}</span>
				<span>{$_('mining.process_threshold')}</span>
				<input
					type="number"
					bind:value={$miningConfig.process_threshold_days}
					min="1"
					max="365"
					step="1" />
				<label for="radio_day">{$_('unit.days')}</label>
			</div>
			<div class="mining_option_area">
				<input type="checkbox" bind:checked={$miningConfig.withWhat.todos} />
				<span>{$_('mining.show.with_todos')}</span>
				<span>{$_('mining.redlight_threshold')}</span>
				{#if $miningConfig.redlight_unit === 'hour'}
					<input
						type="number"
						bind:value={$miningConfig.redlight_threshold_hours}
						min="1"
						max={7 * 24}
						step="1" />
				{:else}
					<input
						type="number"
						bind:value={$miningConfig.redlight_threshold_days}
						min="1"
						max="365"
						step="1" />
				{/if}
				<input type="radio" id="radio_hour" bind:group={$miningConfig.redlight_unit} value="hour" />
				<label for="radio_hour">{$_('unit.hours')}</label>
				<input type="radio" id="radio_day" bind:group={$miningConfig.redlight_unit} value="day" />
				<label for="radio_day">{$_('unit.days')}</label>
			</div>
			<div class="mining_option_area">
				{$_('mining.show.show')}
				<input type="checkbox" bind:checked={$miningConfig.barTypes.works} />
				{$_('mining.show.works')}
				<input type="checkbox" bind:checked={$miningConfig.barTypes.todos} />
				{$_('mining.show.todos')}
			</div>
		</div>
	</div>
	<div class="row">
		<div class="text-center">
			{$_('mining.total', { values: { number: filteredWfs.length, total: wfs.length } })}
		</div>
	</div>
	<div
		bind:clientWidth={miningWidth}
		style={`width:100%; margin:0 auto; height: ${realMiningHeight}px;`}>
		<svg style="position: relative; width: 100%; height: 100%">
			<g class="wf_with_lasting">
				{#each filteredWfs as aWf, i}
					<rect
						class={aWf.lasting >= $miningConfig.process_threshold_days ? 'abnormal' : ''}
						on:click|preventDefault|stopPropagation={(e) => {
							window.open(`/workflow/${aWf.wfid}`, `${aWf.wfid}`);
						}}
						x={0}
						y={yScaleWf(i)}
						width={miningWidth * (aWf.lasting / max.lasting) || 1}
						height={realBarHeight} />
				{/each}
			</g>
			<g class="lasting_text" style={`font-size: ${realBarHeight * 0.8}px`}>
				{#each filteredWfs as aWf, i}
					<!-- svelte-ignore component-name-lowercase -->
					<text
						class={(miningWidth * (aWf.lasting / max.lasting) || 1) < 100 ? 'shorter' : ''}
						x={miningWidth * (aWf.lasting / max.lasting) || 1}
						y={yScaleWf(i) + realBarHeight * 0.5}>
						{aWf.lastingText}
					</text>
				{/each}
			</g>
			{#if $miningConfig.barTypes.works}
				<g class="works_number">
					{#each filteredWfs as aWf, i}
						<rect
							x={getWorkBarX(aWf, i)}
							y={getWorkBarY(aWf, i)}
							width={getWorkBarWidth(aWf, i)}
							height={getWorkBarHeight(aWf, i)} />
					{/each}
				</g>
				<g class="works_text" style={`font-size: ${realBarHeight * 0.8}px`}>
					{#each filteredWfs as aWf, i}
						<!-- svelte-ignore component-name-lowercase -->
						<text
							class={getWorkBarWidth(aWf, i) < 100 ? 'shorter' : ''}
							x={getWorkBarWidth(aWf, i)}
							y={getWorkBarY(aWf, i) + getWorkBarHeight(aWf, i) * 0.5}>
							{aWf.mdata.works.length}{$_('unit.nodes')}
						</text>
					{/each}
				</g>
				<g class="works_abnormal" style={`font-size: ${realBarHeight * 0.8}px`}>
					{#each filteredWfs as aWf, i}
						{#each aWf.mdata.works as aWork, t}
							{#if aWork.pureLasting >= redlight_threshold}
								<g
									on:mouseover|preventDefault|stopPropagation={(e) => {
										setWorkInfo(aWf, aWork);
										showTaskInfo = true;
									}}
									on:focus|preventDefault|stopPropagation={(e) => {
										setWorkInfo(aWf, aWork);
										showTaskInfo = true;
									}}
									on:mouseout|preventDefault|stopPropagation={(e) => {
										clearWorkInfo();
										showTaskInfo = false;
									}}
									on:blur|preventDefault|stopPropagation={(e) => {
										clearWorkInfo();
										showTaskInfo = false;
									}}
									on:click|preventDefault|stopPropagation={(e) => {
										window.open(`/workflow/${aWf.wfid}`, `${aWf.wfid}`);
									}}>
									<circle
										cx={getWorkX(aWf, i, t) + getRedlampRadius()}
										cy={getWorkBarY(aWf, i) + getWorkBarHeight(aWf, i) * 0.5}
										r={getRedlampRadius()}
										style="cursor: pointer; fill:red; stroke:red; stroke-width:1;
stroke-opacity:.5;
fill-opacity:1" />
									<!-- svelte-ignore component-name-lowercase -->
									<text
										x={getWorkX(aWf, i, t) + getRedlampRadius() * 2}
										y={getWorkBarY(aWf, i) + getWorkBarHeight(aWf, i) * 0.5}>
										{aWork.lastingText}
									</text>
								</g>
							{/if}
						{/each}
					{/each}
				</g>
			{/if}
			{#if $miningConfig.barTypes.todos}
				<g class="todos_number">
					{#each filteredWfs as aWf, i}
						<rect
							x={getTodoBarX(aWf, i)}
							y={getTodoBarY(aWf, i)}
							width={getTodoBarWidth(aWf, i)}
							height={getTodoBarHeight(aWf, i)} />
					{/each}
				</g>
				<g class="todos_text" style={`font-size: ${realBarHeight * 0.8}px`}>
					{#each filteredWfs as aWf, i}
						<!-- svelte-ignore component-name-lowercase -->
						<text
							class={getTodoBarWidth(aWf, i) < 100 ? 'shorter' : ''}
							x={getTodoBarWidth(aWf, i)}
							y={getTodoBarY(aWf, i) + getTodoBarHeight(aWf, i) * 0.5}>
							{aWf.mdata.todos.length}{$_('unit.tasks')}
						</text>
					{/each}
				</g>
				<!--g class="todos_abnormal" style={`font-size: ${realBarHeight * 0.8}px`}>
					{#each filteredWfs as aWf, i}
						{#each aWf.mdata.todos as aTodo, t}
							{#if aTodo.pureLasting >= redlight_threshold}
								<text
									x={getTodoX(aWf, i, t)}
									y={getTodoBarY(aWf, i) + getTodoBarHeight(aWf, i) * 0.5}>
									{aTodo.lasting}
								</text>
							{/if}
						{/each}
					{/each}
				</g -->
			{/if}
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
	.wf_with_lasting rect.abnormal {
		fill: #a11;
		stroke: none;
		opacity: 1;
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

	.works_text text,
	.todos_text text {
		text-anchor: end;
		alignment-baseline: middle;
		dominant-baseline: middle;
		font-weight: lighter;
		fill: #ffffff;
	}

	.works_abnormal text {
		text-anchor: start;
		alignment-baseline: middle;
		dominant-baseline: middle;
		font-weight: lighter;
		fill: #ffffff;
		cursor: pointer;
	}

	.works_text text.shorter,
	.todos_text text.shorter {
		text-anchor: start;
		alignment-baseline: middle;
		dominant-baseline: middle;
		font-weight: lighter;
		fill: #000000;
	}

	.todos_number rect {
		fill: #a11;
		stroke: none;
		opacity: 0.65;
	}

	.todos_number rect {
		fill: #1a1;
		stroke: none;
		opacity: 0.65;
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
