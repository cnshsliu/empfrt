import * as dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; // 导入本地化语言
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

dayjs.locale('zh-cn'); // 使用本地化语言
const TimeTool = {
	format: function (atime, formatString) {
		return dayjs(atime).format(formatString);
	},
	toNow: function (atime) {
		return dayjs(atime).toNow();
	},
	fromNow: function (atime) {
		return dayjs(atime).fromNow();
	}
};
export default TimeTool;
