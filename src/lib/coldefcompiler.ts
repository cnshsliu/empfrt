import Parser from '$lib/parser';
const internals: any = {};

internals.compileColDef = function (theColDefString: string) {
	let hasAvgRow = false;
	let hasSumRow = false;
	let colDefs = [];
	let colDefArr = theColDefString.split('|');
	interface ColDef {
		name: string;
		label: string;
		type: string;
		value?: string | boolean | number;
		options?: (string | boolean | number)[];
		defaultValue?: string | boolean | number;
		avg: boolean;
		sum: boolean;
		origin: string;
	}
	//default row for input
	let row = [];
	let m = null;
	for (let i = 0; i < colDefArr.length; i++) {
		let tmp: ColDef = { name: '', label: '', type: '', avg: false, sum: false, origin: '' };
		let colDefString = colDefArr[i];
		let colTitle = null;
		let colDefaultValue = null;

		tmp.origin = colDefString;

		//like [default=abcd], with get 'abcd' as defaultValue;
		m = colDefString.match(/\[default=([^\]]+)\]/);
		if (m) {
			colDefaultValue = m[1];
		}
		//like [title=abcd], will get 'abcd' as title;
		m = colDefString.match(/\[title=([^\]]+)\]/);
		if (m) {
			colTitle = m[1];
		}
		m = colDefString.match(/\[avg\]/i);
		if (m) {
			tmp.avg = true;
			hasAvgRow = true;
		}
		m = colDefString.match(/\[sum\]/i);
		if (m) {
			tmp.sum = true;
			hasSumRow = true;
		}
		colDefString = colDefString.replace(/\[[^\]]*\]/g, '');
		if (colDefString.startsWith('=')) {
			//console.log('this is a formula', colDefString);
			colDefs.push({
				name: 'FMLA' + i,
				label: colTitle ? colTitle : 'FMLA',
				type: 'formula',
				formula: colDefString,
				defaultValue: colDefaultValue,
				sum: tmp.sum,
				avg: tmp.avg,
				origin: tmp.origin
			});
			row.push(colDefaultValue ? colDefaultValue : '');
		} else {
			let matchResult = colDefString.match(
				'(email|password|url|range|number|dt|datetime|date|time|color|search|select|sl|sel|textarea|ta|file|radio|checkbox|cb|ou|usr|user|tbl)_'
			);
			tmp.type = 'text';
			if (matchResult) {
				tmp.type = matchResult[1];
			}
			if (tmp.type === 'cb') tmp.type = 'checkbox';
			if (tmp.type === 'ta') tmp.type = 'textarea';
			if (tmp.type === 'sl' || tmp.type === 'sel' || tmp.type === 'ou') tmp.type = 'select';
			if (tmp.type === 'usr' || tmp.type === 'user') tmp.type = 'user';
			if (tmp.type === 'dt') tmp.type = 'datetime';
			if (tmp.type === 'checkbox') {
				if (typeof tmp.value !== 'boolean') {
					if (typeof tmp.value === 'string') {
						tmp.value = tmp.value.toLowerCase() === 'true' ? true : false;
					} else {
						tmp.value = Boolean(tmp.value);
					}
				}
			}

			let re = new RegExp(/(.+)\((.+)\)/);
			m = colDefString.match(re);
			let colDefStringWithoutOptions = null;
			if (m) {
				colDefStringWithoutOptions = m[1];
				tmp.options = Parser.splitStringToArray(m[2], ':');
				//console.log(tmp.options);
			} else {
				colDefStringWithoutOptions = colDefString;
			}
			tmp.name = colDefStringWithoutOptions;
			if (colTitle) tmp.label = colTitle;
			else {
				let ucPos = colDefStringWithoutOptions.indexOf('_');
				if (ucPos > 0) {
					tmp.label = colDefStringWithoutOptions.substring(ucPos + 1);
				} else {
					tmp.label = colDefStringWithoutOptions;
				}
			}

			if (colDefaultValue === null) {
				tmp.defaultValue =
					tmp.type === 'checkbox' ? false : tmp.type === 'number' || tmp.type === 'range' ? 0 : '';
			} else {
				if (tmp.type === 'checkbox') {
					if (colDefaultValue === 'true') {
						tmp.defaultValue = true;
					} else {
						tmp.defaultValue = false;
					}
				} else if (tmp.type === 'number' || tmp.type === 'range') {
					tmp.defaultValue = parseInt(colDefaultValue);
				} else {
					tmp.defaultValue = colDefaultValue;
				}
			}
			colDefs.push(tmp);
			row.push(tmp.defaultValue);
		}
	}
	return { row, colDefs, hasSumRow, hasAvgRow };
};

internals.caculateRow = async function (colDefs: any, row: any, rowIndex: number) {
	const replaceColValue = function (formula: string) {
		for (let i = 0; i < colDefs.length; i++) {
			var re = new RegExp(`${colDefs[i].name}`, 'g');
			if (colDefs[i].type === 'number' || colDefs[i].type === 'range')
				formula = formula.replace(re, row[i]);
			else formula = formula.replace(re, `"${row[i]}"`);
		}
		return formula;
	};

	const createWorker = (funcContent: string) => {
		var blob = new Blob([funcContent]);
		var url = window.URL.createObjectURL(blob);
		var worker = new Worker(url);
		return worker;
	};
	const workerFunctionContent = function (expr: string) {
		return `(function(e){
		const datediff = function (s1, s2) {
			let d1 = Date.parse(s1);
			let d2 = Date.parse(s2);
			let diffInMs = Math.abs(d2 - d1);
			return diffInMs / (1000 * 60 * 60 * 24);
		};

		const lastingdays = function (s1, s2, roundTo) {
			let d1 = Date.parse(s1);
			let d2 = Date.parse(s2);
			let diffInMs = Math.abs(d2 - d1);
			let days = diffInMs / (1000 * 60 * 60 * 24);
			let ceil = Math.ceil(days);
			let floor = Math.floor(days);
			if (roundTo === 0) {
				days = floor;
			} else if (roundTo === 0.5) {
				if (days === floor) {
					days = floor;
				} else if (days <= floor + 0.5) {
					days = floor + 0.5;
				} else if (days <= ceil) {
					days = ceil;
				}
			} else {
				days = ceil;
			}
			return days;
		};
		let rowIndex = ${rowIndex};
		let res = ${expr};
		self.postMessage(res);
		self.close();
})()`;
	};

	const evalFormula = function (expr: string): Promise<any> {
		return new Promise(function (resolve, reject) {
			let pollingWorker = createWorker(workerFunctionContent(expr));

			pollingWorker.onmessage = function (e) {
				let result = e.data;
				if (typeof result === 'number' && isNaN(result)) result = 0;
				resolve(result);
			};
			pollingWorker.onerror = function (e) {
				reject(e.message);
			};
		});
	};

	for (let i = 0; i < colDefs.length; i++) {
		if (colDefs[i].type === 'formula') {
			let expr = replaceColValue(colDefs[i].formula);
			if (expr.startsWith('=')) expr = expr.substring(1);
			//let result = await api.post('formula/eval', { expr: expr }, user.sessionToken);
			let result = await evalFormula(expr);
			row[i] = result;
		}
	}
	return row;
};

export default internals;
