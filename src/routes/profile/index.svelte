<script context="module">
	export function load({ session }) {
		return {
			status: 302,
			redirect: session.user ? `/profile/@${session.user.email}` : '/login'
		};
	}
</script>
