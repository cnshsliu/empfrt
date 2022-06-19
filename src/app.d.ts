/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
/// <reference types="@sveltejs/kit" />

declare namespace App {
	interface Locals {}

	interface Platform {}

	interface Session {
		user: any;
		avatarChangedFlag?: any;
		rstPwdFor?: string;
		comments?: any[];
		comment_wfid?: string;
		wfid?: string;
		version?: string;
		q?: string;
		whichwf?: string;
		showAdvancedSearch?: boolean;
		tplIdsForSearch_for_todo?: any[];
		tplIdsForSearch_for_wf?: any[];
		tplIds?: any[];
		delegators?: any[];
		siteinfo?: unknown;
	}

	interface Stuff {}
}
