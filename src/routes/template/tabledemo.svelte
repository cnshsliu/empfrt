<script lang="ts">
	import { Button, Row, Col, Input, FormGroup, FormText } from 'sveltestrap';
	import { TagStorage } from '$lib/empstores';
	import { onMount } from 'svelte';
	import { session } from '$app/stores';
	import ColDefCompiler from '$lib/coldefcompiler';
	import * as api from '$lib/api';
	import TableDesigner from '$lib/TableDesigner.svelte';
	let tableDefString =
		'date_开始时间[title=开始日期]|date_结束时间|从哪里[default=机场]|到哪里[default=公司]|sel_出行方式(飞机:高铁:长途汽车:出租车)[default=高铁]|=datediff(date_开始时间,date_结束时间)+1[title=出差天数(天)][default=0][avg]|dt_开始时点|dt_结束时点|=lastingdays(dt_开始时点,dt_结束时点,0.5)[title=请假天数][default=0][sum]|number_报销金额[sum][avg]';
</script>

<Input bind:value={tableDefString} />

<TableDesigner bind:tableDefString />
