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
): any {
	//eslint-disable-line

	async function handle_submit(e: Event) {
		e.preventDefault();

		let contentType = 'application/json';
		const formData = new FormData(form);
		const tmp:{ [k: string]: any } = Object.fromEntries(formData);
		let body="";
		if (form.enctype !== 'multipart/form-data') {
			body = JSON.stringify(tmp);
		} else {
			contentType = 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW';
			console.log("multipart/form-data is not supported at this time.");
		}

		//if (pending) pending(data, form);

		try {
			const res = await fetch(form.action, {
				method: form.method,
				headers: {
					'Content-Type': contentType,
					Accept: 'application/json',
					Authorization: token
				},
				body   // this paramater must has name body
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
