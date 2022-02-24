'use strict';

const config = {
	tenant: {
		id: 'COMPANY A',
		name: 'Company A'
	},
	badge: {
		lastSeconds: 3000
	},
	cocodoc: {
		doc_id: 'dummydocnotallowed',
		name: '',
		prjid: 'dummydocnotallowed',
		owner: 'dummydocnotallowed',
		readonly: false
	},
	oss: {
		cocopad_bucket_name: 'cocopad'
	},
	vault: {
		bucket: 'vts'
	},
	product: {
		url: 'https://colobod.com',
		basedir: ''
	},
	ws_server: {
		endpoint: { label: 'LOCAL', url: 'ws://localhost:5008/grume/wsquux' },
		endpoint_lzj: {
			label: 'LZJ',
			url: 'wss://liuzijin.com/clbdapi/grume/wsquux'
		},
		endpoint_local: { label: 'LOCAL', url: 'ws://localhost:5008/grume/wsquux' }
	},
	frontend: {
		url: 'http://localhost:8191/frontend',
		url_remote: 'http://localhost:8191/frontend',
		url_local: 'http://localhost:8087'
	},
	cos: {
		region: 'ap-nanjing',
		bucket: 'nanjing1-1255349658',
		domain: 'cos.ap-nanjing.myqcloud.com',
		reverseproxy: 'mlib.liuzijin.com'
	},
	ui: {
		boundingrect_padding: 10
	},
	node: {
		image: {
			resizable: true
		},
		ACTION: { edittable: true, resizable: false },
		INFORM: { edittable: true, resizable: false },
		SCRIPT: { edittable: true, resizable: false },
		TIMER: { edittable: true, resizable: false },
		SUB: { edittable: true, resizable: false },
		AND: { edittable: true, resizable: false },
		OR: { edittable: true, resizable: false },
		GROUND: { edittable: true, resizable: false },
		THROUGH: { edittable: true, resizable: false }
	},
	defaultSize: {},
	layout: {
		spacing: {
			vert: 20,
			hori: 20
		}
	},
	quickglance: {
		timer: 10
	},
	morph: {
		delta: 2
	},
	connect: {
		styles: {
			style1: {
				normal: {
					width: 2,
					color: '#2726ff'
				},
				hover: {
					width: 4,
					color: '#4BDB92'
				}
			}
		}
	},
	viewConfig: {
		showbounding: false,
		snap: false
	}
};

export default config;
