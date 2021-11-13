import storage from '$lib/store';
import type { WorkStatus, WhichTab } from '$lib/types';

export const WorkStatusStore = storage<WorkStatus>('work_status', { status: 'ST_DONE' });

export const whichTabStore = storage<WhichTab>('whichtab', {
	template: 'home',
	team: 'search',
	worklist: 'ST_RUN',
	workflow: 'ST_RUN',
	setting: 'personal'
});
