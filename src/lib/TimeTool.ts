import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn.js'; // 导入本地化语言
import relativeTime from 'dayjs/plugin/relativeTime.js';

dayjs.extend(relativeTime);

const TimeTool = {
	name: 'IAMTImeTool',
	setLocale: function (theLocale = 'zh-cn') {
		dayjs.locale(theLocale); // 使用本地化语言
	},
	format: function (atime, formatString) {
		return dayjs(atime).format(formatString);
	},
	toNow: function (atime) {
		return dayjs(atime).toNow();
	},
	fromNow: function (atime) {
		return dayjs(atime).fromNow();
	},
	dayjs: dayjs,
};
export default TimeTool;
