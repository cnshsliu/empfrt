<script lang="ts">
	import { _ } from '$lib/i18n';
	import { createEventDispatcher } from 'svelte';
	import Parser from '$lib/parser';
	const dispatch = createEventDispatcher();
	import * as api from '$lib/api';
	import ColDefCompiler from '$lib/coldefcompiler';
	import { Table, Icon, Row, Col, FormGroup, FormText, Label, Button, Input } from 'sveltestrap';
	import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'sveltestrap';
	import { session } from '$app/stores';

	let user = $session.user;
	export let kvar: any;
	export let rehearsal: boolean = false;
	export let readonly: boolean = false;
	let compileResult = ColDefCompiler.compileColDef(kvar.coldef);
	let colDefs = compileResult.colDefs;
	let rows = [];
	let avgrow = [];
	let sumrow = [];
	let onInputTimer = null;
	if (readonly) {
		if (typeof kvar.value === 'string') {
			try {
				kvar.value = JSON.parse(Parser.base64ToCode(kvar.value));
			} catch (err) {
				console.log('base64 parser failed', kvar.value);
			}
		}
	}

	if (readonly) {
		rows = kvar.value.rows;
		avgrow = kvar.value.avgrow;
		sumrow = kvar.value.sumrow;
	} else {
		if (kvar.value && kvar.value.rows) {
			rows = kvar.value.rows;
			avgrow = kvar.value.avgrow;
			sumrow = kvar.value.sumrow;
		} else {
			rows.push(compileResult.row);
		}
	}

	const resetKVarValue = function () {
		let theTableValue = { rows: rows, avgrow: [], sumrow: [] };
		for (let c = 0; c < colDefs.length; c++) {
			if (colDefs[c].avg || colDefs[c].sum) {
				let tmpSum = 0;
				for (let i = 0; i < rows.length; i++) {
					tmpSum += rows[i][c];
				}
				colDefs[c].sum_value = tmpSum;
				colDefs[c].avg_value = tmpSum / rows.length;
				theTableValue.avgrow.push(tmpSum / rows.length);
				theTableValue.sumrow.push(tmpSum);
			} else {
				theTableValue.avgrow.push(-1);
				theTableValue.sumrow.push(-1);
			}
		}

		//kvar.value = Parser.codeToBase64(JSON.stringify(theTableValue));
		kvar.value = theTableValue;
	};
</script>

{#each rows as row, rowIndex}
	<Row class={'border-bottom ' + (rowIndex ? '' : 'border-top')}>
		<Col xs="auto">
			{#if readonly}
				{rowIndex + 1}
			{:else}
				<Dropdown group size="sm">
					<DropdownToggle caret>{rowIndex + 1}</DropdownToggle>
					<DropdownMenu>
						<DropdownItem
							on:click={() => {
								rows.splice(rowIndex, 0, JSON.parse(JSON.stringify(rows[rowIndex])));
								rows = rows;
								resetKVarValue();
							}}
						>
							{$_('inputtable.copyto.above')}
						</DropdownItem>
						<DropdownItem
							on:click={() => {
								rows.splice(rowIndex + 1, 0, JSON.parse(JSON.stringify(rows[rowIndex])));
								rows = rows;
								resetKVarValue();
							}}
						>
							{$_('inputtable.copyto.below')}
						</DropdownItem>
						<DropdownItem
							disabled={rows.length === 1}
							on:click={() => {
								rows.splice(rowIndex, 1);
								rows = rows;
								resetKVarValue();
							}}
						>
							{$_('inputtable.delete')}
						</DropdownItem>
						<DropdownItem
							disabled={rowIndex === 0}
							on:click={() => {
								if (rowIndex > 0) {
									rows.splice(rowIndex - 1, 0, rows.splice(rowIndex, 1)[0]);
									rows = rows;
									resetKVarValue();
								}
							}}
						>
							{$_('inputtable.move.up')}
						</DropdownItem>
						<DropdownItem
							disabled={rowIndex === rows.length - 1}
							on:click={() => {
								if (rowIndex < rows.length - 1) {
									rows.splice(rowIndex + 1, 0, rows.splice(rowIndex, 1)[0]);
									rows = rows;
									resetKVarValue();
								}
							}}
						>
							{$_('inputtable.move.down')}
						</DropdownItem>
						<DropdownItem
							disabled={rowIndex === 0}
							on:click={() => {
								if (rowIndex > 0) {
									rows.splice(0, 0, rows.splice(rowIndex, 1)[0]);
									rows = rows;
									resetKVarValue();
								}
							}}
						>
							{$_('inputtable.move.top')}
						</DropdownItem>
						<DropdownItem
							disabled={rowIndex === rows.length - 1}
							on:click={() => {
								if (rowIndex < rows.length - 1) {
									rows.push(rows.splice(rowIndex, 1)[0]);
									rows = rows;
									resetKVarValue();
								}
							}}
						>
							{$_('inputtable.move.bottom')}
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			{/if}
		</Col>
		<Col>
			<Row>
				{#each colDefs as colDef, colIndex}
					<Col>
						<FormGroup>
							<FormText color="muted">
								{colDef.label}
								{#if rehearsal}
									<br />{colIndex}
									{colDef.type}
								{/if}
							</FormText>
							{#if readonly}
								<div>{row[colIndex] ? row[colIndex] : ' '}</div>
							{:else if colDef.type === 'formula'}
								<div>{row[colIndex]}</div>
							{:else}
								<Input
									class="kfk-table-input-field"
									type={colDef.type !== 'datetime' ? colDef.type : 'datetime-local'}
									name={colDef.name + '_' + rowIndex + '_' + colIndex}
									bind:value={rows[rowIndex][colIndex]}
									on:input={async (e) => {
										e.preventDefault();
										if (onInputTimer) {
											clearTimeout(onInputTimer);
										}
										onInputTimer = setTimeout(async () => {
											row = await ColDefCompiler.caculateRow(colDefs, row, rowIndex);
											resetKVarValue();
											onInputTimer = null;
										}, 200);
									}}
								>
									{#if colDef.type === 'select'}
										{#each colDef.options as anOpt}
											<option value={anOpt}>{anOpt}</option>
										{/each}
									{/if}
								</Input>
							{/if}
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
					{#if colDef.avg}
						<Col>
							<FormText color="muted">
								{colDef.label}
							</FormText>
							{#if readonly}
								{avgrow[colIndex]}
							{:else}
								{colDef.avg_value ? colDef.avg_value : ''}
							{/if}
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
					{#if colDef.sum}
						<Col>
							<FormText color="muted">
								{colDef.label}
							</FormText>
							{#if readonly}
								{sumrow[colIndex]}
							{:else}
								{colDef.sum_value ? colDef.sum_value : ''}
							{/if}
						</Col>
					{/if}
				{/each}
			</Row>
		</Col>
	</Row>
{/if}
