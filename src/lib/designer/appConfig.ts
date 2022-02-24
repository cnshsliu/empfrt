const APP = {
	images: {},
	node: {
		ACTION: {
			id: '',
			label: '',
			role: '',
			kvars: '{}',
			workitem: { status: '', doer: '', kvars: '{}' }
		},
		SCRIPT: { id: '', label: '', code: '' },
		INFORM: { id: '', label: '', role: '', subject: '', content: '' },
		TIMER: { id: '', label: '', code: '' },
		SUB: { id: '', label: '', sub: '' }
	},
	state: {
		node: {
			ACTION: { id: true, label: true, role: true },
			SCRIPT: { id: true, label: true, code: true },
			INFORM: { id: true, label: true, role: true, subject: true, content: true },
			TIMER: { id: true, label: true, code: true },
			SUB: { id: true, label: true, sub: true }
		}
	},
	modal_text: '',
	toolActiveState: {
		POINTER: true,
		ACTION: false,
		INFORM: false,
		SCRIPT: false,
		TIMER: false,
		SUB: false,
		AND: false,
		OR: false,
		GROUND: false,
		CONNECT: false,
		THROUGH: false
	},
	model: {
		gridWidth: 20,
		signInButWaitVerify: false,
		isMobile: false,
		regForShared: false, //是否是接受到分享链接的用户来注册？
		loading_value: 0,
		msgbox: {
			title: '',
			content: ''
		},
		svg: {
			connect: {
				color: 'red',
				width: 2,
				triangle: {
					width: 1,
					color: 'blue',
					fill: 'blue'
				}
			}
		},
		cocodoc: {
			doc_id: 'dummydocnotallowed',
			name: '',
			prjid: 'dummydocnotallowed',
			owner: 'dummydocnotallowed',
			readonly: false,
			ownerAvatar_src: undefined,
			pms: 0
		},
		perPage: 15,
		currentPrjPage: 1,
		viewConfig: {
			bgcolor: '#ABABAB',
			snap: true,
			showgrid: true,
			showlock: true,
			showbounding: true,
			showEditor: 'last',
			nodemessage: true,
			autoFollow: true,
			autoLayout: true,
			docAcl: 0,
			drawOnTop: true,
			simpleLineMode: true
		},
		paste: {
			content: '',
			display: '',
			box: 'none',
			ctype: 'text',
			showcontent: false,
			showdisplay: false,
			showbox: false,
			options: [
				{
					item: 'none',
					name: '无'
				},
				{
					item: 'border',
					name: '仅边框'
				},
				{
					item: 'all',
					name: '边框和底色'
				}
			]
		}
	},
	show: {
		section: true,
		form: true,
		dialog: true
	},
	setData: (data, key, value) => {
		APP[data][key] = value;
	}
};

export default APP;
