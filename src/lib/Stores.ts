import { writable } from 'svelte/store';
export const printing = writable(false);
export const notifyMessage = writable({
	message: '',
	type: 'warning',
	pos: 'bottom',
	time: 2000
});
