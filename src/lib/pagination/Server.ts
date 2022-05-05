import * as api from '$lib/api';

export async function getData(
	endpoint,
	token,
	page,
	pageSize,
	searchFilter,
	sorting,
	payload_extra,
	reason
) {
	let skip = page * pageSize;
	let limit = pageSize;
	let payload = { pattern: searchFilter, skip: skip, limit: limit, sort_order: 1, reason: reason };
	if (sorting && sorting.dir === 'desc') {
		payload.sort_order = -1;
	} else {
		payload.sort_order = 1;
	}
	if (sorting && sorting.key) {
		payload.sort_field = sorting.key;
	}
	payload = { ...payload, ...payload_extra };
	const ret = await api.post(endpoint, payload, token);
	if (ret.error) {
		return ret;
	}

	//服务端需要返回对象{objs:[], total: number}
	else return { rows: ret.objs, rowsCount: ret.total };
}
