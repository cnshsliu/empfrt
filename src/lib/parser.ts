import { Buffer } from 'buffer';
import * as api from '$lib/api';
interface KVars {
	name: string;
	def: unknown;
}
const createWorker = (funcContent: string): any => {
	var blob = new Blob([funcContent]);
	var url = window.URL.createObjectURL(blob);
	var worker = new Worker(url);
	return worker;
};
const workerFunctionContent = function (expr: any): string {
	return `(function(e){
		let res = ${expr};
		self.postMessage(res);
		self.close();
})()`;
};

const Parser = {
	isEmpty: function (str: string | number): boolean {
		if (str === undefined || str === null) return true;
		if (str === '') return true;
		return false;
	},
	hasValue: function (str: string | number): boolean {
		return !this.isEmpty(str);
	},
	kvarsToArrayForActionPropertyModal: function (
		kvars: KVars,
		workid: string,
	): Record<string, unknown>[] {
		const kvarsArr = [];
		for (const [name, valueDef] of Object.entries(kvars)) {
			//eslint-disable-next-line
			let tmp: Record<string, unknown> = {};
			if (typeof valueDef === 'string') tmp = { name: name, value: valueDef, type: 'plaintext' };
			else {
				tmp = { ...{ name: name }, ...valueDef };
				//END Speculate variable type
				if (workid && workid.length > 0) {
					for (const [varKey, varValue] of Object.entries(tmp)) {
						if (typeof varValue === 'string' && varValue.indexOf('[workid]') >= 0) {
							tmp[varKey] = varValue.replace('[workid]', workid);
						}
					}
				}
				/* if (tmp.type === 'select' && Array.isArray(tmp.options) === false) {
					tmp.options = ['DEFAULT'];
				} */
			}
			if (tmp.formula) tmp.value = '=' + tmp.formula;
			if ((tmp.name as unknown as string).startsWith('$') === false) {
				kvarsArr.push(tmp);
			}
		}
		return kvarsArr;
	},
	arrayToKvars: function (kvarsArray: KVars[]): KVars {
		const ret: KVars = <KVars>{};
		for (let i = 0; i < kvarsArray.length; i++) {
			ret[kvarsArray[i].name] = kvarsArray[i];
			delete ret[kvarsArray[i].name]['name'];
		}
		return ret;
	},
	splitStringToArray: function (str: string, deli: any = null) {
		if (typeof str !== 'string') str = '';
		else str = str.trim();
		if (str === '') return [];
		let tmp = str.split(deli ? deli : /[\s;,]/);
		tmp = tmp.map((x: string) => x.trim()).filter((x: string) => x.length > 0);
		return tmp;
	},
	chunkString: function (str: string, len: number) {
		const size = Math.ceil(str.length / len);
		const r = Array(size);
		let offset = 0;

		for (let i = 0; i < size; i++) {
			r[i] = str.substring(offset, offset + len);
			offset += len;
		}

		return r;
	},

	codeToBase64: function (code: string): string {
		return Buffer.from(code).toString('base64');
	},
	base64ToCode: function (base64: string, ifErrorValue = ''): string {
		try {
			return Buffer.from(base64, 'base64').toString('utf-8');
		} catch (error) {
			return ifErrorValue;
		}
	},
	addUserTag: function (str: string) {
		let m = str.match(/(@\S+)/g);
		if (!m) return str;
		for (let i = 0; i < m.length; i++) {
			str = str.replace(m[i], `<span class='usertag'>${m[i]}</span>`);
		}
		return str;
	},

	//eslint-disable-next-line
	collectRoles: function (nodes: any): string[] {
		const ret: string[] = [];
		nodes.each((_index: number, aNode: unknown) => {
			//eslint-disable-line
			const aRole = $(aNode).attr('role');
			if (aRole && ret.indexOf(aRole) === -1) {
				ret.push(aRole);
			}
		});
		if (ret.indexOf('DEFAULT') === -1) {
			ret.push('DEFAULT');
		}
		if (ret.indexOf('STARTER') === -1) {
			ret.unshift('STARTER');
		}
		return ret;
	},

	userDisplay: function (email: string, myEmail: string): string {
		let ret = email;
		let domain = email.substring(email.indexOf('@'));
		let myDomain = myEmail.substring(myEmail.indexOf('@'));
		if (domain === myDomain) {
			ret = ret.substring(0, ret.indexOf('@'));
		}
		return ret;
	},

	newlineToBreak: function (txt: string): string {
		return txt.replace(/\n/g, '<br/>');
	},

	toValidVarName: function (tmp: string): string {
		return tmp.trim().replace(/^[^a-zA-Z_$]|[^\w$]/g, '_');
	},

	evalFormula: function (kvarArr: any[], formula: string): Promise<any> {
		const replaceKvar = function (formula: string) {
			for (let i = 0; i < kvarArr.length; i++) {
				var re = new RegExp(`\\b${kvarArr[i].name}\\b`, 'g');
				if (kvarArr[i].type === 'number' || kvarArr[i].type === 'range')
					formula = formula.replace(re, kvarArr[i].value);
				else formula = formula.replace(re, '"' + kvarArr[i].value + '"');
			}
			return formula;
		};

		let expr = replaceKvar(formula);
		//let result = await api.post('formula/eval', { expr: expr }, user.sessionToken);

		return new Promise(function (resolve, reject) {
			let pollingWorker = createWorker(workerFunctionContent(expr));

			pollingWorker.onmessage = function (e: any) {
				let result = e.data;
				if (typeof result === 'number' && isNaN(result)) result = 0;
				resolve(result);
			};
			pollingWorker.onerror = function (e: any) {
				reject(e.data);
			};
		});
	},

	evalFormula_use_server_backend: async function (
		user: any,
		kvarArr: any[],
		formula: string,
	): Promise<any> {
		const replaceKvar = function (formula: string) {
			for (let i = 0; i < kvarArr.length; i++) {
				var re = new RegExp(`\\b${kvarArr[i].name}\\b`, 'g');
				if (kvarArr[i].type === 'number' || kvarArr[i].type === 'range')
					formula = formula.replace(re, kvarArr[i].value);
				else formula = formula.replace(re, '"' + kvarArr[i].value + '"');
			}
			return formula;
		};

		let expr = replaceKvar(formula);
		let result = await api.post('formula/eval', { expr: expr }, user.sessionToken);

		//console.log('Formula:', formula, 'Expr:', expr, 'Result:', result);
		return result;
	},

	//??????value??????refValue???????????????????????????????????????
	//????????????????????????string??? boolean??? number
	sameTypeValue: function (value: any, refValue: any) {
		let tmp = value;
		if (typeof tmp !== 'string') {
			tmp = '' + value;
		}
		if (typeof refValue === 'boolean') {
			tmp = value === 'true';
			return tmp;
		} else if (typeof refValue === 'number') {
			tmp = parseFloat(tmp);
			return tmp;
		} else {
			return value;
		}
	},
};
export default Parser;
