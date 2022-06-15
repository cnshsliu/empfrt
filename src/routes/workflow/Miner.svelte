<script lang="ts">
	import { _ } from '$lib/i18n';
	import { scaleLinear } from 'd3-scale';
	import { miningConfig } from '$lib/Stores';
	import Miner_time from './Miner_time.svelte';
	import Miner_people from './Miner_people.svelte';
	import { goto } from '$app/navigation';
	import { text } from 'svelte/internal';
	import { Nav, NavItem, NavLink } from 'sveltestrap';

	export let wfs;

	let people = [];

	const datediff = function (s1, s2) {
		let d1 = Date.parse(s1);
		let d2 = Date.parse(s2);
		let diffInMs = Math.abs(d2 - d1);
		return diffInMs / (1000 * 60 * 60 * 24);
	};

	let max = { lasting: 0, works_number: 0, todos_number: 0, all_number: 0 };
	$: redlight_threshold =
		$miningConfig.redlight_unit === 'hour'
			? $miningConfig.redlight_threshold_hours
			: $miningConfig.redlight_threshold_days * 24;

	let filteredWfs = [];

	const getLastingDaysText = (lasting) => {
		let ret = '';
		ret = Math.round((lasting + Number.EPSILON) * 10) / 10 + $_('unit.days');
		return ret;
	};

	const getLastingFullText = (lasting) => {
		let ret = '';
		if (Math.trunc(lasting) > 0) {
			ret = Math.trunc(lasting) + $_('unit.days');
		} else {
			ret = '';
		}
		if (lasting % 1 > 0) {
			//取小数部分，折算为小时，然后，保留到小数点后一位
			ret += Math.round(((lasting % 1) * 24 + Number.EPSILON) * 10) / 10 + $_('unit.hours');
		}
		return ret;
	};

	$: wfs &&
		(() => {
			people.splice(0);
			for (let i = 0; i < wfs.length; i++) {
				let starterIndex = -1;
				for (let p = 0; p < people.length; p++) {
					if (people[p].doer === wfs[i].starter) {
						starterIndex = p;
						break;
					}
				}
				if (starterIndex > -1) {
					people[starterIndex].processes.push(wfs[i]);
					console.log(`Push WF to ${starterIndex}`);
				} else {
					people.push({
						doer: wfs[i].starter,
						doerCN: wfs[i].starterCN,
						todos: [],
						totalLasting: 0,
						averageLasting: 0,
						longestLasting: 0,
						processes: [wfs[i]],
					});
				}
				wfs[i].above_threshold = false;
				wfs[i].selfIsTooLong = false;
				wfs[i].hasAboveThresholdTasks = false;
				if (['ST_DONE', 'ST_STOP'].includes(wfs[i].status)) {
					//如果工作流结束或者停止，其持续时长通过createdAt和updatedAt相比较获得
					wfs[i].lasting = datediff(wfs[i].updatedAt, wfs[i].createdAt);
				} else {
					//否则，其持续时长通过createdAt和now相比较获得
					wfs[i].lasting = datediff(new Date(), wfs[i].createdAt);
				}
				//计算最长lasting
				if (wfs[i].lasting > max.lasting) max.lasting = wfs[i].lasting;
				if (wfs[i].lasting >= $miningConfig.process_threshold_days) wfs[i].selfIsTooLong = true;

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
					if ($miningConfig.barTypes.works) {
						// 计算最大个数，works和todos放在一起统计
						if (max.works_number > max.all_number) max.all_number = max.works_number;
					}
				}
				if (wfs[i].mdata.todos && wfs[i].mdata.todos.length > max.todos_number) {
					// 计算最大todos个数，
					max.todos_number = wfs[i].mdata.todos.length;
					if ($miningConfig.barTypes.todos) {
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
							wfs[i].mdata.todos[t].lastingFullText = getLastingFullText(todoLasting);
						} else {
							wfs[i].mdata.todos[t].pureLasting = -1;
							wfs[i].mdata.todos[t].lasting = -1;
							wfs[i].mdata.todos[t].lastingFullText = 'Ignored';
						}
						//console.log(wfs[i].mdata.todos[t].status, wfs[i].mdata.todos[t].lastingFullText);

						const doer = wfs[i].mdata.todos[t].doer;

						let doerIndex = -1;
						for (let p = 0; p < people.length; p++) {
							if (people[p].doer === doer) {
								doerIndex = p;
								break;
							}
						}
						if (doerIndex > -1) {
							people[doerIndex].todos.push(wfs[i].mdata.todos[t]);
							if (todoLasting > people[doerIndex].longestLasting) {
								people[doerIndex].totalLasting += todoLasting;
								people[doerIndex].averageLasting =
									people[doerIndex].totalLasting / people[doerIndex].todos.length;
								people[doerIndex].longestLasting = todoLasting;
								people[doerIndex].longestLastingTodo = wfs[i].mdata.todos[t];
							}
						} else {
							people.push({
								doer: doer,
								doerCN: wfs[i].mdata.todos[t].doerCN,
								todos: [wfs[i].mdata.todos[t]],
								totalLasting: todoLasting,
								averageLasting: todoLasting,
								longestLasting: todoLasting,
								longestLastingTodo: wfs[i].mdata.todos[t],
								processes: [],
							});
						}
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
							wfs[i].mdata.works[t].lastingText = getLastingDaysText(workLasting);
						} else {
							wfs[i].mdata.works[t].pureLasting = -1;
							wfs[i].mdata.works[t].lasting = -1;
							wfs[i].mdata.works[t].lastingText = 'Ignored';
						}
						//console.log(wfs[i].mdata.works[t].status, wfs[i].mdata.works[t].lastingText);
						if (wfs[i].mdata.works[t].pureLasting >= redlight_threshold) {
							wfs[i].hasAboveThresholdTasks = true;
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

				wfs[i].aboveThreshold =
					($miningConfig.withWhat.process && wfs[i].selfIsTooLong) ||
					($miningConfig.withWhat.todos && wfs[i].hasAboveThresholdTasks);
			}
			if ($miningConfig.showOnlyAboveThreshold === true) {
				filteredWfs = wfs.filter((x) => x.aboveThreshold === true);
				//console.log('Got ', filteredWfs.length);
			} else {
				filteredWfs = wfs;
			}
		})();
</script>

<Nav tabs>
	<NavItem>
		<NavLink
			href={'#'}
			active={$miningConfig.dimension === 'time'}
			on:click={(e) => {
				e.preventDefault();
				e.stopPropagation();
				$miningConfig.dimension = 'time';
			}}>
			{$_('mining.nav.time')}
		</NavLink>
	</NavItem>
	<NavItem>
		<NavLink
			href={'#'}
			active={$miningConfig.dimension === 'people'}
			on:click={(e) => {
				e.preventDefault();
				e.stopPropagation();
				$miningConfig.dimension = 'people';
			}}>
			{$_('mining.nav.people')}
		</NavLink>
	</NavItem>
</Nav>
{#if $miningConfig.dimension === 'time'}
	<Miner_time bind:wfs bind:filteredWfs bind:max bind:redlight_threshold />
{:else if ($miningConfig.dimension = 'people')}
	<Miner_people bind:people />
{/if}
