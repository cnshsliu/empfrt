<script lang="ts">
	import { _ } from '$lib/i18n';
	import { spring } from 'svelte/motion';
	import { onMount } from 'svelte';
	import { Row, Col } from 'sveltestrap';

	export let resendCountdown = 0;

	const displayed_count = spring();
	$: displayed_count.set(resendCountdown);
	$: offset = modulo($displayed_count, 1);

	function modulo(n: number, m: number) {
		// handle negative numbers
		return ((n % m) + m) % m;
	}
	let timerId;

	export function reset() {
		//if (timerId) clearTimeout(timerId);
	}

	onMount(() => {
		function next() {
			resendCountdown--;
			if (resendCountdown > 0) timerId = setTimeout(next, 1000);
		}
		timerId = setTimeout(next, 1000);
	});
</script>

<div class="counter">
	<Row cols="1">
		<Col class={'text-center'}>
			<div>{$_('login.verificationEmailSent')}</div>
		</Col>
		<Col class="w-100">
			<div class="counter-viewport">
				<div class="counter-digits" style="transform: translate(0, {100 * offset}%)">
					<strong style="top: -100%" aria-hidden="true">{Math.floor($displayed_count + 1)}</strong>
					<strong>{Math.floor($displayed_count)}</strong>
				</div>
			</div>
		</Col>
		<Col class={'text-center'}>
			<div>{$_('login.resendVerificationEmailLater')}</div>
		</Col>
	</Row>
</div>

<style>
	.counter {
		display: flex;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		margin: 1rem 0;
		justify-content: center;
	}

	.counter-viewport {
		width: 100%;
		height: 4em;
		overflow: hidden;
		text-align: center;
		position: relative;
		align-items: center;
		justify-content: center;
	}

	.counter-viewport strong {
		position: absolute;
		display: block;
		width: 100%;
		height: 100%;
		font-weight: 400;
		color: var(--accent-color);
		font-size: 4rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.counter-digits {
		position: absolute;
		width: 100%;
		height: 100%;
	}
</style>
