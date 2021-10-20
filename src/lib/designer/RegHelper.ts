const RegHelper = {
	removeMeta: (txt: string): string => {
		const g = txt.match(/<meta[^>]*>(.*)/su);
		if (g === null) return txt;
		else return g[1];
	},
	isUrl: (txt: string): boolean | string => {
		const g = txt.match(
			/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
		);
		if (g === null) return false;
		else return g[1];
	},
	urlAddress: (txt: string): string[] => {
		const g = txt.match(/^<a href="([^"]*")>([^<]*)<\/a>/);
		return g;
	},
	getDocIdInUrl: (pathname: string): string[] => {
		const m = pathname.match(/^\/doc\/(.+)\s*$/);
		return m;
	},
	getIvtCodeInUrl: (pathname: string): string[] => {
		const m = pathname.match(/^\/r\/(.+)\s*$/);
		return m;
	},
	validateEmails: (emails: string): string[] => {
		const mret = emails.match(
			/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})(\s*,\s*([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4}))*$/
		);
		return mret;
	}
};

export default RegHelper;
