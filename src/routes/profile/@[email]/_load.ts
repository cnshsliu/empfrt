export function create_load(endpoint) {
	return async ({ page, fetch }) => {
		console.log('loading...');
		console.log(`/profile/@${page.params.email}/${endpoint}.json`);
		const res = await fetch(`/profile/@${page.params.email}/${endpoint}.json`);
		const retProps = {};
		retProps[endpoint] = await res.json();

		return {
			props: retProps
		};
	};
}
