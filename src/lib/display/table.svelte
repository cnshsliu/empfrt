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
	kvar.value = JSON.parse(Parser.base64ToCode(kvar.value));
	console.log(kvar);
	let rows = kvar.value.rows;
	let avgrow = kvar.value.avgrow;
	let sumrow = kvar.value.sumrow;
	let compileResult = ColDefCompiler.compileColDef(kvar);
	let colDefs = compileResult.colDefs;
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
{#if compileResult.hasAvgRow}
	<Row class="border-bottom">
		<Col xs="auto">AVG</Col>
		<Col>
			<Row>
				{#each colDefs as colDef, colIndex}
					{#if avgrow[colIndex] && avgrow[colIndex] > -1}
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
{#if compileResult.hasSumRow}
	<Row class="border-bottom">
		<Col xs="auto">SUM</Col>
		<Col>
			<Row>
				{#each colDefs as colDef, colIndex}
					{#if sumrow[colIndex] && sumrow[colIndex] > -1}
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
