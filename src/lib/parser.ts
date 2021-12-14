import { Buffer } from 'buffer';
interface KVars {
	name: string;
	def: unknown;
}
const Parser = {
	isEmpty: function (str: string | number): boolean {
		if (str === undefined || str === null) return true;
		if (str === '') return true;
		return false;
	},
	kvarsToArray: function (kvars: KVars, workid: string): Record<string, unknown>[] {
		const kvarsArr = [];
		for (const [name, valueDef] of Object.entries(kvars)) {
			//eslint-disable-next-line
			if (name === 'reason2') {
				console.log(valueDef);
			}
			let tmp: Record<string, unknown> = {};
			if (typeof valueDef === 'string') tmp = { name: name, value: valueDef, type: 'plaintext' };
			else {
				tmp = { ...{ name: name }, ...valueDef };
				//START Speculate variable type
				//based on prefix_ of name
				let matchResult = name.match(
					'(email|password|url|range|number|datetime|date|time|color|search|select|textarea|file|radio|checkbox)_'
				);
				tmp.type = 'plaintext';
				if (matchResult) {
					tmp.type = matchResult[1];
				} else {
					//based on value type if no prefix_ in name
					//eslint-disable-next-line
					matchResult = (typeof valueDef.value).match('(number|string)');
					if (matchResult) {
						tmp.type = matchResult[1];
						if (tmp.type === 'string') tmp.type = 'plaintext';
					}
				}
				//END Speculate variable type
				for (const [varKey, varValue] of Object.entries(tmp)) {
					if (typeof varValue === 'string' && varValue.indexOf('[workid]') >= 0) {
						tmp[varKey] = varValue.replace('[workid]', workid);
					}
				}
				if (tmp.type === 'select' && Array.isArray(tmp.options) === false) {
					tmp.options = ['DEFAULT'];
				}
			}
			kvarsArr.push(tmp);
		}
		return kvarsArr;
	},
	arrayToKvars: function (kvarsArray: KVars[]): KVars {
		const ret: KVars = {}; //eslint-disable-line
		for (let i = 0; i < kvarsArray.length; i++) {
			ret[kvarsArray[i].name] = kvarsArray[i];
			delete ret[kvarsArray[i].name]['name'];
		}
		return ret;
	},
	codeToBase64: function (code: string): string {
		return Buffer.from(code).toString('base64');
	},
	base64ToCode: function (base64: string): string {
		return Buffer.from(base64, 'base64').toString('utf-8');
	},
	addUserTag: function (str) {
		let m = str.match(/(@\S+)/g);
		if (!m) return str;
		for (let i = 0; i < m.length; i++) {
			str = str.replace(m[i], `<span class='usertag'>${m[i]}</span>`);
		}
		console.log(str);
		return str;
	},

	//eslint-disable-next-line
	collectRoles: function (nodes): string[] {
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
	}
};
export default Parser;
