<script type="ts">
	import { Icon } from 'sveltestrap';
	export let icon;
	export let ani;
</script>

<div class={'iconDiv' + ' ' + ani}><Icon name={icon} /></div>
