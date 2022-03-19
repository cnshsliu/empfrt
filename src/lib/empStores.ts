import storage from '$lib/storage';
import type { WorkStatus, WhichTab, FilterPicks } from '$lib/types';

export const TagStorage = storage('tags', {});
export const WorkStatusStorage = storage<WorkStatus>('work_status', { status: 'ST_DONE' });
export const debugOption = storage<string>('debugOption', 'no');
export const SetFor = storage('idSelect', {
	setTagFor: '',
	setDescFor: '',
	setAuthorFor: '',
	setVisiFor: '',
	settingFor: ''
});

export const whichTabStorage = storage<WhichTab>('whichtab', {
	template: 'home',
	team: 'search',
	worklist: 'ST_RUN',
	workflow: 'ST_RUN',
	setting: 'personal'
});

export const filterStorage = storage<FilterPicks>('filter', {
	wfStatus: 'ST_RUN',
	workStatus: 'ST_RUN',
	tplTag: '',
	tplid: '',
	doer: '',
	author: '',
	locale: '',
	confirmlocale: false,
	starter: '',
	tspan: '1w',
	calendar_begin: '',
	calendar_end: '',
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
	try_with_kvar: '',
	try_with_wfid: '',
	col_per_row: 1,
	row_per_page: 10,
	showprocesstrack: true,
	debug: ''
});
export const startedWorkflow = storage<any>('startedWorkflow', null);
