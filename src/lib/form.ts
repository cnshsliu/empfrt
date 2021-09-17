// this action (https://svelte.dev/tutorial/actions) allows us to
// progressively enhance a <form> that already works without JS

export function enhance(
	form: HTMLFormElement,
	{
		token,
		pending,
		error,
		result
	}: {
		token?: string;
		pending?: (data: FormData, form: HTMLFormElement) => void;
		error?: (res: Response, error: Error, form: HTMLFormElement) => void;
		result: (res: Response, form: HTMLFormElement) => void;
	}
):any { //eslint-disable-line 

	async function handle_submit(e: Event) {

		e.preventDefault();

		const data = Object.fromEntries(new FormData(form));
		const body = JSON.stringify(data);

		if (pending) pending(data, form);

		try {
			const res = await fetch(form.action, {
				method: form.method,
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': token
				},
				body
			});


			if (res.ok) {
				result(res, form);
			} else if (error) {
				error(res, null, form);
			} else {
				console.error(await res.text());
			}
		} catch (e) {
			if (error) {
				error(null, e, form);
			} else {
				throw e;
			}
		}
	}

	form.addEventListener('submit', handle_submit);

	return {
		destroy() {
			form.removeEventListener('submit', handle_submit);
		}
	};
}
