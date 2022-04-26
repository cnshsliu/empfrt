<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import Parser from '$lib/parser';
	import ColDefCompiler from '$lib/coldefcompiler';
	import { Row, Col, Icon, FormGroup, FormText } from 'sveltestrap';
	import { session } from '$app/stores';
	let theConfirm;
	let uploadingFile: boolean;
	let uploadedFiles = [];

	export let kvar;
	console.log(kvar);
	let compileResult = ColDefCompiler.compileColDef(kvar.coldef);
	let colDefs = compileResult.colDefs;
	let rows = [];
	let avgrow = [];
	let sumrow = [];
	try {
		if (typeof kvar.value === 'string') {
			kvar.value = JSON.parse(Parser.base64ToCode(kvar.value));
		}
	} catch (err) {}
	if (kvar.value && kvar.value.rows) {
		rows = kvar.value.rows;
		avgrow = kvar.value.avgrow;
		sumrow = kvar.value.sumrow;
	}
</script>

{#each rows as row, rowIndex}
	<Row class={'border-bottom ' + (rowIndex ? '' : 'border-top')}>
		<Col xs="auto">
			{rowIndex + 1}
		</Col>
		<Col>
			<Row>
				{#each colDefs as colDef, colIndex}
					<Col>
						<FormGroup>
							<FormText color="muted">
								{colDef.label}
							</FormText>
							<div>{row[colIndex] ? row[colIndex] : ' '}</div>
						</FormGroup>
					</Col>
				{/each}
			</Row>
		</Col>
	</Row>
{/each}
{#if compileResult.hasAvgRow && rows.length > 0 && avgrow.length > 0}
	<Row class="border-bottom">
		<Col xs="auto">AVG</Col>
		<Col>
			<Row>
				{#each colDefs as colDef, colIndex}
					{#if colDef.avg && avgrow[colIndex] && avgrow[colIndex] > -1}
						<Col>
							<FormText color="muted">
								{colDef.label}
							</FormText>
							{avgrow[colIndex]}
						</Col>
					{/if}
				{/each}
			</Row>
		</Col>
	</Row>
{/if}
{#if compileResult.hasSumRow && rows.length > 0 && sumrow.length > 0}
	<Row class="border-bottom">
		<Col xs="auto">SUM</Col>
		<Col>
			<Row>
				{#each colDefs as colDef, colIndex}
					{#if colDef.sum && sumrow[colIndex] && sumrow[colIndex] > -1}
						<Col>
							<FormText color="muted">
								{colDef.label}
							</FormText>
							{sumrow[colIndex]}
						</Col>
					{/if}
				{/each}
			</Row>
		</Col>
	</Row>
{/if}
