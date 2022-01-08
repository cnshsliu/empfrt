export const AdvOps = {};
AdvOps.styleCache = {};
import KFK from './KFK';

AdvOps.treeMap = new Map();
AdvOps.spaceMap = new Map();
AdvOps.globalTreeMap = new Map();
AdvOps.globalNodeMap = new Map();
AdvOps.allRelayouted = new Set();
AdvOps.RIGHT_SIDE = 1;
AdvOps.LEFT_SIDE = -1;

/* 获得一个DIV位于哪个页面上 */
AdvOps.getDivPage = function (div) {
	let onPage = -1;
	let myCenter = { x: KFK.divCenter(div), y: KFK.divMiddle(div) };
	for (let i = 0; i < KFK.pageBounding.Pages.length; i++) {
		if (
			myCenter.x >= KFK.pageBounding.Pages[i].left &&
			myCenter.x < KFK.pageBounding.Pages[i].left + KFK.PageWidth &&
			myCenter.y >= KFK.pageBounding.Pages[i].top &&
			myCenter.y < KFK.pageBounding.Pages[i].top + KFK.PageHeight
		) {
			onPage = i;
			break;
		}
	}
	return onPage;
};

AdvOps.onPage1 = function (jq, delta = { x: 0, y: 0 }) {
	let p1Rect = {
		left: 0,
		top: 0,
		right: KFK.PageWidth,
		bottom: KFK.PageHeight
	};
	let onP1Before = false;
	let onP1New = false;
	let newRect = KFK.divRect(jq);
	if (
		p1Rect.left < newRect.right &&
		p1Rect.right > newRect.left &&
		p1Rect.top < newRect.bottom &&
		p1Rect.bottom > newRect.top
	) {
		onP1New = true;
	}
	if (
		p1Rect.left < newRect.right - delta.x &&
		p1Rect.right > newRect.left - delta.x &&
		p1Rect.top < newRect.bottom - delta.y &&
		p1Rect.bottom > newRect.top - delta.y
	) {
		onP1Before = true;
	}
	return onP1Before || onP1New;
};

/* 获得一个图形处于哪个页面上 */
AdvOps.getShapePage = function (shape) {
	let onPage = -1;
	let rect = KFK.getShapeRect(shape);
	let myCenter = { x: rect.center, y: rect.middle };
	for (let i = 0; i < KFK.pageBounding.Pages.length; i++) {
		if (
			myCenter.x >= KFK.pageBounding.Pages[i].left &&
			myCenter.x < KFK.pageBounding.Pages[i].left + KFK.PageWidth &&
			myCenter.y >= KFK.pageBounding.Pages[i].top &&
			myCenter.y < KFK.pageBounding.Pages[i].top + KFK.PageHeight
		) {
			onPage = i;
			break;
		}
	}
	return onPage;
};

/* 移动单个对象到指定的页面 */
AdvOps.moveSingleElement = async function (pindex) {
	let div = KFK.hoverJqDiv();
	if (div) {
		AdvOps.moveSingleDiv(div, pindex);
	} else {
		let shape = KFK.hoverSvgLine();
		if (shape) {
			AdvOps.moveSingleShape(shape, pindex);
		}
	}
};

/* 移动单个DIV到指定页面 */
AdvOps.moveSingleDiv = async function (div, pindex) {
	// 获得div所在的原始页面
	let onPage = AdvOps.getDivPage(div);
	if (onPage === pindex) {
		return;
	}
	// 计算目标页面与原始页面的位置差距
	let deltaX = KFK.pageBounding.Pages[pindex].left - KFK.pageBounding.Pages[onPage].left;
	let deltaY = KFK.pageBounding.Pages[pindex].top - KFK.pageBounding.Pages[onPage].top;
	let oldDiv = div.clone();
	//将div的位置,进行位移
	KFK.divDMove(div, deltaX, deltaY);
	await KFK.syncNodePut('U', div.clone(), 'move to page', oldDiv, false, 0, 1);
	//视窗滚动到新位置
	KFK.scrollToNode(div);
};

AdvOps.moveSingleShape = async function (aShape, pindex) {
	let onPage = AdvOps.getShapePage(aShape);
	if (onPage === pindex) {
		return;
	}
	let deltaX = KFK.pageBounding.Pages[pindex].left - KFK.pageBounding.Pages[onPage].left;
	let deltaY = KFK.pageBounding.Pages[pindex].top - KFK.pageBounding.Pages[onPage].top;
	KFK.setShapeToRemember(aShape);
	aShape.dmove(deltaX, deltaY);
	KFK.resetShapeStyleToOrigin(aShape);
	KFK.resetShapeStyleToOrigin(KFK.shapeToRemember);
	await KFK.syncLinePut('U', aShape, 'move between page', KFK.shapeToRemember, false, 0, 1);
	KFK.scrollToShape(aShape);
};

AdvOps.moveAllElements = async function (pindex) {
	let div = KFK.hoverJqDiv();
	let shape = KFK.hoverSvgLine();
	let onPage = -1;
	if (div) {
		onPage = AdvOps.getDivPage(div);
	} else if (shape) {
		onPage = AdvOps.getShapePage(shape);
	} else {
		return;
	}
	if (onPage === pindex) {
		return;
	}

	KFK.startTrx();
	try {
		let allnodes = KFK.JC3.find('.kfknode');
		let samePageDIVsCount = 0;
		allnodes.each(async (index, aDIV) => {
			let jqDIV = $(aDIV);
			let theCenter = { x: KFK.divCenter(jqDIV), y: KFK.divMiddle(jqDIV) };
			if (
				theCenter.x >= KFK.pageBounding.Pages[onPage].left &&
				theCenter.x < KFK.pageBounding.Pages[onPage].left + KFK.PageWidth &&
				theCenter.y >= KFK.pageBounding.Pages[onPage].top &&
				theCenter.y < KFK.pageBounding.Pages[onPage].top + KFK.PageHeight &&
				KFK.anyLocked(jqDIV) === false &&
				KFK.updateable(jqDIV)
			) {
				samePageDIVsCount++;
			}
		});
		let allShapes = KFK.JC3.find('.kfkshape');
		let samePageShapesCount = 0;
		allShapes.each(async (index, aShapeDIV) => {
			let aShape = SVG(aShapeDIV);
			let aShapeRect = KFK.getShapeRect(aShape);
			let theCenter = { x: aShapeRect.center, y: aShapeRect.middle };
			if (
				theCenter.x >= KFK.pageBounding.Pages[onPage].left &&
				theCenter.x < KFK.pageBounding.Pages[onPage].left + KFK.PageWidth &&
				theCenter.y >= KFK.pageBounding.Pages[onPage].top &&
				theCenter.y < KFK.pageBounding.Pages[onPage].top + KFK.PageHeight &&
				KFK.anyLocked(aShape) === false
			) {
				samePageShapesCount++;
			}
		});
		let samePageElemCount = samePageDIVsCount + samePageShapesCount;
		let samePageIndex = 0;
		allnodes.each(async (index, aDIV) => {
			let jqDIV = $(aDIV);
			let theCenter = { x: KFK.divCenter(jqDIV), y: KFK.divMiddle(jqDIV) };
			if (
				theCenter.x >= KFK.pageBounding.Pages[onPage].left &&
				theCenter.x < KFK.pageBounding.Pages[onPage].left + KFK.PageWidth &&
				theCenter.y >= KFK.pageBounding.Pages[onPage].top &&
				theCenter.y < KFK.pageBounding.Pages[onPage].top + KFK.PageHeight &&
				KFK.anyLocked(jqDIV) === false &&
				KFK.updateable(jqDIV)
			) {
				if (samePageIndex < samePageElemCount) {
					let deltaX = KFK.pageBounding.Pages[pindex].left - KFK.pageBounding.Pages[onPage].left;
					let deltaY = KFK.pageBounding.Pages[pindex].top - KFK.pageBounding.Pages[onPage].top;
					let oldDiv = jqDIV.clone();
					KFK.divDMove(jqDIV, deltaX, deltaY);
					await KFK.syncNodePut(
						'U',
						jqDIV,
						'move to page',
						oldDiv,
						false,
						samePageIndex,
						samePageElemCount
					);
					KFK.redrawLinkLines(jqDIV, 'after moving');
					samePageIndex++;
				}
			}
		});

		allShapes.each(async (index, aShapeDIV) => {
			let aShape = SVG(aShapeDIV);
			let aShapeRect = KFK.getShapeRect(aShape);
			let theCenter = { x: aShapeRect.center, y: aShapeRect.middle };
			if (
				theCenter.x >= KFK.pageBounding.Pages[onPage].left &&
				theCenter.x < KFK.pageBounding.Pages[onPage].left + KFK.PageWidth &&
				theCenter.y >= KFK.pageBounding.Pages[onPage].top &&
				theCenter.y < KFK.pageBounding.Pages[onPage].top + KFK.PageHeight &&
				KFK.anyLocked(aShape) === false
			) {
				if (samePageIndex < samePageElemCount) {
					let deltaX = KFK.pageBounding.Pages[pindex].left - KFK.pageBounding.Pages[onPage].left;
					let deltaY = KFK.pageBounding.Pages[pindex].top - KFK.pageBounding.Pages[onPage].top;
					KFK.setShapeToRemember(aShape);
					aShape.dmove(deltaX, deltaY);
					KFK.resetShapeStyleToOrigin(aShape);
					KFK.resetShapeStyleToOrigin(KFK.shapeToRemember);
					await KFK.syncLinePut(
						'U',
						aShape,
						'move between page',
						KFK.shapeToRemember,
						false,
						samePageIndex,
						samePageElemCount
					);
					samePageIndex++;
				}
			}
		});
	} finally {
		KFK.endTrx();
	}
	if (div) KFK.scrollToNode(div);
	else if (shape) KFK.scrollToShape(shape);
};

AdvOps.getChildren = async function (jqNode) {
	let children = [];
	let childrenIds = KFK.getNodeLinkIds(jqNode, 'linkto');
	for (let i = 0; i < childrenIds.length; i++) {
		let jqChild = $(`#${childrenIds[i]}`);
		children.push(jqChild);
	}
	return children;
};

AdvOps.uniquefyKfkObjectArray = function (array) {
	let tmp = [];
	for (let i = 0; i < array.length; i++) {
		let found = false;
		for (let j = 0; j < tmp.length; j++) {
			if (tmp[j].id === array[i].id) {
				found = true;
				break;
			}
		}
		if (found === false) {
			tmp.push(array[i]);
		}
	}

	return tmp;
};

/**
 * 统计数组中各元素的重复数量,返回出现次数最多的元素及其出现次数, 以及排序结果
 * 例如,如果数组中元素为  [1, 2, 3, 2, 3, 2],
 * 则返回值为: {elem: 2, num: 3, [2:3, 3:2, 1:1]}
 *
 * @param {} arr
 */
AdvOps.findMost3 = function (arr) {
	let maxElem = null,
		maxNum = 0;
	let obj = arr.reduce((p, k) => {
		p[k] ? p[k]++ : (p[k] = 1);
		if (p[k] > maxNum) {
			maxElem = k;
			maxNum++;
		}

		return p;
	}, {});
	return { elem: maxElem, num: maxNum, sorted: obj };
};

AdvOps.existsInGroup = function (group, div) {
	for (let i = 0; i < group.length; i++) {
		if (group[i].attr('id') === div.attr('id')) {
			return true;
		}
	}
	return false;
};

AdvOps.getDescendants = async function (root, aParent, descendants) {
	let directChildren = await AdvOps.getChildren(aParent);
	let clearedDirectChildren = [];
	for (let i = 0; i < directChildren.length; i++) {
		//保证返回的 descendants 集合中不包含重复项
		if (
			AdvOps.existsInGroup(descendants, directChildren[i]) === false &&
			root.attr('id') !== directChildren[i].attr('id')
		) {
			clearedDirectChildren.push(directChildren[i]);
			descendants.push(directChildren[i]);
		}
	}

	for (let i = 0; i < clearedDirectChildren.length; i++) {
		await AdvOps.getDescendants(root, clearedDirectChildren[i], descendants);
	}
};

AdvOps.collapseDescendants = async function (jqNode) {
	let descendants = [];
	await AdvOps.getDescendants(jqNode, jqNode, descendants);
	for (let i = 0; i < descendants.length; i++) {
		descendants[i].addClass('nodisplay');
		await AdvOps.hideConnection(descendants[i]);
	}
	await AdvOps.hideConnection(jqNode);
};

/**
 * Expand (show) all descendants of a node
 *
 * jqNode - the node whose descendants to expand
 * ALOE - true|false, Auto Layout On Expand
 */
AdvOps.expandDescendants = async function (jqNode) {
	let descendants = [];
	await AdvOps.getDescendants(jqNode, jqNode, descendants);
	for (let i = 0; i < descendants.length; i++) {
		descendants[i].removeClass('nodisplay');
		descendants[i].find('.ec_button').removeClass('ec_collapsed').addClass('ec_expanded');
		await AdvOps.showConnection(descendants[i]);
	}
	await AdvOps.showConnection(jqNode);
};

/**
 * 遍历脑图树, 设置每个节点与其父节点的映射关系，并计算得到
 * 每个节点的占用高度
 * *
 *  jqNode - 从这个节点开始遍历
 */
AdvOps.traverseTree = async function (jqNode, rootId) {
	let myId = jqNode.attr('id');
	AdvOps.traverseLog.add(myId);
	let children = await AdvOps.getChildren(jqNode);
	let realChildrenNumber = 0;
	for (let i = 0; i < children.length; i++) {
		if (AdvOps.traverseLog.has(children[i].attr('id')) === false) {
			realChildrenNumber++;
		}
	}
	if (children.length > 0) {
		//如果当前节点有子节点
		//设置其高度为0，其高度通过其descendants的高度累加而来
		AdvOps.spaceMap.set(myId, 0);
		//通过循环，设置其每个子节点到当前节点的 子-> 父 映射关系
		for (let i = 0; i < children.length; i++) {
			let childId = children[i].attr('id');
			if (AdvOps.treeMap.has(childId) === false && AdvOps.traverseLog.has(childId) === false) {
				//第一个父节点为真正父节点，其它为参考父节点
				//设置从节点到其父节点的映射
				AdvOps.treeMap.set(childId, myId);
			}
			if (AdvOps.traverseLog.has(childId) === false) await AdvOps.traverseTree(children[i]);
		}
	}

	if (realChildrenNumber === 0) {
		//如果这是一个叶节点
		let myHeight = KFK.divHeight(jqNode);
		//记录当前节点的高度
		AdvOps.spaceMap.set(myId, myHeight);
		//把当前节点的高度添加到其父节点、祖父节点。。上
		await AdvOps.reverseAddSpace(rootId, myId, myHeight);
	}
};

KFK.text = function (jq) {
	return jq.find('.innerobj').text();
};

/**
 * 把节点的占用高度添加到其父节点，祖父节点。。。的占用高度上
 *
 * myId - 当前节点的ID
 * myHeight - 我的高度
 */
AdvOps.reverseAddSpace = async function (rootId, myId, myHeight) {
	if (AdvOps.treeMap.has(myId)) {
		let parentId = AdvOps.treeMap.get(myId);
		let tmp1 = AdvOps.spaceMap.get(parentId);
		if (tmp1 == 0) {
			tmp1 += myHeight;
		} else {
			tmp1 += KFK.VSpace + myHeight; //If this is not the first descendant, add one VSpace beforehead;
		}
		AdvOps.spaceMap.set(parentId, tmp1);
		await AdvOps.reverseAddSpace(rootId, parentId, myHeight);
	}
};

/**
 * 自动放置每个子节点的位置
 *
 */
AdvOps.placeChildrenAuto = async function (
	jqNode,
	nodeSpace,
	whichSide,
	children,
	childIndexStart,
	childIndexEnd
) {
	let myId = jqNode.attr('id');
	if (AdvOps.autoPlaced.has(myId)) return;
	AdvOps.autoPlaced.add(myId);
	let tmp = KFK.divTop(jqNode) + KFK.divHeight(jqNode) * 0.5 - nodeSpace * 0.5;
	jqNode.removeClass('nodisplay');
	jqNode.find('.ec_button').removeClass('ec_collapsed').addClass('ec_expanded');
	await AdvOps.showConnection(jqNode);
	for (let i = childIndexStart; i < childIndexEnd; i++) {
		let childId = children[i].attr('id');
		if (AdvOps.autoPlaced.has(childId)) continue;
		let childSpace = AdvOps.spaceMap.get(childId);
		let childLeft = KFK.divLeft(jqNode) + KFK.divWidth(jqNode) + KFK.HSpace;
		if (whichSide === AdvOps.LEFT_SIDE) {
			childLeft = KFK.divLeft(jqNode) - KFK.HSpace - KFK.divWidth(children[i]);
		}
		let childTop = tmp + childSpace * 0.5 - KFK.divHeight(children[i]) * 0.5;
		if (childLeft !== KFK.divLeft(children[i]) || childTop !== KFK.divTop(children[i])) {
			children[i].css('left', childLeft);
			children[i].css('top', childTop);
			AdvOps.allRelayouted.add(childId);
		}
		let subChildren = await AdvOps.getChildren(children[i]);
		await AdvOps.placeChildrenAuto(
			children[i],
			childSpace,
			whichSide,
			subChildren,
			0,
			subChildren.length
		);
		tmp = tmp + childSpace + KFK.VSpace;
	}
	KFK.redrawLinkLines(jqNode);
};

AdvOps.buildGlobalTreeMap = async function () {
	AdvOps.globalTreeMap.clear();
	AdvOps.globalNodeMap.clear();
	let tmp = new Set();
	KFK.JC3.find('.kfknode').each((index, aNode) => {
		let jqNode = $(aNode);
		let jqNodeId = jqNode.attr('id');
		AdvOps.globalNodeMap.set(jqNodeId, jqNode);
		let arr = KFK.stringToArray(jqNode.attr('linkto'));
		for (let i = 0; i < arr.length; i++) {
			if (AdvOps.globalTreeMap.has(arr[i]) === false && tmp.has(arr[i]) === false) {
				AdvOps.globalTreeMap.set(arr[i], jqNodeId);
				tmp.add(jqNodeId);
				//如果存在，就不再设置，意味着，第一次设置的父为其真父
			}
		}
	});
};

AdvOps.getRootId = function (nodeId) {
	if (AdvOps.globalTreeMap.has(nodeId)) {
		return AdvOps.getRootId(AdvOps.globalTreeMap.get(nodeId));
	} else {
		return nodeId;
	}
};

/**
 * 自动布局所有下属节点
 *
 * jqNode - 该节点的下属节点要被自动布局
 * rootId - jqNode所在的数的根节点，可能是jqNode自身，也可能是jqNode的祖先节点
 * rebuildGlobalTreeMap - 是否重建全局节点-父节点映射表。画板没有变化时，全局映射表只需要建立一次，不需要多次建立，因为每一次构建都需要扫描所有节点，是一个浪费时间的计算过程。同时，意味着，在调用本方法时，至少需要构建一次GTM，要么在调用本方法之前，预先调用AdvOps.buildGlobalTreeMap一次，要么在第一次调用本方法时，本参数为true
 */
AdvOps.autoLayoutDescendants = async function (
	jqNode,
	rootId = 'UNSET',
	rebuildGlobalTreeMap = true
) {
	AdvOps.treeMap.clear();
	AdvOps.spaceMap.clear();
	AdvOps.allRelayouted.clear();
	AdvOps.autoPlaced = new Set();
	let myId = jqNode.attr('id');
	if (rebuildGlobalTreeMap) await AdvOps.buildGlobalTreeMap();

	rootId = rootId === 'UNSET' ? AdvOps.getRootId(myId) : rootId;
	let jqRoot = AdvOps.globalNodeMap.get(rootId);
	AdvOps.traverseLog = new Set();
	await AdvOps.traverseTree(jqNode, rootId);
	let children = await AdvOps.getChildren(jqNode);
	//如果当前节点是一个根节点
	if (rootId === myId) {
		let leftSideChildrenSpace = 0;
		//累加要拿到左边去的节点的高度
		for (let i = Math.ceil(children.length / 2); i < children.length; i++) {
			leftSideChildrenSpace += AdvOps.spaceMap.get(children[i].attr('id'));
		}
		//算出右侧的所有节点的占高
		let rightSideChildrenSpace = AdvOps.spaceMap.get(myId) - leftSideChildrenSpace - KFK.VSpace;
		//放置右侧的节点
		await AdvOps.placeChildrenAuto(
			jqNode,
			rightSideChildrenSpace,
			AdvOps.RIGHT_SIDE,
			children,
			0,
			Math.ceil(children.length / 2)
		);
		//放置左侧的节点
		AdvOps.autoPlaced.clear();
		if (children.length > Math.ceil(children.length / 2)) {
			await AdvOps.placeChildrenAuto(
				jqNode,
				leftSideChildrenSpace,
				AdvOps.LEFT_SIDE,
				children,
				Math.ceil(children.length / 2),
				children.length
			);
		}
	} else {
		//如果当前节点不是一个子节点,
		//那么,它要么位于当前节点的根节点的右侧,要么位于左侧
		if (KFK.divCenter(jqNode) >= KFK.divCenter(jqRoot)) {
			//如果在右侧
			AdvOps.autoPlaced.clear();
			await AdvOps.placeChildrenAuto(
				jqNode,
				AdvOps.spaceMap.get(myId),
				AdvOps.RIGHT_SIDE,
				children,
				0,
				children.length
			);
		} else {
			//如果在左侧
			AdvOps.autoPlaced.clear();
			await AdvOps.placeChildrenAuto(
				jqNode,
				AdvOps.spaceMap.get(myId),
				AdvOps.LEFT_SIDE,
				children,
				0,
				children.length
			);
		}
	}
	if (AdvOps.allRelayouted.size > 0) {
		KFK.startTrx();
		try {
			for (let divId of AdvOps.allRelayouted.keys()) {
				let jqTmp = KFK.getNodeById(divId);
				await KFK.syncNodePut('U', jqTmp.clone(), 'auto layout', jqTmp.clone(), false);
			}
		} finally {
			KFK.endTrx();
		}
	}
};

AdvOps.autoLayoutOnNewNode = async function (newNode, parentNode) {
	let myId = newNode.attr('id');
	let parentId = parentNode.attr('id');
	if (AdvOps.globalTreeMap.size < 1) {
		await AdvOps.buildGlobalTreeMap();
	} else if (AdvOps.globalTreeMap.has(newNode) === false) {
		AdvOps.globalTreeMap.set(myId, parentId);
	}
	let rootId = AdvOps.getRootId(myId);
	let rootNode = KFK.getNodeById(rootId);
	await AdvOps.autoLayoutDescendants(rootNode, rootId, false);
};

/**
 * Hide connections from a node
 *
 * jqFrom - a node from which the connections to be hiddden
 */
AdvOps.hideConnection = async function (jqFrom) {
	await AdvOps.toggleConnectionVisibility(jqFrom, false);
};

/**
 * Show connections from a node
 *
 * jqFrom - a node from which the connections to be shown
 */
AdvOps.showConnection = async function (jqFrom) {
	await AdvOps.toggleConnectionVisibility(jqFrom, true);
};

/**
 * Toggle visibility of connections from a node
 *
 * jqFrom - a node from which the visibility of the connections to be toggled
 */
AdvOps.toggleConnectionVisibility = async function (jqFrom, visible) {
	let myId = jqFrom.attr('id');
	let toIds = KFK.stringToArray(jqFrom.attr('linkto'));
	toIds.forEach((toId) => {
		let lineClassSelector = `.connect_${myId}_${toId}`;
		let triClassSelector = `.connect_${myId}_${toId}_triangle`;
		try {
			if (visible) KFK.svgDraw.findOne(lineClassSelector).removeClass('nodisplay');
			else KFK.svgDraw.findOne(lineClassSelector).addClass('nodisplay');
		} catch (err) {
		} finally {
		}
		try {
			if (visible) KFK.svgDraw.findOne(triClassSelector).removeClass('nodisplay');
			else KFK.svgDraw.findOne(triClassSelector).addClass('nodisplay');
		} catch (err) {
		} finally {
		}
	});
};
