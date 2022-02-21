let a = ['ab=1', 'ab==2', 'ab===3', 'ab>4', 'ab>=4', 'ab<5', 'ab<=5', 'ab!=6'];

const splitWhen = (x) => {
	let tmp = x.match(/(\w+)(\={1,3}|\>=?|\<=?|\!=)(\w+)/);
	if (tmp) {
		return [tmp[1], tmp[2], tmp[3]];
	} else {
		return null;
	}
};

for (let i = 0; i < a.length; i++) {
	splitWhen(a[i]);
}
