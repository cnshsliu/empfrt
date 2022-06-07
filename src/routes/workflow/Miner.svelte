<script lang="ts">
	import { _ } from '$lib/i18n';
	import { scaleLinear } from 'd3-scale';
	export let wfs;

	const datediff = function (s1, s2) {
		let d1 = Date.parse(s1);
		let d2 = Date.parse(s2);
		let diffInMs = Math.abs(d2 - d1);
		return diffInMs / (1000 * 60 * 60 * 24);
	};

	let barTypes = { lasting: true, works: true, todos: true };
	let max = { lasting: 0, works_number: 0, todos_number: 0, all_number: 0 };

	$: wfs &&
		(() => {
			for (let i = 0; i < wfs.length; i++) {
				if (['ST_DONE', 'ST_STOP'].includes(wfs[i].status)) {
					wfs[i].lasting = datediff(wfs[i].updatedAt, wfs[i].createdAt);
				} else {
					wfs[i].lasting = datediff(new Date(), wfs[i].createdAt);
				}
				if (wfs[i].lasting > max.lasting) max.lasting = wfs[i].lasting;

				if (Math.trunc(wfs[i].lasting) > 0) {
					wfs[i].lastingText = Math.trunc(wfs[i].lasting) + $_('days');
				}
				if (wfs[i].lasting % 1 > 0) {
					wfs[i].lastingText +=
						Math.round(((wfs[i].lasting % 1) * 24 + Number.EPSILON) * 10) / 10 + 'H';
				}
				if (wfs[i].mdata.works && wfs[i].mdata.works.length > max.works_number) {
					max.works_number = wfs[i].mdata.works.length;
					if (barTypes.works) {
						if (max.works_number > max.all_number) max.all_number = max.works_number;
					}
				}
				if (wfs[i].mdata.todos && wfs[i].mdata.todos.length > max.todos_number) {
					max.todos_number = wfs[i].mdata.todos.length;
					if (barTypes.todos) {
						if (max.todos_number > max.all_number) max.all_number = max.todos_number;
					}
				}
			}
			console.log(max);
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

	let miningWidth = 10;
	let width = 500;
	let height = 300;
	let number_of_bar_types = 3;
	let number_of_empty_bars_between_wf = 2;
	let realBarHeight = 20;
	let realWfHeight =
		realBarHeight *
		(number_of_bar_types + (number_of_bar_types - 1) * 0.5 + number_of_empty_bars_between_wf);
	$: realMiningHeight = realWfHeight * wfs.length;
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
</script>

<div>
	{#each wfs as aWf, aWfIndex}
		<div class="row">
			{aWf.wftitle}
			{aWf.createdAt}, {aWf.updatedAt}
			{aWf.lasting}/{max.lasting}
			{aWf.mdata.works?.length}/{max.works_number}
			{aWf.mdata.todos?.length}/{max.todos_number}
		</div>
	{/each}
	<div
		bind:clientWidth={miningWidth}
		style={`width:100%; margin:0 auto; height: ${realMiningHeight}px;`}>
		<svg style="position: relative; width: 100%; height: 100%">
			<g class="lasting">
				{#each wfs as aWf, i}
					<rect
						x={0}
						y={yScaleWf(i)}
						width={miningWidth * (aWf.lasting / max.lasting) || 1}
						height={realBarHeight} />
				{/each}
			</g>
			<g class="lasting_text" style={`font-size: ${realBarHeight * 0.8}px`}>
				{#each wfs as aWf, i}
					<text
						x={miningWidth * (aWf.lasting / max.lasting) || 1}
						y={yScaleWf(i) + realBarHeight * 0.5}>
						{aWf.lastingText}
					</text>
				{/each}
			</g>
			{#if barTypes.todos}
				<g class="todos_number">
					{#each wfs as aWf, i}
						<rect
							x={0}
							y={yScaleWf(i) + realBarHeight * 1.5}
							width={miningWidth * (aWf.mdata.todos.length / max.all_number) || 1}
							height={realBarHeight} />
					{/each}
				</g>
			{/if}
			{#if barTypes.works}
				<g class="works_number">
					{#each wfs as aWf, i}
						<rect
							x={0}
							y={yScaleWf(i) + realBarHeight * 3}
							width={miningWidth * (aWf.mdata.works.length / max.all_number) || 1}
							height={realBarHeight} />
					{/each}
				</g>
			{/if}
		</svg>
	</div>
</div>
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
		font-family: Helvetica, Arial;
		font-weight: 100;
		fill: #ffffff;
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
</style>
