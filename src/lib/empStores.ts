import storage from '$lib/store';
import type { WorkStatus, WhichTab, FilterPicks } from '$lib/types';

export const WorkStatusStore = storage<WorkStatus>('work_status', { status: 'ST_DONE' });
export const debugOption = storage<string>('debugOption', 'no');

export const whichTabStore = storage<WhichTab>('whichtab', {
	template: 'home',
	team: 'search',
	worklist: 'ST_RUN',
	workflow: 'ST_RUN',
	setting: 'personal'
});

export const filterStore = storage<FilterPicks>('filter', {
	wfStatus: 'ST_RUN',
	workStatus: 'ST_RUN',
	tplTag: '',
	tplid: '',
	doer: '',
	workTitlePattern: '',
	wfTitlePattern: '',
	tplTitlePattern: '',
	gotoUID: '',
	workSorting: { dir: '', key: '' },
	wfSorting: { dir: '', key: '' },
	tplSorting: { dir: '', key: '' },
	tabs: '',
	tabs2nd: '',
	settingTab: '',
	settingTab2nd: '',
	try_with_teamid: '',
	try_with_email: '',
	debug: ''
});
