import { writable } from 'svelte/store';
export const printing = writable(false);
export const mtcTplViewMode = writable('unknown');
export const notifyMessage = writable({
	message: '',
	type: 'warning',
	pos: 'bottom',
	time: 2000,
});
export const mtcConfirm = writable({
	title: '',
	body: '',
	buttons: [],
	callbacks: [],
});

export const mtcConfirmReset = () => {
	mtcConfirm.set({
		title: '',
		body: '',
		buttons: [],
		callbacks: [],
	});
};
