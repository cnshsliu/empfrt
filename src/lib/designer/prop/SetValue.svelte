<script lang="ts">
	import { _ } from '$lib/i18n';
	import { InputGroup, InputGroupText, Input, Button, Icon } from 'sveltestrap';
	import { onMount } from 'svelte';
	export let value = '';

	let kvs = [];
	const splitValue = function (aa) {
		kvs = value
			.split(/[\s;,]/)
			.filter((x) => x)
			.map((x) => {
				let m = x.match(/(.*)=(.*)/);
				if (m) {
					let k: string = m[1].trim();
					let v: any = m[2].trim();
					let tv = parseFloat(v);
					if (isNaN(tv) === false) {
						v = tv;
					}
					return { k: k, v: v };
				}
			});
		kvs = kvs.filter((x) => x && x.k && x.v);
		console.log(JSON.stringify(kvs, null, 2));
	};

	let firstTimeSplit = true;
	splitValue(null);

	const joinValue = function (tmp = null) {
		value = kvs
			.filter((x) => x && x.k && x.v && x.k.trim() && (typeof x.v === 'string' ? x.v.trim() : true))
			.map((x) => `${x.k}=${x.v}`)
			.join(';');
	};

	onMount(() => {
		firstTimeSplit = false;
	});

	$: firstTimeSplit === false && joinValue(kvs);
</script>

<InputGroup class="mb-1">
	<Button
		class="ms-auto"
		color="primary"
		on:click={(e) => {
			e.preventDefault();
			kvs.push({ k: '', v: '' });
			kvs = kvs;
			joinValue();
		}}
	>
		+
	</Button>
</InputGroup>
{#each kvs as { k, v }, index}
	<InputGroup>
		<InputGroupText>{$_('prop.connect.varname')}</InputGroupText>
		<Input bind:value={k} />
		<InputGroupText>{$_('prop.connect.varvalue')}</InputGroupText>
		<Input bind:value={v} />
		<Button
			size="sm"
			on:click={(e) => {
				e.preventDefault();
				if (index > 0) {
					kvs.splice(index - 1, 0, kvs.splice(index, 1)[0]);
					kvs = kvs;
				}
			}}
		>
			<Icon name="chevron-up" />
		</Button>
		<Button
			size="sm"
			on:click={(e) => {
				e.preventDefault();
				if (index < kvs.length - 1) {
					kvs.splice(index + 1, 0, kvs.splice(index, 1)[0]);
					kvs = kvs;
				}
			}}
		>
			<Icon name="chevron-down" />
		</Button>
		<Button
			size="sm"
			on:click={(e) => {
				e.preventDefault();
				kvs.splice(index, 1);
				kvs = kvs;
			}}
		>
			<Icon name="dash" />
		</Button>
	</InputGroup>
{/each}
