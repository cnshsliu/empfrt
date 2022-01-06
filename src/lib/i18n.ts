import { derived } from 'svelte/store';
import { dictionary, locale, _, format, date, time } from 'svelte-i18n';

const MESSAGE_FILE_URL_TEMPLATE = 'http://localhost:3000/lang/{locale}.json';

let cachedLocale;

/* function setupI18n({ withLocale: _locale } = { withLocale: 'en' }) {
	const messsagesFileUrl = MESSAGE_FILE_URL_TEMPLATE.replace('{locale}', _locale);
	console.log('withLocale', _locale, 'loading', messsagesFileUrl);

	return fetch(messsagesFileUrl)
		.then((response) => response.json())
		.then((messages) => {
			dictionary.set({ [_locale]: messages });

			cachedLocale = _locale;

			locale.set(_locale);
		});
} */
function setupI18n({ withLocale: _locale } = { withLocale: 'en' }) {
	if (!_locale) {
		return;
	}

	return import(`./lang/${_locale}.json`).then((messages) => {
		dictionary.set({ [_locale]: messages });

		cachedLocale = _locale;

		locale.set(_locale);
	});
}

function formatDate(date, options) {
	return new Intl.DateTimeFormat(cachedLocale, options).format(new Date(date));
}

function mtcDate(date, tz = null) {
	if (!date) return 'UNKNOWN';
	let options = {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		hour12: false
	};
	if (tz) options.timeZone = tz;
	return new Intl.DateTimeFormat(cachedLocale, options).format(new Date(date));
}

const isLocaleLoaded = derived(locale, ($locale) => typeof $locale === 'string');

const dir = derived(locale, ($locale) => ($locale === 'ar' ? 'rtl' : 'ltr'));

export { _, locale, dir, setupI18n, formatDate, mtcDate, isLocaleLoaded, date, time };
