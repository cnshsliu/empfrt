<script type="ts">
	import { _ } from '$lib/i18n';
	import { Icon } from 'sveltestrap';
	import { onMount } from 'svelte';
	export let cronexpr: string;
	console.log(cronexpr);
	let months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
	let weekdays = [0, 1, 2, 3, 4, 5, 6, 7];
	let dates = [];
	for (let i = 0; i <= 31; i++) dates.push(i);
	let hours = [];
	for (let i = -1; i <= 23; i++) hours.push(i);
	let passedInExpr = cronexpr;
	let mode = { month: 1, date: 1, weekday: 1, hour: 1 };
	let builder = {
		minute: 0,
		hour: -1,
		hour_start: 0,
		hour_end: 23,
		hour_others: '',
		hour_every: 0,
		date: 0,
		date_start: 1,
		date_end: 31,
		date_others: '',
		date_every: 0,
		month: 0,
		month_start: 1,
		month_end: 12,
		month_others: '',
		month_every: 0,
		weekday: 0,
		weekday_start: 1,
		weekday_end: 7,
		weekday_others: '',
		weekday_every: 0,
	};

	const buildDescription = (builder) => {
		let hour = '';
		let date = '';
		let month = '';
		let weekday = '';
		if (mode.month === 1) {
			let theMonth = $_(`cron.month.${builder.month}`);
			if (builder.month > 0) {
				if (builder.month_every > 0) {
					month = `从${theMonth}开始每${builder.month_every}个月`;
				} else {
					month = `在${theMonth}`;
				}
			} else {
				if (builder.month_every > 0) {
					month = `每${builder.month_every}个月`;
				} else {
					month = '';
				}
			}
		} else {
			if (builder.month_start > 0 && builder.month_end > 0) {
				month =
					$_(`cron.month.${builder.month_start}`) + '到' + $_(`cron.month.${builder.month_end}`);
				if (builder.month_others.trim()) {
					let othersArr = filterOthers(builder.month_others, 1, 12, (x) => $_(`cron.month.${x}`));
					month += (othersArr.length > 0 ? '以及' : '') + othersArr.join(',');
				}
			}
		}

		if (mode.date === 1) {
			if (builder.date > 0) {
				if (builder.date_every > 0) {
					date = `从${builder.date}号开始每${builder.date_every}天`;
				} else {
					date = `${builder.date}号`;
				}
			} else {
				if (builder.date_every > 0) {
					date = `每${builder.date_every}天`;
				} else {
					date = ``;
				}
			}
		} else {
			if (builder.date_start > 0 && builder.date_end > 0) {
				date = builder.date_start + '号到' + builder.date_end + '号';
				if (builder.date_others.trim()) {
					let othersArr = filterOthers(builder.date_others, 1, 31, (x) => x + '号');
					date += (othersArr.length > 0 ? '以及' : '') + othersArr.join(',');
				}
			}
		}

		if (mode.weekday === 1) {
			let theWeekday = $_(`cron.weekday.${builder.weekday}`);
			if (builder.weekday > 0) {
				if (builder.weekday_every > 0) {
					weekday = `从${theWeekday}开始每${builder.weekday_every}天`;
				} else {
					weekday = `每${theWeekday}`;
				}
			}
		} else {
			if (builder.weekday_start > 0 && builder.weekday_end > 0) {
				weekday =
					$_(`cron.weekday.${builder.weekday_start}`) +
					'到' +
					$_(`cron.weekday.${builder.weekday_end}`);
				if (builder.weekday_others.trim()) {
					let othersArr = filterOthers(builder.weekday_others, 1, 7, (x) =>
						$_(`cron.weekday.${x}`),
					);
					weekday += (othersArr.length > 0 ? '以及' : '') + othersArr.join(',');
				}
			}
		}

		if (mode.hour === 1) {
			if (builder.hour >= 0) {
				if (builder.hour_every > 0) {
					hour = `从${builder.hour}点开始每${builder.hour_every}小时`;
				} else {
					hour = `${builder.hour}点`;
				}
			} else {
				if (builder.hour_every > 0) {
					hour = `每${builder.hour_every}小时`;
				} else {
					hour = `每个小时整点`;
				}
			}
		} else {
			if (builder.hour_start > 0 && builder.hour_end > 0) {
				hour = builder.hour_start + '点到' + builder.hour_end + '点';
				if (builder.hour_others.trim()) {
					let othersArr = filterOthers(builder.hour_others, 1, 23, (x) => x + '点');
					hour += (othersArr.length > 0 ? '以及' : '') + othersArr.join(',');
				}
			}
		}
		month = month ? `(${month})` : '';
		date = date ? `(${date})` : '';
		weekday = weekday ? `(${weekday})` : '';
		hour = hour ? `(${hour})` : '';
		return `${month} ${date} ${weekday} ${hour}`;
	};
	const filterOthers = (str: string, start: number, end: number, textify) => {
		return str
			.split(/[;, ]/)
			.map((x) => parseInt(x.trim()))
			.filter((x) => x >= start && x <= end)
			.map((x) => textify(x));
	};

	const buildExpr = (builder) => {
		let minute = '0';
		let hour = '*';
		if (mode.hour === 1) {
			hour = `${builder.hour >= 0 ? builder.hour : '*'}${
				builder.hour_every > 0 ? '/' + builder.hour_every : ''
			}`;
		} else {
			if (builder.hour_start > 0 && builder.hour_end > 0) {
				hour = builder.hour_start + '-' + builder.hour_end;
				if (builder.hour_others.trim()) {
					hour +=
						',' +
						builder.hour_others
							.split(/[;, ]/)
							.map((x) => parseInt(x.trim()))
							.filter((x) => x >= 0 && x <= 23)
							.join(',');
				}
			}
		}

		let date = '*';
		if (mode.date === 1) {
			date = `${builder.date >= 1 ? builder.date : '*'}${
				builder.date_every > 0 ? '/' + builder.date_every : ''
			}`;
		} else {
			if (builder.date_start > 0 && builder.date_end > 0) {
				date = builder.date_start + '-' + builder.date_end;
				if (builder.date_others.trim()) {
					date +=
						',' +
						builder.date_others
							.split(/[;, ]/)
							.map((x) => parseInt(x.trim()))
							.filter((x) => x >= 1 && x <= 31)
							.join(',');
				}
			}
		}

		let month = '*';
		if (mode.month === 1) {
			month = `${builder.month >= 1 ? builder.month : '*'}${
				builder.month_every > 0 ? '/' + builder.month_every : ''
			}`;
		} else {
			if (builder.month_start > 0 && builder.month_end > 0) {
				month = builder.month_start + '-' + builder.month_end;
				if (builder.month_others.trim()) {
					month +=
						',' +
						builder.month_others
							.split(/[;, ]/)
							.map((x) => parseInt(x.trim()))
							.filter((x) => x >= 1 && x <= 12)
							.join(',');
				}
			}
		}

		let weekday = '*';
		if (mode.weekday === 1) {
			weekday = `${builder.weekday >= 1 ? builder.weekday : '*'}${
				builder.weekday_every > 0 ? '/' + builder.weekday_every : ''
			}`;
		} else {
			if (builder.weekday_start > 0 && builder.weekday_end > 0) {
				weekday = builder.weekday_start + '-' + builder.weekday_end;
				if (builder.weekday_others.trim()) {
					weekday +=
						',' +
						builder.weekday_others
							.split(/[;, ]/)
							.map((x) => parseInt(x.trim()))
							.filter((x) => x >= 1 && x <= 7)
							.join(',');
				}
			}
		}

		const expr = `${minute} ${hour} ${date} ${month} ${weekday}`;
		console.log('Build Expr to ', expr);
		return expr;
	};

	$: cronexpr = mode && buildExpr(builder);
	$: crondescription = mode && buildDescription(builder);

	const rebuildFromExpr = (expr: string) => {
		//expr = '0 10-23,4,5 10-15,3,31 1-3,7,8,9 1-3,6,7';
		//expr = '0 3 * * 1-3,7';
		if (expr === '') expr = '0 8 * * 1';
		let tmp = expr.split(/ /);
		let tb = {
			minute: 0,
			hour: -1,
			hour_start: 0,
			hour_end: 23,
			hour_others: '',
			hour_every: 0,
			date: 0,
			date_start: 1,
			date_end: 31,
			date_others: '',
			date_every: 0,
			month: 0,
			month_start: 1,
			month_end: 12,
			month_others: '',
			month_every: 0,
			weekday: 0,
			weekday_start: 1,
			weekday_end: 7,
			weekday_others: '',
			weekday_every: 0,
		};
		if (tmp[1] === '*') tb.hour = -1;
		else {
			let m = tmp[1].match(/(\d+)-(\d+)((,\d+)*)/);
			if (m) {
				tb.hour_start = parseInt(m[1]);
				tb.hour_end = parseInt(m[2]);
				tb.hour_others = m[3];
				if (tb.hour_others.length > 0 && tb.hour_others[0] === ',')
					tb.hour_others = tb.hour_others.substring(1);
				mode.hour = 2;
			} else {
				m = tmp[1].match(/(\d+)(\/(\d+))*/);
				if (m) {
					if (m[2]) {
						tb.hour = parseInt(m[1]);
						tb.hour_every = parseInt(m[3]);
					} else {
						tb.hour = parseInt(m[1]);
						tb.hour_every = 0;
					}
				}
				mode.hour = 1;
			}
		}
		if (tmp[2] === '*') tb.date = 0;
		else {
			let m = tmp[2].match(/(\d+)-(\d+)((,\d+)*)/);
			if (m) {
				tb.date_start = parseInt(m[1]);
				tb.date_end = parseInt(m[2]);
				tb.date_others = m[3];
				if (tb.date_others.length > 0 && tb.date_others[0] === ',')
					tb.date_others = tb.date_others.substring(1);
				mode.date = 2;
			} else {
				m = tmp[2].match(/(\d+)(\/(\d+))*/);
				if (m) {
					if (m[2]) {
						tb.date = parseInt(m[1]);
						tb.date_every = parseInt(m[3]);
					} else {
						tb.date = parseInt(m[1]);
						tb.date_every = 0;
					}
				}
				mode.date = 1;
			}
		}
		if (tmp[3] === '*') tb.month = 0;
		else {
			let m = tmp[3].match(/(\d+)-(\d+)((,\d+)*)/);
			if (m) {
				tb.month_start = parseInt(m[1]);
				tb.month_end = parseInt(m[2]);
				tb.month_others = m[3];
				if (tb.month_others.length > 0 && tb.month_others[0] === ',')
					tb.month_others = tb.month_others.substring(1);
				mode.month = 2;
			} else {
				m = tmp[3].match(/(\d+)(\/(\d+))*/);
				if (m) {
					if (m[2]) {
						tb.month = parseInt(m[1]);
						tb.month_every = parseInt(m[3]);
					} else {
						tb.month = parseInt(m[1]);
						tb.month_every = 0;
					}
				}
				mode.month = 1;
			}
		}

		if (tmp[4] === '*') tb.weekday = 0;
		else {
			let m = tmp[4].match(/(\d+)-(\d+)((,\d+)*)/);
			if (m) {
				tb.weekday_start = parseInt(m[1]);
				tb.weekday_end = parseInt(m[2]);
				tb.weekday_others = m[3];
				if (tb.weekday_others.length > 0 && tb.weekday_others[0] === ',')
					tb.weekday_others = tb.weekday_others.substring(1);
				mode.weekday = 2;
			} else {
				m = tmp[4].match(/(\d+)(\/(\d+))*/);
				if (m) {
					if (m[2]) {
						tb.weekday = parseInt(m[1]);
						tb.weekday_every = parseInt(m[3]);
					} else {
						tb.weekday = parseInt(m[1]);
						tb.weekday_every = 0;
					}
				}
				mode.weekday = 1;
			}
		}
		builder = tb;
	};

	onMount(async () => {
		console.log('onMount...', passedInExpr);
		rebuildFromExpr(passedInExpr);
	});
</script>

<div>Crontab编辑器</div>
<div class="row">
	<div class="col-2">{$_('cron.title.expr')}</div>
	<div class="col-auto fs-6 fw-bold">{cronexpr}</div>
</div>
<div class="row">
	<div class="col-2">{$_('cron.title.result')}</div>
	<div class="col-auto fs-6 fw-bold">{crondescription}</div>
</div>
<div class="row">
	<div class="col-2">{$_('cron.title.month')}</div>
	<div class="col-2">
		<label>
			<input type="radio" bind:group={mode.month} name="mode_month" value={1} />
			{$_('cron.title.single')}
		</label>
		<label>
			<input type="radio" bind:group={mode.month} name="mode_month" value={2} />
			{$_('cron.title.range')}
		</label>
	</div>
	<div class="col ms-3">
		{#if mode.month === 1}
			<select bind:value={builder.month}>
				{#each months as month, monthindex}
					<option value={month}>{$_(`cron.month.${month}`)}</option>
				{/each}
			</select>
			{$_('cron.title.every')}:
			<input type="number" min="0" bind:value={builder.month_every} />
		{:else}
			{$_('cron.title.from')}
			<select bind:value={builder.month_start}>
				{#each months as month, monthindex}
					<option value={month}>{$_(`cron.month.${month}`)}</option>
				{/each}
			</select>
			{$_('cron.title.to')}
			<select bind:value={builder.month_end}>
				{#each months as month, monthindex}
					<option value={month}>{$_(`cron.month.${month}`)}</option>
				{/each}
			</select>
			{$_('cron.title.and')}
			<input bind:value={builder.month_others} />
		{/if}
	</div>
</div>

<div class="row">
	<div class="col-2">{$_('cron.title.date')}</div>
	<div class="col-2">
		<label>
			<input type="radio" bind:group={mode.date} name="mode_date" value={1} />
			{$_('cron.title.single')}
		</label>
		<label>
			<input type="radio" bind:group={mode.date} name="mode_date" value={2} />
			{$_('cron.title.range')}
		</label>
	</div>
	<div class="col ms-3">
		{#if mode.date === 1}
			<select bind:value={builder.date}>
				{#each dates as date}
					<option value={date}>
						{date > 0 ? date : $_('cron.title.notset')}
					</option>
				{/each}
			</select>
			{$_('cron.title.every')}:
			<input type="number" min="0" bind:value={builder.date_every} />
		{:else}
			{$_('cron.title.from')}
			<select bind:value={builder.date_start}>
				{#each dates as date, dateindex}
					<option value={date}>
						{date > 0 ? date : $_('cron.title.notset')}
					</option>
				{/each}
			</select>
			{$_('cron.title.to')}
			<select bind:value={builder.date_end}>
				{#each dates as date, dateindex}
					<option value={date}>
						{date > 0 ? date : $_('cron.title.notset')}
					</option>
				{/each}
			</select>
			{$_('cron.title.and')}
			<input bind:value={builder.date_others} />
		{/if}
	</div>
</div>

<div class="row">
	<div class="col-2">{$_('cron.title.weekday')}</div>
	<div class="col-2">
		<label>
			<input type="radio" bind:group={mode.weekday} name="mode_weekday" value={1} />
			{$_('cron.title.single')}
		</label>
		<label>
			<input type="radio" bind:group={mode.weekday} name="mode_weekday" value={2} />
			{$_('cron.title.range')}
		</label>
	</div>
	<div class="col ms-3">
		{#if mode.weekday === 1}
			<select bind:value={builder.weekday}>
				{#each weekdays as weekday}
					<option value={weekday}>{$_(`cron.weekday.${weekday}`)}</option>
				{/each}
			</select>
			{$_('cron.title.every')}:
			<input type="number" min="0" bind:value={builder.weekday_every} />
		{:else}
			{$_('cron.title.from')}
			<select bind:value={builder.weekday_start}>
				{#each weekdays as weekday, weekdayindex}
					<option value={weekday}>{$_(`cron.weekday.${weekday}`)}</option>
				{/each}
			</select>
			{$_('cron.title.to')}
			<select bind:value={builder.weekday_end}>
				{#each weekdays as weekday, weekdayindex}
					<option value={weekday}>{$_(`cron.weekday.${weekday}`)}</option>
				{/each}
			</select>
			{$_('cron.title.and')}
			<input bind:value={builder.weekday_others} />
		{/if}
	</div>
</div>

<div class="row">
	<div class="col-2">{$_('cron.title.hour')}</div>
	<div class="col-2">
		<label>
			<input type="radio" bind:group={mode.hour} name="mode_hour" value={1} />
			{$_('cron.title.single')}
		</label>
		<label>
			<input type="radio" bind:group={mode.hour} name="mode_hour" value={2} />
			{$_('cron.title.range')}
		</label>
	</div>
	<div class="col ms-3">
		{#if mode.hour === 1}
			<select bind:value={builder.hour}>
				{#each hours as hour}
					<option value={hour}>{hour > -1 ? hour + ':00' : $_('cron.title.notset')}</option>
				{/each}
			</select>
			{$_('cron.title.every')}:
			<input type="number" min="0" bind:value={builder.hour_every} />
		{:else}
			{$_('cron.title.from')}
			<select bind:value={builder.hour_start}>
				{#each hours as hour, hourindex}
					<option value={hour}>{hour > -1 ? hour + ':00' : $_('cron.title.notset')}</option>
				{/each}
			</select>
			{$_('cron.title.to')}
			<select bind:value={builder.hour_end}>
				{#each hours as hour, hourindex}
					<option value={hour}>{hour > -1 ? hour + ':00' : $_('cron.title.notset')}</option>
				{/each}
			</select>
			{$_('cron.title.and')}
			<input bind:value={builder.hour_others} />
		{/if}
	</div>
</div>
