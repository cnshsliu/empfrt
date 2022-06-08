<script lang="ts">
	import { _ } from '$lib/i18n';
	import { scaleLinear } from 'd3-scale';
	import { goto } from '$app/navigation';
	import { text } from 'svelte/internal';
	export let wfs;

	const datediff = function (s1, s2) {
		let d1 = Date.parse(s1);
		let d2 = Date.parse(s2);
		let diffInMs = Math.abs(d2 - d1);
		return diffInMs / (1000 * 60 * 60 * 24);
	};

	let popPos = { x: 0, y: 0 };
	let shown = { onlyAboveThreshold: false, adjusting: false };
	let barTypes = { lasting: true, works: true, todos: true };
	let theWorkInfo = '';
	let max = { lasting: 0, works_number: 0, todos_number: 0, all_number: 0 };
	let redlight_unit = 'hour';
	let redlight_threshold = -1;
	let redlight_threshold_days = 1;
	let redlight_threshold_hours = 24;
	$: redlight_threshold =
		redlight_unit === 'hour' ? redlight_threshold_hours : redlight_threshold_days * 24;

	let filteredWfs = [];

	$: wfs &&
		(() => {
			for (let i = 0; i < wfs.length; i++) {
				wfs[i].aboveThreshold = false;
				if (['ST_DONE', 'ST_STOP'].includes(wfs[i].status)) {
					//如果工作流结束或者停止，其持续时长通过createdAt和updatedAt相比较获得
					wfs[i].lasting = datediff(wfs[i].updatedAt, wfs[i].createdAt);
				} else {
					//否则，其持续时长通过createdAt和now相比较获得
					wfs[i].lasting = datediff(new Date(), wfs[i].createdAt);
				}
				//计算最长lasting
				if (wfs[i].lasting > max.lasting) max.lasting = wfs[i].lasting;

				if (Math.trunc(wfs[i].lasting) > 0) {
					//取整数部分，当作天
					wfs[i].lastingText = Math.trunc(wfs[i].lasting) + $_('unit.days');
				} else {
					wfs[i].lastingText = '';
				}
				if (wfs[i].lasting % 1 > 0) {
					//取小数部分，折算为小时，然后，保留到小数点后一位
					wfs[i].lastingText +=
						Math.round(((wfs[i].lasting % 1) * 24 + Number.EPSILON) * 10) / 10 + $_('unit.hours');
				}
				if (wfs[i].mdata.works && wfs[i].mdata.works.length > max.works_number) {
					// 计算最大works个数，
					max.works_number = wfs[i].mdata.works.length;
					if (barTypes.works) {
						// 计算最大个数，works和todos放在一起统计
						if (max.works_number > max.all_number) max.all_number = max.works_number;
					}
				}
				if (wfs[i].mdata.todos && wfs[i].mdata.todos.length > max.todos_number) {
					// 计算最大todos个数，
					max.todos_number = wfs[i].mdata.todos.length;
					if (barTypes.todos) {
						// 计算最大个数，works和todos放在一起统计
						if (max.todos_number > max.all_number) max.all_number = max.todos_number;
					}
				}
				if (wfs[i].mdata.todos) {
					for (let t = 0; t < wfs[i].mdata.todos.length; t++) {
						const todoLasting =
							wfs[i].mdata.todos[t].status === 'ST_DONE'
								? datediff(wfs[i].mdata.todos[t].doneat, wfs[i].mdata.todos[t].createdAt)
								: wfs[i].mdata.todos[t].status === 'ST_RUN'
								? datediff(new Date(), wfs[i].mdata.todos[t].createdAt)
								: wfs[i].mdata.todos[t].status === 'ST_RETURNED'
								? datediff(wfs[i].mdata.todos[t].updatedAt, wfs[i].mdata.todos[t].createdAt)
								: -1;
						if (todoLasting > 0) {
							wfs[i].mdata.todos[t].pureLasting = todoLasting * 24;
							wfs[i].mdata.todos[t].lasting =
								Math.round((todoLasting * 24 + Number.EPSILON) * 10) / 10;
							wfs[i].mdata.todos[t].lastingText = wfs[i].mdata.todos[t].lasting + $_('unit.hours');
						} else {
							wfs[i].mdata.todos[t].pureLasting = -1;
							wfs[i].mdata.todos[t].lasting = -1;
							wfs[i].mdata.todos[t].lastingText = 'Ignored';
						}
						//console.log(wfs[i].mdata.todos[t].status, wfs[i].mdata.todos[t].lastingText);
					}
				}
				wfs[i].todos_total_lasting = 0;
				if (wfs[i].mdata.todos) {
					for (let t = 0; t < wfs[i].mdata.todos.length; t++) {
						if (wfs[i].mdata.todos[t].pureLasting > 0) {
							wfs[i].todos_total_lasting += wfs[i].mdata.todos[t].pureLasting;
						}
					}
				}

				if (wfs[i].mdata.works) {
					for (let t = 0; t < wfs[i].mdata.works.length; t++) {
						const workLasting =
							wfs[i].mdata.works[t].status === 'ST_DONE'
								? datediff(wfs[i].mdata.works[t].doneat, wfs[i].mdata.works[t].createdAt)
								: wfs[i].mdata.works[t].status === 'ST_RUN'
								? datediff(new Date(), wfs[i].mdata.works[t].createdAt)
								: wfs[i].mdata.works[t].status === 'ST_RETURNED'
								? datediff(wfs[i].mdata.works[t].updatedAt, wfs[i].mdata.works[t].createdAt)
								: -1;
						if (workLasting > 0) {
							wfs[i].mdata.works[t].pureLasting = workLasting * 24;
							wfs[i].mdata.works[t].lasting =
								Math.round((workLasting * 24 + Number.EPSILON) * 10) / 10;
							wfs[i].mdata.works[t].lastingText = wfs[i].mdata.works[t].lasting + $_('unit.hours');
						} else {
							wfs[i].mdata.works[t].pureLasting = -1;
							wfs[i].mdata.works[t].lasting = -1;
							wfs[i].mdata.works[t].lastingText = 'Ignored';
						}
						console.log(wfs[i].mdata.works[t].status, wfs[i].mdata.works[t].lastingText);
						if (wfs[i].mdata.works[t].pureLasting >= redlight_threshold) {
							wfs[i].aboveThreshold = true;
						}
					}
				}
				wfs[i].works_total_lasting = 0;
				if (wfs[i].mdata.works) {
					for (let t = 0; t < wfs[i].mdata.works.length; t++) {
						if (wfs[i].mdata.works[t].pureLasting > 0) {
							wfs[i].works_total_lasting += wfs[i].mdata.works[t].pureLasting;
						}
					}
				}
			}
			if (shown.onlyAboveThreshold === true) {
				filteredWfs = wfs.filter((x) => x.aboveThreshold === true);
			} else {
				filteredWfs = wfs;
			}
		})();

	const points = [
		{ year: 1990, birthrate: 16.7 },
		{ year: 1995, birthrate: 14.6 },
		{ year: 2000, birthrate: 14.4 },
		{ year: 2005, birthrate: 14 },
		{ year: 2010, birthrate: 13 },
		{ year: 2015, birthrate: 12.4 },
	];

	const xTicks = [1990, 1995, 2000, 2005, 2010, 2015];
	const yTicks = [0, 5, 10, 15, 20];
	const padding = { top: 20, right: 15, bottom: 20, left: 25 };

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
	$: number_of_bar_types = Object.keys(barTypes).filter((x) => barTypes[x]).length;
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

	$: xScale = scaleLinear()
		.domain([0, xTicks.length])
		.range([padding.left, width - padding.right]);

	$: yScale = scaleLinear()
		.domain([0, Math.max.apply(null, yTicks)])
		.range([height - padding.bottom, padding.top]);

	$: innerWidth = width - (padding.left + padding.right);
	$: barWidth = innerWidth / xTicks.length;

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
		yScaleWf(i) + realBarHeight * (barTypes.works ? 2 * barSkip : barSkip);
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
				theWorkInfo += `${aWf.mdata.todos[i].title} ${aWf.mdata.todos[i].doerCN} <BR>`;
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
	{#each wfs as aWf, aWfIndex}
		<div class="row">
			{aWf.wftitle}
			{aWf.createdAt}, {aWf.updatedAt}
			{aWf.lasting}/{max.lasting}
			{aWf.mdata.works?.length}/{max.works_number}
			{aWf.mdata.todos?.length}/{max.todos_number}
		</div>
	{/each}
	<div class="row">
		<div class="col">&nbsp;</div>
		<div class="col-auto">
			<div class="mining_option_area">
				<label>{$_('mining.redlight_threshold')}</label>
				{#if redlight_unit === 'hour'}
					<input
						type="number"
						bind:value={redlight_threshold_hours}
						min="1"
						max={7 * 24}
						step="1" />
				{:else}
					<input type="number" bind:value={redlight_threshold_days} min="1" max="365" step="1" />
				{/if}
				<input type="radio" id="radio_hour" bind:group={redlight_unit} value="hour" />
				<label for="radio_hour">{$_('unit.hours')}</label>
				<input type="radio" id="radio_day" bind:group={redlight_unit} value="day" />
				<label for="radio_day">{$_('unit.days')}</label>
			</div>
			<div class="mining_option_area">
				<input type="checkbox" bind:checked={barTypes.works} />
				Works
				<input type="checkbox" bind:checked={barTypes.todos} />
				Todos
			</div>
			<div class="mining_option_area">
				<input type="checkbox" bind:checked={shown.onlyAboveThreshold} />
				Above Threshold
			</div>
		</div>
	</div>
	<div
		bind:clientWidth={miningWidth}
		style={`width:100%; margin:0 auto; height: ${realMiningHeight}px;`}>
		<svg style="position: relative; width: 100%; height: 100%">
			<g class="lasting">
				{#each filteredWfs as aWf, i}
					<rect
						x={0}
						y={yScaleWf(i)}
						width={miningWidth * (aWf.lasting / max.lasting) || 1}
						height={realBarHeight} />
				{/each}
			</g>
			<g class="lasting_text" style={`font-size: ${realBarHeight * 0.8}px`}>
				{#each filteredWfs as aWf, i}
					<text
						class={(miningWidth * (aWf.lasting / max.lasting) || 1) < 100 ? 'shorter' : ''}
						x={miningWidth * (aWf.lasting / max.lasting) || 1}
						y={yScaleWf(i) + realBarHeight * 0.5}>
						{aWf.lastingText}
					</text>
				{/each}
			</g>
			{#if barTypes.works}
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
										shown.adjusting = true;
									}}
									on:focus|preventDefault|stopPropagation={(e) => {
										setWorkInfo(aWf, aWork);
										shown.adjusting = true;
									}}
									on:mouseout|preventDefault|stopPropagation={(e) => {
										clearWorkInfo();
										shown.adjusting = false;
									}}
									on:blur|preventDefault|stopPropagation={(e) => {
										clearWorkInfo();
										shown.adjusting = false;
									}}
									on:click|preventDefault|stopPropagation={(e) => {
										//goto(`/workflow/${aWf.wfid}`);
										window.open(`/workflow/${aWf.wfid}`, '_blank');
									}}>
									<circle
										cx={getWorkX(aWf, i, t) + getRedlampRadius()}
										cy={getWorkBarY(aWf, i) + getWorkBarHeight(aWf, i) * 0.5}
										r={getRedlampRadius()}
										style="cursor: pointer; fill:red; stroke:red; stroke-width:1;
stroke-opacity:.5;
fill-opacity:1" />
									<text
										x={getWorkX(aWf, i, t) + getRedlampRadius() * 2}
										y={getWorkBarY(aWf, i) + getWorkBarHeight(aWf, i) * 0.5}>
										{aWork.lasting}
									</text>
								</g>
							{/if}
						{/each}
					{/each}
				</g>
			{/if}
			{#if barTypes.todos}
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
{#if shown.adjusting}
	<div class="adjuster" style={`top: ${popPos.y}px; left: ${popPos.x}px;`}>
		<p>{@html theWorkInfo}</p>
	</div>
{/if}
<h2>US birthrate by year</h2>
<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
	<svg>
		<!-- y axis -->
		<g class="axis y-axis">
			{#each yTicks as tick}
				<g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
					<line x2="100%" />
					<text y="-4">{tick} {tick === 20 ? ' per 1,000 population' : ''}</text>
				</g>
			{/each}
		</g>

		<!-- x axis -->
		<g class="axis x-axis">
			{#each points as point, i}
				<g class="tick" transform="translate({xScale(i)},{height})">
					<text x={barWidth / 2} y="-4">
						{width > 380 ? point.year : formatMobile(point.year)}
					</text>
				</g>
			{/each}
		</g>

		<g class="bars">
			{#each points as point, i}
				<rect
					x={xScale(i) + 2}
					y={yScale(point.birthrate)}
					width={barWidth - 4}
					height={yScale(0) - yScale(point.birthrate)} />
			{/each}
		</g>
	</svg>
</div>

<style>
	h2 {
		text-align: center;
	}

	.miningChart {
		width: 100%;
		margin: 0 auto;
	}
	.miningSvg {
		position: relative;
		width: 100%;
		height: 500px;
	}

	.chart {
		width: 100%;
		margin: 0 auto;
	}

	svg {
		position: relative;
		width: 100%;
		height: 500px;
	}

	.tick {
		font-family: Helvetica, Arial;
		font-size: 0.725em;
		font-weight: 200;
	}

	.tick line {
		stroke: #e2e2e2;
		stroke-dasharray: 2;
	}

	.tick text {
		fill: #ccc;
		text-anchor: start;
	}

	.tick.tick-0 line {
		stroke-dasharray: 0;
	}

	.x-axis .tick text {
		text-anchor: middle;
	}

	.lasting rect {
		fill: #11a;
		stroke: none;
		opacity: 0.65;
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

	.works_abnormal text,
	.todos_abnormal text {
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
	.bars rect {
		fill: #a11;
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
