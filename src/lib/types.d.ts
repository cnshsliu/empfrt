/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface Locals {
	userid: string;
};

export interface User {
	userid: string
  username: string
  email: string
  avatar: string
  bio: string
  sessionToken: string
};

export interface Template {
	_id: string
	tenant: string
	tplid: string
	author: string
	doc: string
	created_at: Date
	updated_at: Date
};


