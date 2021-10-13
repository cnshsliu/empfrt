import { Buffer } from 'buffer';
const KVars = {
	kvarsToArray: function (kvars, workid): any[] {
		const kvarsArr = [];
		for (const [name, valueDef] of Object.entries(kvars)) {
			//eslint-disable-next-line
			if (name === 'reason2') {
				console.log(valueDef);
			}
			let tmp = {};
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
	arrayToKvars: function (kvarsArray): any {
		let ret = {};
		for (let i = 0; i < kvarsArray.length; i++) {
			ret[kvarsArray[i].name] = kvarsArray[i];
			delete ret[kvarsArray[i].name]['name'];
		}
		return ret;
	},
	codeToBase64: function (code: string) {
		return Buffer.from(code).toString('base64');
	},
	base64ToCode: function (base64: string) {
		return Buffer.from(base64, 'base64').toString('utf-8');
	}
};

export default KVars;
