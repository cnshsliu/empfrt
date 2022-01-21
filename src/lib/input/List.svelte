<script type="ts">
	import { Input } from 'sveltestrap';
	import { createEventDispatcher } from 'svelte';
	import { session } from '$app/stores';
	import Parser from '$lib/parser';
	import * as api from '$lib/api';
	import type { EmpResponse } from '$lib/types';

	const dispatch = createEventDispatcher();

	export let kvar;
	//MOCK START
	//MOCK END
	let list = [];
	let serverListName = '';
	let tobeTriggeredSelectName = '';
	let user = $session.user;
	export let whichtoChange = '';
	export let serverListKey = '';

	const getRT = function (str) {
		let ret = null;
		let match = str.match(/[r|R|t|T]:\s*([^;\s]+)/g);
		if (match) {
			for (let i = 0; i < match.length; i++) {
				if (match[i].startsWith('R:')) {
					if (ret === null) ret = {};
					ret.R = match[i].substring(2).trim();
				} else if (match[i].startsWith('T:')) {
					if (ret === null) ret = {};
					if (!ret.T) ret.T = [];
					let aT = match[i].substring(2).trim();
					ret.T.push(aT);
				}
			}
		}
		return ret;
	};
	const listToSelectOptionsPair = function (list) {
		list = list.map((x) => ({ value: x, display: x }));
		if (list.length === 0) {
			list.push({ value: '', display: '--Empty--' });
		} else {
			list.unshift({ value: '', display: '--Select--' });
		}
		return list;
	};

	let joinedOptions = kvar.options.join(';');
	let rT = getRT(joinedOptions);
	if (rT) {
		serverListName = rT.R;
		if (rT.T) {
			tobeTriggeredSelectName = rT.T.join(';');
			//Get list from serverListName (aka, rT.R);
			setTimeout(async () => {
				list = (await api.post(
					'list/get/items',
					{
						name: serverListName,
						key: serverListKey
					},
					user.sessionToken
				)) as unknown as any[];
				if ((list as EmpResponse).error) {
					list = listToSelectOptionsPair([]);
				} else {
					list = listToSelectOptionsPair(list);
				}
			});
		}
	} else {
		if (kvar.name.startsWith('ou_')) {
			let top = kvar.options[0] ? kvar.options[0] : 'root';
			let withTop = kvar.options[1] ? kvar.options[1] : 'yes';
			console.log('Refresh ou selector from top: ', top, 'with top', withTop);
			let ous = [];
			api
				.post('orgchart/listou', { top: 'root', withTop: 'yes' }, user.sessionToken)
				.then((res) => {
					let topOuLength = res[0].ou === 'root' ? 0 : res[0].ou.length;
					console.log(topOuLength, res.length, res);
					let prefix = '';
					for (let i = 0; i < res.length; i++) {
						let tmp = '';
						//如果是root，则直接返回去CN
						if (res[i].ou === 'root') tmp = res[i].cn;
						else {
							//否则，每五个字符分割为字符串数组
							let m = Parser.chunkString(res[i].ou, 5);
							for (let i = 0; i < m.length; i++) {
								let tmpou = '';
								for (let j = 0; j <= i; j++) {
									tmpou += m[j];
								}
								for (let k = 0; k < res.length; k++) {
									if (res[k].ou === tmpou) {
										tmp += (tmp.length > 0 ? '-' : '') + res[k].cn;
									}
								}
							}
							console.log(tmp);
						}
						list.push({ value: res[i].ou, display: tmp });
					}
					if (list.length === 0) {
						list.push({ value: '', display: '--Empty--' });
					} else {
						list.unshift({ value: '', display: '--Select--' });
					}
					list = list;
				});
		} else {
			list = kvar.options;
			list = listToSelectOptionsPair(list);
		}
	}

	const onListChange = function (e) {
		let selectedValue = e.target.value;
		dispatch('changelist', `${tobeTriggeredSelectName}/${selectedValue}`);
	};

	const refreshDataFromServerListWithKey = async function (serverListKey) {
		//list = ['new', 'data', 'from', 'server'];
		list = (await api.post(
			'list/get/items',
			{
				name: serverListName,
				key: serverListKey
			},
			user.sessionToken
		)) as unknown as any[];
		if ((list as EmpResponse).error) {
			list = listToSelectOptionsPair([]);
		} else {
			list = listToSelectOptionsPair(list);
		}
	};

	$: {
		if (whichtoChange.split(';').includes(kvar.name)) {
			setTimeout(async () => {
				await refreshDataFromServerListWithKey(serverListKey);
			});
		}
	}
</script>

<Input
	type="select"
	name={kvar.name}
	id={kvar.id ? kvar.id : kvar.name}
	bind:value={kvar.value}
	required={kvar.required}
	on:change={onListChange}
>
	{#each list as item}
		<option value={item.value}>{item.display}</option>
	{/each}
</Input>
