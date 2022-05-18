import storage from '$lib/storage';
import Const from '$lib/Const';
import type { WorkStatus, WhichTab, FilterPicks } from '$lib/types';

export const TagStorage = storage('tags', {});
export const WorkStatusStorage = storage<WorkStatus>('work_status', { status: 'ST_DONE' });
export const debugOption = storage<string>('debugOption', 'no');
export const version = storage<string>('version', Const.VERSION);
export const SetFor = storage('idSelect', {
	setTagFor: '',
	setDescFor: '',
	setAuthorFor: '',
	setVisiFor: '',
	settingFor: '',
});

export const whichTabStorage = storage<WhichTab>('whichtab', {
	template: 'home',
	team: 'search',
	worklist: 'ST_RUN',
	workflow: 'ST_RUN',
	setting: 'personal',
});

export const filterStorage = storage<FilterPicks>('filter', {
	wf: {},
	todo: {},
	tpl: {},
	locale: '',
	confirmlocale: false,
	tspan: 'any',
	gotoUID: '',
	tabs: '',
	tabs2nd: '',
	settingTab: '',
	settingTab2nd: '',
	try_with_teamid: '',
	try_with_email: '',
	try_with_kvar: '',
	try_with_wfid: '',
	col_per_row: { xs: 1 },
	pageSize: 10,
	showprocesstrack: true,
	curve: true,
	debug: '',
});
export const startedWorkflow = storage<any>('startedWorkflow', null);
