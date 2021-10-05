import storage from '$lib/store';

interface WorkStatus {
	status: string;
}

export const WorkStatusStore = storage<WorkStatus>('work_status', { status: 'ST_DONE' });
