/// <reference types="@sveltejs/kit" />

import type { JSONValue } from '@sveltejs/kit/types/endpoint';
interface Locals {
	userid: string;
	session: import('svelte-kit-cookie-session').Session<{
		theme: 'dark' | 'light';
	}>;
}

export interface Locals {}

type RequestHandler<Body = unknown> = import('@sveltejs/kit').RequestHandler<Locals, Body>;
