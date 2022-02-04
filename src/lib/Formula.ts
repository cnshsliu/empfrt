'use strict';

export function datediff(s1, s2) {
	let d1 = Date.parse(s1);
	let d2 = Date.parse(s2);
	let diffInMs = Math.abs(d2 - d1);
	return diffInMs / (1000 * 60 * 60 * 24);
}

export function lastingdays(s1, s2, roundTo) {
	let d1 = Date.parse(s1);
	let d2 = Date.parse(s2);
	let diffInMs = Math.abs(d2 - d1);
	return diffInMs / (1000 * 60 * 60 * 24);
}
