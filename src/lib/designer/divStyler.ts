export const DivStyler = {};
DivStyler.styleCache = {};
import KFK from './KFK';

DivStyler.NodeOuterStyleNames = [
	'background-color',
	'border',
	'border-width',
	'border-style',
	'border-radius'
];
DivStyler.NodeInnerStyleNames = [
	'font-size',
	'color',
	'justify-content',
	'align-items',
	'text-align-last',
	'text-align',
	'font-family',
	'font-weight',
	'font-style'
];
DivStyler.copyStyle = function () {
	let div = KFK.getHoverFocusLastCreate();
	if (!div) return;
	let innerDiv = div.find('.innerobj');
	DivStyler.styleCache.nodetype = div.attr('nodetype');
	DivStyler.styleCache.nodeid = div.attr('id');
	DivStyler.styleCache.outerStyle = DivStyler.NodeOuterStyleNames.map((cssName) => {
		return div.css(cssName);
	});
	DivStyler.styleCache.innerStyle = DivStyler.NodeInnerStyleNames.map((cssName) => {
		return innerDiv.css(cssName);
	});
};

DivStyler.pasteStyle = async function () {
	if (!DivStyler.styleCache.nodetype) return;
	try {
		await KFK.updateSelectedDIVs('paste style', async function (div) {
			let innerDiv = div.find('.innerobj');
			let myNodeType = div.attr('nodetype');
			if (myNodeType === DivStyler.styleCache.nodetype) {
				for (let i = 0; i < DivStyler.NodeOuterStyleNames.length; i++) {
					if (DivStyler.styleCache.outerStyle[i]) {
						div.css(DivStyler.NodeOuterStyleNames[i], DivStyler.styleCache.outerStyle[i]);
					}
				}
			}
			for (let i = 0; i < DivStyler.NodeInnerStyleNames.length; i++) {
				if (DivStyler.styleCache.innerStyle[i]) {
					innerDiv.css(DivStyler.NodeInnerStyleNames[i], DivStyler.styleCache.innerStyle[i]);
				}
			}
		});
	} catch (error) {
		console.error(error);
	}
};

DivStyler.fontSmaller = async function () {
	try {
		await KFK.updateSelectedDIVs('font smaller', async function (div) {
			let innerDiv = div.find('.innerobj');
			let fontSize = innerDiv.css('font-size');
			if (!fontSize) fontSize = '18px';
			fontSize = KFK.unpx(fontSize);
			let newFontSize = fontSize - 1;
			newFontSize = newFontSize < 8 ? 8 : newFontSize;
			innerDiv.css('font-size', newFontSize);
		});
	} catch (error) {
		console.error(error);
	}
};
DivStyler.fontBigger = async function () {
	try {
		await KFK.updateSelectedDIVs('font smaller', async function (div) {
			let innerDiv = div.find('.innerobj');
			let fontSize = innerDiv.css('font-size');
			if (!fontSize) fontSize = '18px';
			fontSize = KFK.unpx(fontSize);
			let newFontSize = fontSize + 1;
			newFontSize = newFontSize > 100 ? 100 : newFontSize;
			innerDiv.css('font-size', newFontSize);
		});
	} catch (error) {
		console.error(error);
	}
};
DivStyler.vertSizeSmaller = async function (delta) {
	try {
		let divNum = await KFK.updateSelectedDIVs('set border width', async function (div) {
			let nodeType = div.attr('nodetype');
			let tmpTop = KFK.divTop(div);
			let tmpHeight = KFK.divHeight(div);
			tmpTop = tmpTop + delta;
			tmpHeight = tmpHeight - delta * 2;
			let minH = 20;
			if (KFK.config.node[nodeType].minHeight) {
				minH = KFK.config.node[nodeType].minHeight;
			}
			if (tmpHeight >= minH) {
				div.css('top', tmpTop);
				div.css('height', tmpHeight);
				KFK.redrawLinkLines(div, 'resize', 'both');
			}
		});
		if (divNum === 0) {
			let shape = KFK.hoverSvgLine();
			shape && (KFK.morphedShape = shape);
			KFK.morphedShape && DivStyler.resizeShape(KFK.morphedShape, 'vertSizeSmaller', delta);
		}
	} catch (error) {
		console.error(error);
	}
};

DivStyler.horiSizeBigger = async function (delta) {
	try {
		let divNum = await KFK.updateSelectedDIVs('set border width', async function (div) {
			let tmpLeft = KFK.divLeft(div);
			let tmpWidth = KFK.divWidth(div);
			tmpLeft = tmpLeft - delta;
			tmpWidth = tmpWidth + delta * 2;
			div.css('left', tmpLeft);
			div.css('width', tmpWidth);
			KFK.redrawLinkLines(div, 'resize', 'both');
		});
		if (divNum === 0) {
			let shape = KFK.hoverSvgLine();
			shape && (KFK.morphedShape = shape);
			KFK.morphedShape && DivStyler.resizeShape(KFK.morphedShape, 'horiSizeBigger', delta);
		}
	} catch (error) {
		console.error(error);
	}
};
DivStyler.horiSizeSmaller = async function (delta) {
	try {
		let divNum = await KFK.updateSelectedDIVs('set border width', async function (div) {
			let nodeType = div.attr('nodetype');
			let tmpLeft = KFK.divLeft(div);
			let tmpWidth = KFK.divWidth(div);
			tmpLeft = tmpLeft + delta;
			tmpWidth = tmpWidth - delta * 2;
			let minW = 20;
			if (KFK.config.node[nodeType].minWidth) {
				minW = KFK.config.node[nodeType].minWidth;
			}
			if (tmpWidth >= minW) {
				div.css('left', tmpLeft);
				div.css('width', tmpWidth);
				KFK.redrawLinkLines(div, 'resize', 'both');
			}
		});
		if (divNum === 0) {
			let shape = KFK.hoverSvgLine();
			shape && (KFK.morphedShape = shape);
			KFK.morphedShape && DivStyler.resizeShape(KFK.morphedShape, 'horiSizeSmaller', delta);
		}
	} catch (error) {
		console.error(error);
	}
};
DivStyler.vertSizeBigger = async function (delta) {
	try {
		let divNum = await KFK.updateSelectedDIVs('set border width', async function (div) {
			let tmpTop = KFK.divTop(div);
			let tmpHeight = KFK.divHeight(div);
			tmpTop = tmpTop - delta;
			tmpHeight = tmpHeight + delta * 2;
			div.css('top', tmpTop);
			div.css('height', tmpHeight);
			KFK.redrawLinkLines(div, 'resize', 'both');
		});
		if (divNum === 0) {
			let shape = KFK.hoverSvgLine();
			shape && (KFK.morphedShape = shape);
			KFK.morphedShape && DivStyler.resizeShape(KFK.morphedShape, 'vertSizeBigger', delta);
		}
	} catch (error) {
		console.error(error);
	}
};
DivStyler.moveDivByArrowKey = async function (keyCode, ctrlKey) {
	let refDiv = KFK.getHoverFocusLastCreate();
	refDiv && (KFK.divStylerRefDiv = refDiv);
	if (KFK.divStylerRefDiv) {
		let divNum = await KFK.updateSelectedDIVs('move by keyboard', async function (div) {
			let tmpTop = KFK.divTop(div);
			let tmpLeft = KFK.divLeft(div);
			let newTop = tmpTop;
			let newLeft = tmpLeft;
			let horiDelta = 20;
			let vertDelta = 20;
			if (ctrlKey) {
				// use refDiv's width and top
				horiDelta = KFK.divWidth(KFK.divStylerRefDiv);
				vertDelta = KFK.divHeight(KFK.divStylerRefDiv);
			}
			switch (keyCode) {
				case 37:
					newLeft = tmpLeft - horiDelta;
					break;
				case 39:
					newLeft = tmpLeft + horiDelta;
					break;
				case 38:
					newTop = tmpTop - vertDelta;
					break;
				case 40:
					newTop = tmpTop + vertDelta;
					break;
			}
			div.css('top', newTop);
			div.css('left', newLeft);
			KFK.redrawLinkLines(div, 'move', 'both');
		});
	} else {
		let shape = KFK.hoverSvgLine();
		shape && (KFK.morphedShape = shape);
		if (KFK.morphedShape) {
			let horiDelta = 20;
			let vertDelta = 20;
			if (ctrlKey) {
				horiDelta = 60;
				vertDelta = 60;
			}
			switch (keyCode) {
				case 37:
					horiDelta = -horiDelta;
					vertDelta = 0;
					break;
				case 39:
					vertDelta = 0;
					break;
				case 38:
					vertDelta = -vertDelta;
					horiDelta = 0;
					break;
				case 40:
					horiDelta = 0;
					break;
			}
			KFK.morphedShape.dmove(horiDelta, vertDelta);
		}
		return;
	}
};

DivStyler.moveDivByDelta = async function (div, deltaX, deltaY) {
	await DivStyler.moveDivTo(div, KFK.divLeft(div) + deltaX, KFK.divTop(div) + deltaY);
};
DivStyler.moveDivTo = async function (div, toX, toY) {
	div.css('left', toX);
	div.css('top', toY);
};
DivStyler.snapToGrid = function (jq) {
	let tmpLeft = KFK.divLeft(jq);
	let tmpTop = KFK.divTop(jq);
	let newLeft = tmpLeft;
	let newTop = tmpTop;
	if (tmpLeft % KFK.APP.model.gridWidth < KFK.APP.model.gridWidth * 0.5) {
		newLeft = Math.floor(tmpLeft / KFK.APP.model.gridWidth) * KFK.APP.model.gridWidth;
	} else {
		newLeft = (Math.floor(tmpLeft / KFK.APP.model.gridWidth) + 1) * KFK.APP.model.gridWidth;
	}
	if (tmpTop % KFK.APP.model.gridWidth < KFK.APP.model.gridWidth * 0.5) {
		newTop = Math.floor(tmpTop / KFK.APP.model.gridWidth) * KFK.APP.model.gridWidth;
	} else {
		newTop = (Math.floor(tmpTop / KFK.APP.model.gridWidth) + 1) * KFK.APP.model.gridWidth;
	}
	return { x: newLeft, y: newTop };
};

DivStyler.zoom = async function (direction, shapeToZoom, delta) {
	try {
		DivStyler.zoomShape(shapeToZoom, direction, delta);
	} catch (error) {
		console.error(error);
	}
};
DivStyler.zoomShape = async function (shape, direction, delta) {
	// let cpt = { x: shape.cx(), y: shape.cy() };
	// let rect = { w: shape.width(), h: shape.height() };
	// rect.w += delta;
	// rect.h += delta;
	let tmpw = KFK.shapeSizeOrigin.w + delta;
	let tmph = KFK.shapeSizeOrigin.h + delta;
	tmpw = tmpw < 10 ? 10 : tmpw;
	tmph = tmph < 10 ? 10 : tmph;
	shape.size(tmpw, tmph);
	shape.center(KFK.shapeSizeCenter.x, KFK.shapeSizeCenter.y);
};
/**
 * 对shape边框进行横向和纵向扩展
 */
DivStyler.resizeShape = async function (shape, direction, delta) {
	let sType = DivStyler.shapeType(shape);
	let smallIndex = -1;
	let bigIndex = -1;
	if (sType === 'line') {
		let arr = shape.array();
		let rect = {
			l: Math.min(arr[0][0], arr[1][0]),
			t: Math.min(arr[0][1], arr[1][1]),
			r: Math.max(arr[0][0], arr[1][0]),
			b: Math.max(arr[0][1], arr[1][1])
		};

		switch (direction) {
			case 'vertSizeBigger':
				if (arr[0][1] == rect.b) {
					smallIndex = 1;
					bigIndex = 0;
				} else {
					smallIndex = 0;
					bigIndex = 1;
				}
				arr[smallIndex][1] -= delta;
				arr[bigIndex][1] += delta;
				break;
			case 'vertSizeSmaller':
				if (arr[0][1] == rect.b) {
					smallIndex = 1;
					bigIndex = 0;
				} else {
					smallIndex = 0;
					bigIndex = 1;
				}
				arr[smallIndex][1] += delta;
				arr[bigIndex][1] -= delta;
				break;
			case 'horiSizeBigger':
				if (arr[0][0] == rect.r) {
					smallIndex = 1;
					bigIndex = 0;
				} else {
					smallIndex = 0;
					bigIndex = 1;
				}
				arr[smallIndex][0] -= delta;
				arr[bigIndex][0] += delta;
				break;
			case 'horiSizeSmaller':
				if (arr[0][0] == rect.r) {
					smallIndex = 1;
					bigIndex = 0;
				} else {
					smallIndex = 0;
					bigIndex = 1;
				}
				arr[smallIndex][0] += delta;
				arr[bigIndex][0] -= delta;
				break;
		}
		shape.plot(arr);
	} else if (
		sType === 'rectangle' ||
		sType === 'ellipse' ||
		sType === 'polygon' ||
		sType === 'polyline' ||
		sType === 'freehand'
	) {
		let cpt = {
			x: shape.cx(),
			y: shape.cy()
		};
		let rect = {
			w: shape.width(),
			h: shape.height()
		};
		switch (direction) {
			case 'vertSizeBigger':
				rect.h += 2 * delta;
				break;
			case 'vertSizeSmaller':
				rect.h -= 2 * delta;
				rect.h = rect.h < 10 ? 10 : rect.h;
				break;
			case 'horiSizeBigger':
				rect.w += 2 * delta;
				break;
			case 'horiSizeSmaller':
				rect.w -= 2 * delta;
				rect.w = rect.w < 10 ? 10 : rect.w;
				break;
		}
		shape.size(rect.w, rect.h);
		shape.center(cpt.x, cpt.y);
	}
};
DivStyler.shapeType = function (shape) {
	let ret = 'line';
	if (shape.hasClass('kfkline')) {
		ret = 'line';
	} else if (shape.hasClass('kfkrectangle')) {
		ret = 'rectangle';
	} else if (shape.hasClass('kfkellipse')) {
		ret = 'ellipse';
	} else if (shape.hasClass('kfkpolyline')) {
		ret = 'polyline';
	} else if (shape.hasClass('kfkpolygon')) {
		ret = 'polygon';
	} else if (shape.hasClass('kfkfreehand')) {
		ret = 'freehand';
	}
	return ret;
};
DivStyler.alignInnerContent = async function (keyCode) {
	let divNum = await KFK.updateSelectedDIVs('set border width', async function (div) {
		let divInner = div.find('.innerobj');
		switch (keyCode) {
			case 66: // key B
				let fst = divInner.css('font-weight');
				if (fst === '700') divInner.css('font-weight', '400');
				else divInner.css('font-weight', '700');
				break;
			case 73: //key I
				if (divInner.css('font-style') === 'italic') divInner.css('font-style', '');
				else divInner.css('font-style', 'italic');
				break;
			case 69: // key E
				divInner.css('justify-content', 'center');
				divInner.css('text-align', 'center');
				divInner.css('text-align-last', 'center');
				break;
			case 76: // key L
				divInner.css('justify-content', 'flex-start');
				divInner.css('text-align', 'left');
				divInner.css('text-align-last', 'left');
				break;
			case 82: // key R
				divInner.css('justify-content', 'flex-end');
				divInner.css('text-align', 'right');
				divInner.css('text-align-last', 'right');
				break;
		}
	});
};

DivStyler.arrangeNodes = async function (direction) {
	if (KFK.selectedDIVs.length < 2) return;
	let hasOneLocked = false;
	KFK.selectedDIVs.forEach((aJQ) => {
		if (KFK.anyLocked(aJQ)) {
			hasOneLocked = true;
		}
	});
	// if (hasOneLocked) return;
	let numberOfNotLocked = 0;
	KFK.startTrx();
	try {
		let jqs = [];
		let propString = [];
		switch (direction) {
			case 'left':
				let left = KFK.divLeft(KFK.selectedDIVs[0]);
				for (let i = 0; i < KFK.selectedDIVs.length; i++) {
					let tmp_left = KFK.divLeft(KFK.selectedDIVs[i]);
					left = tmp_left < left ? tmp_left : left;
				}

				for (let i = 0; i < KFK.selectedDIVs.length; i++) {
					let jqDIV = $(KFK.selectedDIVs[i]);
					let jqOld = jqDIV.clone();
					if (KFK.anyLocked(jqDIV) === false) {
						jqDIV.css('left', left);
						jqs.push({ from: jqOld, to: jqDIV });
						propString = ['left'];
					}
				}
				break;
			case 'center':
				let centerX = KFK.divLeft(KFK.selectedDIVs[0]) + KFK.divWidth(KFK.selectedDIVs[0]) * 0.5;
				for (let i = 0; i < KFK.selectedDIVs.length; i++) {
					let jqDIV = $(KFK.selectedDIVs[i]);
					let jqOld = jqDIV.clone();
					if (KFK.anyLocked(jqDIV) === false) {
						jqDIV.css('left', centerX - KFK.divWidth(KFK.selectedDIVs[i]) * 0.5);
						jqs.push({ from: jqOld, to: jqDIV });
						propString = ['left'];
					}
				}
				break;
			case 'right':
				let right = KFK.divRight(KFK.selectedDIVs[0]);
				KFK.selectedDIVs.forEach((aNode) => {
					let tmp_right = KFK.divRight(aNode);
					right = tmp_right > right ? tmp_right : right;
				});
				for (let i = 0; i < KFK.selectedDIVs.length; i++) {
					let jqDIV = KFK.selectedDIVs[i];
					let jqOld = jqDIV.clone();
					if (KFK.anyLocked(jqDIV) === false) {
						jqDIV.css('left', right - KFK.divWidth(KFK.selectedDIVs[i]));
						jqs.push({ from: jqOld, to: jqDIV });
						propString = ['left'];
					}
				}
				break;
			case 'top':
				let top = KFK.divTop(KFK.selectedDIVs[0]);
				KFK.selectedDIVs.forEach((aNode) => {
					let tmp_top = KFK.divTop(aNode);
					top = tmp_top < top ? tmp_top : top;
				});
				for (let i = 0; i < KFK.selectedDIVs.length; i++) {
					let jqDIV = KFK.selectedDIVs[i];
					let jqOld = jqDIV.clone();
					if (KFK.anyLocked(jqDIV) === false) {
						jqDIV.css('top', top);
						jqs.push({ from: jqOld, to: jqDIV });
						propString = ['top'];
					}
				}
				break;
			case 'middle':
				let centerY = KFK.divTop(KFK.selectedDIVs[0]) + KFK.divHeight(KFK.selectedDIVs[0]) * 0.5;

				for (let i = 0; i < KFK.selectedDIVs.length; i++) {
					let jqDIV = KFK.selectedDIVs[i];
					let jqOld = jqDIV.clone();
					if (KFK.anyLocked(jqDIV) === false) {
						jqDIV.css('top', centerY - KFK.divHeight(KFK.selectedDIVs[i]) * 0.5);
						jqs.push({ from: jqOld, to: jqDIV });
						propString = ['top'];
					}
				}
				break;
			case 'bottom':
				let bottom = KFK.divBottom(KFK.selectedDIVs[0]);
				KFK.selectedDIVs.forEach((aNode) => {
					let tmp_bottom = KFK.divBottom(aNode);
					bottom = tmp_bottom > bottom ? tmp_bottom : bottom;
				});

				for (let i = 0; i < KFK.selectedDIVs.length; i++) {
					let jqDIV = KFK.selectedDIVs[i];
					let jqOld = jqDIV.clone();
					if (KFK.anyLocked(jqDIV) === false) {
						jqDIV.css('top', bottom - KFK.divHeight(KFK.selectedDIVs[i]));
						jqs.push({ from: jqOld, to: jqDIV });
						propString = ['top'];
					}
				}
				break;
			case 'hori':
				let nodeLeftMost = KFK.selectedDIVs[0];
				let totalWidth = 0;
				let leftMost = KFK.divLeft(KFK.selectedDIVs[0]);
				//找到最左边的node及其left位置， leftMost
				KFK.selectedDIVs.forEach((aNode) => {
					totalWidth += KFK.divWidth(aNode);
					let tmp_left = KFK.divLeft(aNode);
					if (tmp_left < leftMost) {
						nodeLeftMost = aNode;
						leftMost = tmp_left;
					}
				});
				//找到最右边的node及其右侧边位置， rightMost
				let nodeAtRightMost = KFK.selectedDIVs[0];
				let rightMost = KFK.divRight(KFK.selectedDIVs[0]);
				KFK.selectedDIVs.forEach((aNode) => {
					let tmp_right = KFK.divRight(aNode);
					if (tmp_right > rightMost) {
						nodeAtRightMost = aNode;
						rightMost = tmp_right;
					}
				});
				//计算中间的space
				let availableWidth = rightMost - leftMost;
				let space_hori = (availableWidth - totalWidth) / (KFK.selectedDIVs.length - 1);
				let tmpHoriArr = [];
				KFK.selectedDIVs.forEach((aNode) => {
					tmpHoriArr.push(aNode);
				});
				//最左边一个不移动
				tmpHoriArr.splice(tmpHoriArr.indexOf(nodeLeftMost), 1);
				//把除nodeLeftMos之外节点的中间X放入数组
				let centerArr = tmpHoriArr.map((aNode) => {
					return KFK.divCenter(aNode);
				});
				let posX = KFK.divRight(nodeLeftMost);
				while (centerArr.length > 0) {
					//找到剩余Node中最靠右边的一个
					let min = Math.min.apply(null, centerArr);
					let index = centerArr.indexOf(min);
					let newLeft = posX + space_hori;
					let jqDIV = tmpHoriArr[index];
					let jqOld = jqDIV.clone();
					if (KFK.anyLocked(jqDIV) === false) {
						//重设其位置
						jqDIV.css('left', newLeft);
						jqs.push({ from: jqOld, to: jqDIV });
						propString = ['left'];
					}

					//为下一个节点准备基准点
					posX = newLeft + KFK.divWidth(tmpHoriArr[index]);
					centerArr.splice(index, 1);
					tmpHoriArr.splice(index, 1);
				}
				break;
			case 'vert':
				let nodeTopMost = KFK.selectedDIVs[0];
				let totalHeight = 0;
				let topMost = KFK.divTop(KFK.selectedDIVs[0]);
				KFK.selectedDIVs.forEach((aNode) => {
					totalHeight += KFK.divHeight(aNode);
					let tmp_top = KFK.divTop(aNode);
					if (tmp_top < topMost) {
						nodeTopMost = aNode;
						topMost = tmp_top;
					}
				});
				let nodeAtBottomMost = KFK.selectedDIVs[0];
				let bottomMost = KFK.divBottom(KFK.selectedDIVs[0]);
				KFK.selectedDIVs.forEach((aNode) => {
					let tmp_bottom = KFK.divBottom(aNode);
					if (tmp_bottom > bottomMost) {
						nodeAtBottomMost = aNode;
						bottomMost = tmp_bottom;
					}
				});
				let availableHeight = bottomMost - topMost;
				let space_vert = (availableHeight - totalHeight) / (KFK.selectedDIVs.length - 1);
				let tmpVertArr = [];
				KFK.selectedDIVs.forEach((aNode) => {
					tmpVertArr.push(aNode);
				});
				//最上面一个不移动
				tmpVertArr.splice(tmpVertArr.indexOf(nodeTopMost), 1);
				let middleArr = tmpVertArr.map((aNode) => {
					return KFK.divMiddle(aNode);
				});
				let posY = KFK.divBottom(nodeTopMost);
				while (middleArr.length > 0) {
					let min = Math.min.apply(null, middleArr);
					let index = middleArr.indexOf(min);
					let newTop = posY + space_vert;
					let jqDIV = tmpVertArr[index];
					let jqOld = jqDIV.clone();
					if (KFK.anyLocked(jqDIV) === false) {
						jqDIV.css('top', newTop);
						jqs.push({ from: jqOld, to: jqDIV });
						propString = ['top'];
					}
					posY = newTop + KFK.divHeight(tmpVertArr[index]);
					middleArr.splice(index, 1);
					tmpVertArr.splice(index, 1);
				}
				break;
			case 'samewidth':
				let theWidth = KFK.divWidth(KFK.selectedDIVs[0]);
				for (let i = 1; i < KFK.selectedDIVs.length; i++) {
					let jqDIV = KFK.selectedDIVs[i];
					let jqOld = jqDIV.clone();
					if (KFK.anyLocked(jqDIV) === false) {
						jqDIV.css('width', theWidth);
						jqs.push({ from: jqOld, to: jqDIV });
						propString = ['width'];
					}
				}
				break;
			case 'sameheight':
				let theHeight = KFK.divHeight(KFK.selectedDIVs[0]);
				for (let i = 1; i < KFK.selectedDIVs.length; i++) {
					let jqDIV = KFK.selectedDIVs[i];
					let jqOld = jqDIV.clone();
					if (KFK.anyLocked(jqDIV) === false) {
						jqDIV.css('height', theHeight);
						jqs.push({ from: jqOld, to: jqDIV });
						propString = ['height'];
					}
				}
				break;
			default:
				break;
		}
		KFK.setSelectedNodesBoundingRect();
		KFK.selectedDIVs.forEach((aNode) => {
			KFK.redrawLinkLines(aNode, 'align', 'both');
		});

		await KFK.syncNodeProp(jqs, propString, 'algignment', KFK.CONST.THIS_IS_NOT_A_UNDOREDO);
	} finally {
		KFK.endTrx();
	}
};
