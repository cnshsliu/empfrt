import { writable } from 'svelte/store';
export const printing = writable(false);
export const bootstrap = writable();
export const workRefreshInterval = writable();
export const fetchCache = writable({});
export const siteinfo = writable(null);
export const delayLoadOnMount = writable(0);
export const forcePreDelete = writable(false);
export const worklistChangeFlag = writable(0);
export const miningMode = writable(false);
export const miningConfig = writable({
	showOnlyAboveThreshold: false,
	withWhat: { process: true, todos: true },
	barTypes: { lasting: true, works: true, todos: true },
	redlight_unit: 'hour',
	process_threshold_days: 7,
	redlight_threshold_days: 1,
	redlight_threshold_hours: 24,
	dimension: 'time',
	peopleby: 'tasks_number',
});
export const showAdvancedSearch = writable({}); //Caution: please dont' give it any intial value
export const srPage = writable({ todo: 0, tpl: 0, wf: 0 });
export const lastQuery = writable({ todo: {}, wf: {}, tpl: {} });
export const lastMining = writable({});
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
