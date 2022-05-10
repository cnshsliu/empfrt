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
	}

	interface Stuff {}
}