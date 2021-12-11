// this action (https://svelte.dev/tutorial/actions) allows us to
// progressively enhance a <form> that already works without JS

export function enhance(
	form: HTMLFormElement,
	{
		preCheck,
		token,
		pending,
		error,
		result
	}: {
		preCheck?: () => boolean;
		token?: string;
		pending?: (data: FormData, form: HTMLFormElement) => void;
		error?: (res: Response, error: Error, form: HTMLFormElement) => void;
		result: (res: Response, form: HTMLFormElement) => void;
	}
): any {
	//eslint-disable-line

	async function handle_submit(e: Event) {
		e.preventDefault();

		if (preCheck) {
			if (preCheck() === false) return;
		}

		const contentType = 'application/json';
		const formData = new FormData(form);
		const tmp: { [k: string]: any } = Object.fromEntries(formData);
		const body = JSON.stringify(tmp);

		try {
			const res = await fetch(form.action, {
				method: form.method,
				headers: {
					'Content-Type': contentType,
					Accept: 'application/json',
					Authorization: token
				},
				body // this paramater must has name body
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

export function enhanceAddOneRoleMember(
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

		const contentType = 'application/json';
		const formData = new FormData(form);
		const members = [{ uid: formData.get('uid'), cn: formData.get('cn') }];
		formData.delete('uid');
		formData.delete('cn');

		const tmp: { [k: string]: unknown } = Object.fromEntries(formData);
		tmp.members = members;
		const body = JSON.stringify(tmp);

		//if (pending) pending(data, form);

		try {
			const res = await fetch(form.action, {
				method: form.method,
				headers: {
					'Content-Type': contentType,
					Accept: 'application/json',
					Authorization: token
				},
				body // this paramater must has name body
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
