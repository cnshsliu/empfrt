import * as api from '$lib/api';
import { session } from '$app/stores';
import { resultCache } from '$lib/Stores';

let theCache;

const unsubscribe = resultCache.subscribe((value) => {
	theCache = value;
});

export async function getData(
	endpoint,
	token,
	page,
	pageSize,
	searchFilter,
	sorting,
	payload_extra,
	reason,
) {
	// Organize Payload query
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

	// Set payload without skip to ignore page navigator
	let payloadWithoutSkip = { ...payload };
	delete payloadWithoutSkip.skip;

	let gotoPage0 = false;
	if (theCache && theCache[endpoint]) {
		//How about cached payload with page navigator ignored?
		let cachedPayloadWithoutSkip = { ...theCache[endpoint].payload };
		delete cachedPayloadWithoutSkip.skip;
		//Determine whether we need to navigate to page0, when payload and cached payload are different without considering page navigator
		if (
			Object.entries(payloadWithoutSkip).toString() ===
			Object.entries(cachedPayloadWithoutSkip).toString()
		) {
			//If they are the same, no need to goto page0
			gotoPage0 = false;
		} else {
			//If search condition changed(without considering page navigator), we need to goto page0
			payload.skip = 0;
			gotoPage0 = true;
		}
	} else {
		//Or, if cache does not exist, of course we need to goto page0 as well.
		payload.skip = 0;
		gotoPage0 = true;
	}

	//console.log('Gotopage0=', gotoPage0);

	if (theCache && theCache[endpoint]) {
		if (
			Object.entries(theCache[endpoint].payload).toString() === Object.entries(payload).toString()
		) {
			console.log('Use cached result');
			//If cache exist
			if (gotoPage0) {
				//set page0
				return { gotoPage0: true, fromCache: true, ...theCache[endpoint].result };
			} else return { fromCache: true, ...theCache[endpoint].result }; //without page0
		}
	}

	const ret = await api.post(endpoint, payload, token);
	if (ret.error) {
		return ret;
	}
	//服务端需要返回对象{objs:[], total: number}
	else {
		let searchResult = { rows: ret.objs, rowsCount: ret.total };
		let searchResultCache = { payload: payload, result: searchResult };
		theCache[endpoint] = searchResultCache;
		resultCache.set(theCache);
		if (gotoPage0) {
			return { gotoPage0: true, ...searchResult };
		} else {
			return searchResult;
		}
	}
}
