'use strict';

export const PermControl = function (perms, who, what, instance, op, debug? = false) {
	let ret = false;
	//WHAT-OP
	if (debug) debugger;
	for (let i = 0; i < perms.length; i++) {
		let aPerm = perms[i];
		let assign = true;
		if (aPerm[0] === '-') {
			assign = false;
			aPerm = aPerm.substring(1);
		}
		let tmp = aPerm.split('-');
		let ownerField = 'author';
		ownerField = ['template', 'team'].includes(what)
			? 'author'
			: what === 'workflow'
			? 'starter'
			: what === 'work'
			? 'doer'
			: 'unknown_owner_field';
		if (tmp[0] === 'owned') {
			if (instance && instance[ownerField] === who) {
				if (['*', what].includes(tmp[1]) && ['*', op].includes(tmp[2])) {
					if (assign) ret = true;
					else ret = false;
				}
			}
		} else if (tmp[0] === '*') {
			if (['*', what].includes(tmp[1]) && ['*', op].includes(tmp[2])) {
				if (assign) ret = true;
				else ret = false;
			}
		}
	}
	op === 'delete' &&
		what === 'template' &&
		console.log('PermControl', perms, what, op, who, 'return', ret);
	return ret;
};
