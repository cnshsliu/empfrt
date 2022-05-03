<script lang="ts">
	import Parser from '$lib/parser';
	import { Icon, Button, Container, Row, Col, Input, FormGroup, FormText } from 'sveltestrap';
	import { onMount } from 'svelte';
	import ColDefCompiler from '$lib/coldefcompiler';
	export let tableDefString = '';

	let mouseoverColIndex = -1;
	let compileResult = ColDefCompiler.compileColDef(tableDefString);
	let colDefs = compileResult.colDefs;
	let inputForIndex = -1;
	onMount(async () => {
		console.log(colDefs);
	});
	//缺省输入值
	let defaultNewCol = {
		name: '',
		label: '',
		type: '',
		value: null,
		options: [],
		optionsString: '',
		defaultValue: null,
		avg: false,
		sum: false,
		isFormula: false,
		formula: '',
		isSelect: false,
		colString: ''
	};
	//从缺省输入值，赋值给输入框
	let newCol = defaultNewCol;
	//将多选字符穿拆解为options数字，并更新字符串
	const splitOptionStringToArray = function (e) {
		newCol.options = Parser.splitStringToArray(e.target.value);
		buildColumnStringFromInput();
	};
	//生成输入框colDef的字符串
	const buildColumnStringFromInput = function () {
		buildColumnStringFromColDef(newCol);
	};
	//生成一个输入类型colDef的字符串
	const buildColumnStringFromColDef = function (colDef) {
		let str = '';
		if (colDef.isFormula) {
			if (colDef.formula.startsWith('=') === false) {
				colDef.formula = '=' + colDef.formula;
			}
			str += colDef.formula;
		} else {
			if (colDef.isSelect) {
				if (colDef.name.startsWith('sel_') === false) {
					colDef.name = 'sel_' + colDef.name;
				}
			}
			str += colDef.name;
			if (colDef.isSelect) {
				str += `(${colDef.options.join(':')})`;
			}
		}
		if (colDef.label && colDef.label.trim()) {
			let titleInput = colDef.label.trim();
			if (titleInput !== colDef.name && colDef.name.endsWith('_' + titleInput) === false)
				str += `[title=${titleInput}]`;
		}
		if (colDef.defaultValue && colDef.defaultValue.trim()) {
			str += `[default=${colDef.defaultValue.trim()}]`;
		}
		if (colDef.avg) {
			str += '[avg]';
		}
		if (colDef.sum) {
			str += '[sum]';
		}
		colDef.colString = str;
		return str;
	};

	//将Parser的第colIndex的Coldef拷贝到输入框coldef
	const copyColDefToNewColInput = function (colIndex) {
		//获得临时输入coldef，复制给输入框newCol
		newCol = copyColDefToColInput(colIndex);
		//针对输入框coldef的内容，生成其字符串
		buildColumnStringFromInput();
	};

	//将Parser的第colIndex的Coldef拷贝到临时的输入类型的coldef，并返回这个临时输入coldef
	const copyColDefToColInput = function (colIndex) {
		inputForIndex = colIndex;
		let tmpCol = newCol;
		let colDef = colDefs[colIndex];
		if (colDef.formula) {
			tmpCol.isFormula = true;
			tmpCol.formula = colDef.formula;
			tmpCol.name = '';
		} else {
			tmpCol.isFormula = false;
			tmpCol.name = colDef.name;
		}
		if (colDef.type === 'select') {
			tmpCol.isSelect = true;
			tmpCol.options = colDef.options;
			tmpCol.optionsString = tmpCol.options.join(';');
		} else {
			tmpCol.isSelect = false;
			tmpCol.options = [];
			tmpCol.optionsString = '';
		}
		tmpCol.label = colDef.label;
		tmpCol.avg = colDef.avg;
		tmpCol.sum = colDef.sum;
		tmpCol.defaultValue = colDef.defaultValue;
		return tmpCol;
	};

	//从Parser解析的ColDef返回去生成其字符串
	const getColDefStringFromIndex = function (colIndex) {
		let tmpCol = copyColDefToColInput(colIndex);
		buildColumnStringFromColDef(tmpCol);
		return tmpCol.colString;
	};

	const resetColInput = function (e) {
		e.preventDefault();
		inputForIndex = -1;
		mouseoverColIndex = inputForIndex;
		newCol = defaultNewCol;
		newCol.isFormula = defaultNewCol.isFormula;
		/*
		name: '',
		label: '',
		type: '',
		value: null,
		options: [],
		optionsString: '',
		defaultValue: null,
		avg: false,
		sum: false,
		isFormula: false,
		formula: '',
		isSelect: false,
		colString: ''
			*/
	};

	const setToCurrent = function (e) {
		e.preventDefault();
		e.stopPropagation();
		if (inputForIndex >= 0) {
			buildColumnStringFromInput();
			colDefs[inputForIndex].origin = newCol.colString;
			tableDefString = colDefs.map((x) => x.origin).join('|');
			compileResult = ColDefCompiler.compileColDef(tableDefString);
			colDefs = compileResult.colDefs;
		}
	};
	const deleteCurrent = function (e) {
		e.preventDefault();
		e.stopPropagation();
		if (inputForIndex < 0 || colDefs.length <= 1) {
			return;
		}
		colDefs.splice(inputForIndex, 1);
		tableDefString = colDefs.map((x) => x.origin).join('|');
		compileResult = ColDefCompiler.compileColDef(tableDefString);
		colDefs = compileResult.colDefs;
		//mouseoverColIndex = inputForIndex;
		if (inputForIndex >= colDefs.length) {
			inputForIndex = colDefs.length - 1;
			mouseoverColIndex = inputForIndex;
		}
		copyColDefToNewColInput(inputForIndex);
	};

	const copyCurrent = function (e) {
		e.preventDefault();
		e.stopPropagation();
		if (inputForIndex >= 0) {
			colDefs.splice(inputForIndex, 0, colDefs[inputForIndex]);
			tableDefString = colDefs.map((x) => x.origin).join('|');
			compileResult = ColDefCompiler.compileColDef(tableDefString);
			colDefs = compileResult.colDefs;
		}
	};

	const addToBegin = function (e) {
		e.preventDefault();
		e.stopPropagation();
		buildColumnStringFromInput();
		tableDefString = newCol.colString + '|' + tableDefString;
		console.log(tableDefString);
		compileResult = ColDefCompiler.compileColDef(tableDefString);
		colDefs = compileResult.colDefs;
		mouseoverColIndex = 0;
		inputForIndex = 0;
	};
	const addToEnd = function (e) {
		e.preventDefault();
		e.stopPropagation();
		console.log(tableDefString);
		buildColumnStringFromInput();
		tableDefString = tableDefString + '|' + newCol.colString;
		compileResult = ColDefCompiler.compileColDef(tableDefString);
		colDefs = compileResult.colDefs;
		mouseoverColIndex = colDefs.length - 1;
		inputForIndex = mouseoverColIndex;
	};

	const moveToFirst = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (mouseoverColIndex <= 0) return;
		colDefs.splice(0, 0, colDefs.splice(mouseoverColIndex, 1)[0]);
		tableDefString = colDefs.map((x) => x.origin).join('|');
		compileResult = ColDefCompiler.compileColDef(tableDefString);
		colDefs = compileResult.colDefs;
		mouseoverColIndex = 0;
		inputForIndex = mouseoverColIndex;
	};
	const moveToLast = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (mouseoverColIndex >= colDefs.length - 1) return;
		colDefs.push(colDefs.splice(mouseoverColIndex, 1)[0]);
		tableDefString = colDefs.map((x) => x.origin).join('|');
		compileResult = ColDefCompiler.compileColDef(tableDefString);
		colDefs = compileResult.colDefs;
		mouseoverColIndex = colDefs.length - 1;
		inputForIndex = mouseoverColIndex;
	};
	const moveToPrev = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (mouseoverColIndex <= 0) return;
		colDefs.splice(mouseoverColIndex - 1, 0, colDefs.splice(mouseoverColIndex, 1)[0]);
		tableDefString = colDefs.map((x) => x.origin).join('|');
		compileResult = ColDefCompiler.compileColDef(tableDefString);
		colDefs = compileResult.colDefs;
		mouseoverColIndex--;
		inputForIndex = mouseoverColIndex;
	};
	const moveToNext = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (mouseoverColIndex >= colDefs.length - 1) return;
		colDefs.splice(mouseoverColIndex + 1, 0, colDefs.splice(mouseoverColIndex, 1)[0]);
		tableDefString = colDefs.map((x) => x.origin).join('|');
		compileResult = ColDefCompiler.compileColDef(tableDefString);
		colDefs = compileResult.colDefs;
		mouseoverColIndex++;
		inputForIndex = mouseoverColIndex;
	};
</script>

<div class="border border-1 rounded pb-1">
	<Row>
		{#each colDefs as colDef, colIndex}
			<div
				role="button"
				class={'col ' + (mouseoverColIndex === colIndex ? 'bg-light' : '')}
				on:click={(e) => {
					if (mouseoverColIndex === colIndex) {
						mouseoverColIndex = -1;
						resetColInput(e);
					} else {
						mouseoverColIndex = colIndex;
						copyColDefToNewColInput(colIndex);
					}
				}}
			>
				<Row>
					<FormGroup>
						<FormText color="muted">
							<span role="button">{colDef.label}</span>
						</FormText>
						<!-- div>{colDef.origin}</div -->
					</FormGroup>
				</Row>
				{#if mouseoverColIndex === colIndex}
					<Row cols="4">
						<Col>
							<Button class="m-0 p-0" on:click={moveToFirst}>
								<Icon name="chevron-double-left" />
							</Button>
						</Col><Col>
							<Button class="m-0 p-0" on:click={moveToPrev}>
								<Icon name="chevron-left" />
							</Button>
						</Col><Col>
							<Button class="m-0 p-0" on:click={moveToNext}>
								<Icon name="chevron-right" />
							</Button>
						</Col><Col>
							<Button class="m-0 p-0" on:click={moveToLast}>
								<Icon name="chevron-double-right" />
							</Button>
						</Col>
					</Row>
				{/if}
			</div>
		{/each}
	</Row>
	<form>
		<!--{newCol.colString} -->
		<Row cols={{ xs: 1, sm: 2, md: 4 }} class="px-3">
			<Col class="col-auto">
				<FormText>IsFormula</FormText>
				<div class="form-check">
					<input
						class="form-check-input"
						type="checkbox"
						bind:checked={newCol.isFormula}
						on:change={buildColumnStringFromInput}
					/>
					{#if newCol.isFormula}
						<Input bind:value={newCol.formula} on:change={buildColumnStringFromInput} />
					{/if}
				</div>
			</Col>
			{#if newCol.isFormula === false}
				<Col>
					<FormText>Name</FormText>
					<Input bind:value={newCol.name} on:change={buildColumnStringFromInput} />
				</Col>
			{/if}
			<Col>
				<FormText>Label</FormText>
				<Input bind:value={newCol.label} on:change={buildColumnStringFromInput} />
			</Col>
			<Col>
				<FormText>Default</FormText>
				<Input bind:value={newCol.defaultValue} on:change={buildColumnStringFromInput} />
			</Col>
			<div class="w-100" />
			<Col class="col-auto mt-3">
				<FormText>IsSelect</FormText>
				<div class="form-check">
					<input
						class="form-check-input"
						type="checkbox"
						bind:checked={newCol.isSelect}
						on:change={buildColumnStringFromInput}
					/>
					{#if newCol.isSelect}
						<FormText>Options</FormText>
						{#each newCol.options as option}
							<span class="badge rounded-pill bg-info text-dark">{option}</span>
						{/each}
						<Input bind:value={newCol.optionsString} on:input={splitOptionStringToArray} />
					{/if}
				</div>
			</Col>
			<Col class="col-auto mt-3">
				<FormText>Avg</FormText>
				<div class="form-check">
					<input
						class="form-check-input"
						type="checkbox"
						bind:checked={newCol.avg}
						on:change={buildColumnStringFromInput}
					/>
				</div>
			</Col>
			<Col class="col-auto mt-3">
				<FormText>Sum</FormText>
				<div class="form-check">
					<input
						class="form-check-input"
						type="checkbox"
						bind:checked={newCol.sum}
						on:change={buildColumnStringFromInput}
					/>
				</div>
			</Col>
		</Row>
		<Row class="ms-5 ps-5">
			<Col class="col-auto mt-3">
				<Button color="primary" disabled={inputForIndex < 0} on:click={setToCurrent}>Set</Button>
			</Col>
			<Col class="col-auto mt-3">
				<Button color="primary" disabled={inputForIndex < 0} on:click={copyCurrent}>Copy</Button>
			</Col>
			<Col class="col-auto mt-3">
				<Button color="primary" on:click={addToBegin}>First</Button>
			</Col>
			<Col class="col-auto mt-3">
				<Button color="primary" on:click={addToEnd}>Append</Button>
			</Col>
			<Col class="col-auto mt-3">
				<Button
					color="primary"
					disabled={inputForIndex < 0 || colDefs.length <= 1}
					on:click={deleteCurrent}>Delete</Button
				>
			</Col>
			<Col class="col-auto mt-3">
				<Button color="primary" on:click={resetColInput}>ReSet</Button>
			</Col>
		</Row>
	</form>
</div>
