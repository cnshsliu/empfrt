import moment from 'moment';
import 'moment/locale/zh-cn.js';
const TimeTool = {
	format: function (atime, formatString) {
		moment.locale('zh-cn');
		return moment(atime).format(formatString);
	},
	toNow: function (atime) {
		moment.locale('zh-cn');
		return moment(atime).toNow();
	},
	fromNow: function (atime) {
		moment.locale('zh-cn');
		return moment(atime).fromNow();
	}
};
export default TimeTool;
