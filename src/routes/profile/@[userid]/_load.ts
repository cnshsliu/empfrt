export function create_load(endpoint) {
	return async ({ page, fetch }) => {
		console.log("loading...");
		console.log(`/profiles/@${page.params.email}/${endpoint}.json`);
		const res = await fetch(`/profiles/@${page.params.email}/${endpoint}.json`);

		return {
			props: await res.json()
		};
	};
}
