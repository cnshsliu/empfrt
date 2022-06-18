import storage from '$lib/storage';
import Const from '$lib/Const';
import type { WorkStatus, WhichTab, FilterPicks } from '$lib/types';

export const TagStorage = storage('tags', {});
export const wfMonitorInterval = storage('wfminterval', 0);
export const kshareCate = storage('ksharecate', 'scenario');
export const inputs = storage('inputs', {});
export const emailDomainForLogin = storage('edforlogin', { domain: '@' });
export const WorkStatusStorage = storage<WorkStatus>('work_status', { status: 'ST_DONE' });
export const debugOption = storage<string>('debugOption', 'no');
export const autorefreshid = storage<string>('autorefreshid', '0');
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
	wf: { tplTag: '', sortby: '-updatedAt' },
	todo: { tplTag: '', sortby: 'lastdays' },
	tpl: { tplTag: '', sortby: '-updatedAt' },
	locale: '',
	confirmlocale: false,
	gotoUID: '',
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
