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
	hasValue: function (str: string | number): boolean {
		return !this.isEmpty(str);
	},
	kvarsToArray: function (kvars: KVars, workid: string): Record<string, unknown>[] {
		const kvarsArr = [];
		for (const [name, valueDef] of Object.entries(kvars)) {
			//eslint-disable-next-line
			let tmp: Record<string, unknown> = {};
			if (typeof valueDef === 'string') tmp = { name: name, value: valueDef, type: 'plaintext' };
			else {
				tmp = { ...{ name: name }, ...valueDef };
				//START Speculate variable type
				//based on prefix_ of name
				let matchResult = name.match(
					'(email|password|url|range|number|datetime|dt|date|time|color|search|select|textarea|file|radio|checkbox|cb)_'
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
	splitStringToArray: function (str, deli = null) {
		if (typeof str !== 'string') str = '';
		else str = str.trim();
		if (str === '') return [];
		let tmp = str.split(deli ? deli : /[\s;,]/);
		tmp = tmp.map((x) => x.trim()).filter((x) => x.length > 0);
		return tmp;
	},
	chunkString: function (str, len) {
		const size = Math.ceil(str.length / len);
		const r = Array(size);
		let offset = 0;

		for (let i = 0; i < size; i++) {
			r[i] = str.substr(offset, len);
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
			console.error(error);
			return ifErrorValue;
		}
	},
	addUserTag: function (str) {
		let m = str.match(/(@\S+)/g);
		if (!m) return str;
		for (let i = 0; i < m.length; i++) {
			str = str.replace(m[i], `<span class='usertag'>${m[i]}</span>`);
		}
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
	}
};
export default Parser;
