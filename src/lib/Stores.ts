import { writable } from 'svelte/store';
export const printing = writable(false);
export const resultCache = writable({ todo: [], wf: [], tpl: [] });
export const showAdvancedSearch = writable({}); //Caution: please dont' give it any intial value
export const srPage = writable({ todo: 0, tpl: 0, wf: 0 });
export const lastQuery = writable({ todo: {}, wf: {}, tpl: {} });
export const savedSearches = writable({ todo: [], wf: [] });
export const wfPage = writable(0);
export const todoPage = writable(0);
export const mtcSearchCondition = writable({
	todo: {
		init: 0,
		search: '',
		extra: {} as any,
	},
});
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
