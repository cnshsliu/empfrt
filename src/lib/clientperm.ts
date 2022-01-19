'use strict';

export const ClientPermControl = function (perms, who, what, instance, op, debug? = false) {
	let ret = false;
	//WHAT-OP
	if (debug) debugger;
	if (perms) {
		for (let i = 0; i < perms.length; i++) {
			let aPerm = perms[i];
			//Assign to or take back
			let assign = true;
			if (aPerm[0] === '-') {
				assign = false;
				aPerm = aPerm.substring(1);
			}
			let tmp = aPerm.split('-');
			//不同对象的OwnerField不同
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
			if (
				what &&
				instance &&
				who &&
				what === 'workflow' &&
				instance['starter'] === who &&
				instance['rehearsal'] === true
			) {
				return true;
			}
		}
	}
	return ret;
};
