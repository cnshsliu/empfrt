<script lang="ts">
	import type { Work } from '$lib/types';
	import Parser from '$lib/parser';
	import sanitizeHtml from 'sanitize-html';
	export let work: Work;
	const base64ToHTML = (base64) => {
		let tmp = Parser.base64ToCode(base64);
		let html = sanitizeHtml(tmp, {
			//allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
			allowedTags: [
				'b',
				'i',
				'em',
				'strong',
				'a',
				'blockquote',
				'li',
				'ol',
				'ul',
				'br',
				'code',
				'span',
				'sub',
				'sup',
				'table',
				'thead',
				'th',
				'tbody',
				'tr',
				'td',
				'div',
				'p',
				'h1',
				'h2',
				'h3',
				'h4'
			]
		});
		return html;
	};
</script>

{@html work && work.instruct ? base64ToHTML(work.instruct) : ''}
