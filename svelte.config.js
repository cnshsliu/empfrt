import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		//target: '#svelte',
		//https://www.npmjs.com/package/svelte-kit-cookie-session
		adapter: adapter({
			out: 'build',
			precompress: false
		}),
		vite: {
			optimizeDeps: {
				exclude: ['svelte-kit-cookie-session', '@popperjs']
			},
			build: {
				chunkSizeWarningLimit: 500
			},
			server: {
				fs: {
					allow: ['thirdparty']
				},
				hmr: {
					protocol: 'ws',
					host: 'localhost',
					port: 24678
				}
			}
		}
	}
};

export default config;
