import url from "url";
import { SVG } from "@svgdotjs/svg.js";
import suuid from "short-uuid";
import jQuery from "jquery";
import lodash from "lodash";
import {gzip, gunzip} from "$lib/gzip";
import cocoConfig from "./cococonfig";


let $ = jQuery;
if(typeof window !== "undefined"){
  window.jQuery = jQuery;
  window.$ = jQuery;
}

Array.prototype.clear = function () {
  this.splice(0, this.length);
};
Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

const KFK = {};
KFK.APP={
  model:{
    cocodoc:{
      readonly: false,
    }
  }
};

const NotSet = function (val) {
  if (val === undefined || val === null) return true;
  else return false;
};
KFK.NotSet = NotSet;
const IsSet = function (val) {
  return !NotSet(val);
};
KFK.IsSet = IsSet;
const IsBlank = function (val) {
  if (val === undefined || val === null || val === "") return true;
  else return false;
};
const BlankToDefault = function (val, defaultValue) {
  if (IsBlank(val)) return defaultValue;
  else return val;
};
const NotBlank = function (val) {
  return !IsBlank(val);
};
const IsFalse = function (val) {
  if (val === undefined || val === null || val === false) return true;
  else return false;
};


KFK.version = "1.0";
KFK.inNoteEditor = false;
KFK.config = cocoConfig;
KFK.duringVideo = false;
KFK.HSpace = 80;
KFK.VSpace = 20;
KFK.hideNavbarTick = 0;
KFK.pct = 1; //Peers count;
KFK.mdNoteEditorEventListener = true;
KFK.typewriting = false;
KFK.column = "no";
KFK.accordion = {};
KFK.rtcUsers = {};
KFK.tmpBalls = [];
KFK.mdnotes = null;
KFK.mdnoteUpdateTimers = new Map();
KFK.noCopyPaste = false;
KFK.scaleRatio = 1;
KFK.currentPage = 0;
KFK.loadedProjectId = null;
KFK.keypool = "";
KFK.showStatus = {};
KFK.svgDraw = null; //画svg的画布
KFK.jumpStack = [];
KFK.duplicateBrNode = false;
KFK.presentMaskMode = false;
KFK.isFreeHandDrawing = false;
KFK.isShowingModal = false;
KFK.jumpStackPointer = -1;
KFK.wsTryTimesBeforeGiveup = 60;
KFK.toolboxMouseDown = false;
KFK.toolboxMouseDownOn = null;
KFK.isZoomingShape = false;
KFK.ctrlMouseToPan = false;
KFK.idRowMap = {};
KFK.dynamicSize = {};
KFK.idSwitchMap = {};
KFK.FROM_SERVER = true; //三个常量
KFK.FROM_CLIENT = false;
KFK.NO_SHIFT = false;
KFK.badgeTimers = {}; //用于存放用户badge显示间隔控制的timer，这样，不是每一个mousemove都要上传，在Timer内，只上传最后一次mouse位置
KFK.updateReceived = 0; //记录接收到的其他用户的改动次数，在startActiveLogWatcher中，使用这个数字来控制是否到服务器端去拉取更新列表
KFK.tempSvgLine = null; //这条线是在划线或者链接node时，那条随着鼠标移动的线
KFK.LOGLEVEL_NOTHING = 0;
KFK.LOGLEVEL_ERROR = 1;
KFK.LOGLEVEL_WARN = 2;
KFK.LOGLEVEL_INFO = 3;
KFK.LOGLEVEL_DEBUG = 4;
KFK.LOGLEVEL_DETAIL = 5;
KFK.LOGLEVEL_KEY = 6;
KFK.tplNode_width = 32;
KFK.tplNode_height = 32;
KFK.loglevel = KFK.LOGLEVEL_DETAIL; //控制log的等级, 级数越小，显示信息越少
//在designer页面输入logerror, logwarn, loginfo, lodebug...
KFK.designerConf = {
  scale: 1,
  left: 0,
  top: 0,
}; //用于在zoom控制计算中

KFK.state = {
  TRX_FLAG: 0,
};
KFK.CONST = {
  THIS_IS_A_UNDOREDO: true,
  THIS_IS_NOT_A_UNDOREDO: false,
  MAX_SHAPE_WIDTH: 6,
};
KFK.opArray = [];
KFK.opstack = []; //Operation Stack, 数组中记录操作记录，用于undo/redo
KFK.opstacklen = 20; //undo，redo记录次数
KFK.opz = -1; // opstack 当前记录指针
KFK.mouseTimer = null; //定时器用于控制鼠标移动上传的频次
KFK.lockTool = false;
KFK.C3 = null;
KFK.JC3 = null;
KFK.onC3 = false;
KFK.tapped = false;
KFK.inFullScreenMode = false;
KFK.inPresentingMode = false;
KFK.inOverviewMode = false;
KFK.controlButtonsOnly = false;
KFK.showRightTools = true;
KFK.zoomFactor = 0;
KFK.lineTransfomerDragging = false;
KFK.scaleBy = 1.01;
KFK.centerPos = {
  x: 0,
  y: 0,
};
KFK.centerPos = {
  x: 0,
  y: 0,
};
KFK.lastFocusOnJqNode = null;
KFK.justCreatedJqNode = null;
KFK.lastCreatedJqNode = null;
KFK.justCreatedShape = null;
KFK._jqhoverdiv = null;
KFK._svghoverline = null;
KFK.inited = false;
KFK.divInClipboard = undefined;
KFK.lineTemping = false;
KFK.ignoreClick = false;
KFK.scrollBugPatched = false;
KFK.actionLogToView = {
  editor: "",
  actionlog: [],
};
KFK.actionLogToViewIndex = 0;
KFK.explorerRefreshed = false;
KFK.numberOfNodeToCreate = 0;
KFK.numberOfNodeCreated = 0;
KFK.freeHandPoints = [];
KFK.freeHandDrawing = null;
KFK.firstShown = {
  right: false,
  chat: false,
};
KFK.badgeIdMap = {}
// A4
// KFK.PageWidth = 842;
// KFK.PageHeight = 595;
//上面是A4的真实大小,但因为网格线是20位单位,所以近似看下面两个值
KFK.PageWidth = 840 * 2;
KFK.PageHeight = 600 * 2;
KFK.PageNumberHori = 2;
KFK.PageNumberVert = 2;
KFK.LeftB = KFK.PageWidth;
KFK.TopB = KFK.PageHeight;
KFK._width = KFK.PageWidth * KFK.PageNumberHori;
KFK._height = KFK.PageHeight * KFK.PageNumberVert;
KFK.minimapMouseDown = false;

KFK.defaultNodeWidth = 40;
KFK.defaultNodeHeight = 40;
KFK.links = [];
KFK.tipLinks = [];
KFK.tips = [];
KFK.images = {};
KFK.avatars = {};
KFK.pickedNode = null;
KFK.pickedTip = null;
KFK.mode = "pointer";
KFK.isEditting = false;
KFK.resizing = false;
KFK.dragging = false;
KFK.shapeDragging = false;
KFK.afterDragging = false;
KFK.afterResizing = false;
KFK.linkPosNode = [];
KFK.jumpNodes = [];
KFK.drawPoints = [];
KFK.drawMode = "line";
KFK.tween = null;
KFK.KEYDOWN = {
  ctrl: false,
  shift: false,
  alt: false,
  meta: false,
};
KFK.originZIndex = 1;
KFK.lastActionLogJqDIV = null;

KFK.brainstormMode = true;
KFK.brNodeId = undefined;

KFK.JC1 = $("#C1");
KFK.C1 = el(KFK.JC1);
KFK.scrollContainer = $("#S1");
KFK.lockMode = false;
KFK.selectedDIVs = [];
KFK.selectedShapes = [];
KFK.kuangXuanMouseIsDown = false;
KFK.kuangXuanStartPoint = {
  x: 0,
  y: 0,
};
KFK.kuangXuanEndPoint = {
  x: 0,
  y: 0,
};
KFK.duringKuangXuan = false;

KFK.currentMousePos = {
  x: -1,
  y: -1,
};
KFK.JCBKG = $("#containerbkg");

KFK.urlMode = "";
KFK.shareCode = null;

KFK.fsElem = document.documentElement;

KFK.C3GotFocus = () => {
  KFK.onC3 = true;
};

KFK.C3Blur = () => {
  KFK.onC3 = false;
};

KFK.getScrollPos = function () {
  let sc = $("#S1");
  return {
    x: sc.scrollLeft(),
    y: sc.scrollTop(),
  };
};
KFK.codeToBase64 = function (code) {
  return Buffer.from(code).toString('base64');
};
KFK.base64ToCode = function (base64) {
  return Buffer.from(base64, 'base64').toString('utf-8');
};


//Following solution to prevetn scrolling after focus  cause a problem of juqery
//So, dont' use it but adapt getScrollPos then scrollToPos solution
//https://stackoverflow.com/questions/4963053/focus-to-input-without-scrolling
// element.focus({
//     preventScroll: true
//   });
KFK.focusOnC3 = () => {
  if (KFK.isEditting || KFK.resizing || KFK.dragging) return;
  if (KFK.JC3) {
    let pos = KFK.getScrollPos();
    KFK.JC3.attr("tabIndex", "0");
    KFK.JC3.focus();
    KFK.scrollToPos(pos);
  } else {
    KFK.warn("focusOnC3 failed. not exist");
  }
};

KFK.myuid = () => {
  return suuid.generate();
};
KFK.hoverJqDiv = function (jqdiv) {
  if (jqdiv !== undefined) {
    KFK._jqhoverdiv = jqdiv;
    if (jqdiv !== null) KFK.hoverSvgLine(null);
  } else {
    return KFK._jqhoverdiv;
  }
};
KFK.hoverSvgLine = function (svgline) {
  if (svgline !== undefined) {
    KFK._svghoverline = svgline;
    if (svgline !== null) KFK.hoverJqDiv(null);
  } else {
    return KFK._svghoverline;
  }
};

function el(jq) {
  return jq[0];
}

KFK.loadImages = function () {
  if (KFK.imagesLoaded) return;
  let loadedImages = 0;
  let numImages = assetIcons.length;
  for (let i = 0; i < assetIcons.length; i++) {
    let imgKey = assetIcons[i];
    KFK.images[imgKey] = new Image();
    KFK.images[imgKey].onload = function () {
      if (++loadedImages >= numImages) {
        KFK.imagesLoaded = true;
        KFK.debug("[Loaded] images fully loaded");
      }
    };
    let imgurl = cocoConfig.frontend.url + "/assets/" + imgKey + ".svg";
    KFK.images[imgKey].src = imgurl;
  }

  // KFK.images["toggle_line"].src = KFK.images["line"].src;
};


class Node {
  constructor(id, type, variant, x, y, w, h, attach, attach2) {
    this.id = id;
    this.type = type;
    this.variant = variant;
    this.iconscale = 0.8;
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.attach = attach;
    this.attach2 = attach2;
    if (
      isNaN(this.x) ||
      isNaN(this.y) ||
      isNaN(this.width) ||
      isNaN(this.height)
    ) {
      console.error("in Node contructor, x, y, w, h should be number");
      console.error(
        "this.x:",
        this.x,
        "this.y:",
        this.y,
        "this.width:",
        this.width,
        "this.height:",
        this.height
      );
    }
    if (KFK.APP.model.viewConfig.snap && type !== "svg") {
      let tmpLeft = this.x - this.width * 0.5;
      let tmpTop = this.y - this.height * 0.5;
      let newLeft = tmpLeft;
      let newTop = tmpTop;
      if (tmpLeft % KFK.APP.model.gridWidth < KFK.APP.model.gridWidth * 0.5) {
        newLeft =
          Math.floor(tmpLeft / KFK.APP.model.gridWidth) *
          KFK.APP.model.gridWidth;
      } else {
        newLeft =
          (Math.floor(tmpLeft / KFK.APP.model.gridWidth) + 1) *
          KFK.APP.model.gridWidth;
      }
      if (tmpTop % KFK.APP.model.gridWidth < KFK.APP.model.gridWidth * 0.5) {
        newTop =
          Math.floor(tmpTop / KFK.APP.model.gridWidth) *
          KFK.APP.model.gridWidth;
      } else {
        newTop =
          (Math.floor(tmpTop / KFK.APP.model.gridWidth) + 1) *
          KFK.APP.model.gridWidth;
      }

      this.x += newLeft - tmpLeft;
      this.y += newTop - tmpTop;
    }
  }
}

class Link {
  constructor(id, fromId, toId, route) {
    this.id = id;
    this.from = fromId;
    this.to = toId;
    this.route = route === undefined ? "" : route === null ? "" : route;
  }
}


KFK.focusOnNode = function (jqNodeDIV) {
  KFK.lastFocusOnJqNode = jqNodeDIV;
  KFK.lastSetNoteJq = jqNodeDIV;
  KFK.justCreatedJqNode = null;
  KFK.justCreatedShape = null;

  //TODO: focusOnNode show property form
  console.log("FocusOnNode", jqNodeDIV);
  if (jqNodeDIV !== null) {
    KFK.showPropForm(jqNodeDIV);
  } else {
    KFK.showPropForm(null);
  }
};


/**
 * 切换备注编辑器全屏显示状态时顶部菜单栏的显示,编辑器全屏,隐藏菜单栏,编辑器复原,恢复菜单栏
 */

/**
 * 切换备注编辑器显示与否
 *
 */

/**
 * 把备注编辑器的内容设置为节点的备注
 *
 */



KFK.log = function (...info) {
  console.log("LOG>", ...info);
};
KFK.error = function (...info) {
  if (KFK.loglevel >= KFK.LOGLEVEL_ERROR) console.log("ERROR>", ...info);
};
KFK.warn = function (...info) {
  if (KFK.loglevel >= KFK.LOGLEVEL_WARN) console.log("WARN >", ...info);
};
KFK.info = function (...info) {
  if (KFK.loglevel >= KFK.LOGLEVEL_INFO) console.log("INFO >", ...info);
};
KFK.debug = function (...info) {
  if (KFK.loglevel >= KFK.LOGLEVEL_DEBUG) console.log("DEBUG>", ...info);
};
KFK.detail = function (...info) {
  if (KFK.loglevel >= KFK.LOGLEVEL_DETAIL) console.log("DETAL>", ...info);
};
KFK.logKey = function (...info) {
  if (KFK.loglevel >= KFK.LOGLEVEL_KEY) console.log("KEY>", ...info);
};

KFK.scrLog = function (msg, staytime = 5000) {
  let parent = $("#MSG").parent();
  let msgDIV = $("#MSG");
  let cloneDIV = $("#fadeoutmsg");
  if (cloneDIV.length > 0) {
    if (KFK.msgTimer) {
      clearTimeout(KFK.msgTimer);
      KFK.msgTimer = undefined;
    }
    cloneDIV.remove();
  }
  cloneDIV = msgDIV.clone().appendTo(parent);
  cloneDIV.removeClass("noshow");
  cloneDIV.attr("id", "fadeoutmsg");
  cloneDIV.html(msg);
  KFK.msgTimer = setTimeout(() => {
    cloneDIV.animate({
      opacity: 0,
    },
      500,
      async function () {
        cloneDIV.remove();
      }
    );
  }, staytime);
};

KFK.getConnectorPoints = function (from, to, rad) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  let angle = Math.atan2(-dy, dx);

  let radius = rad;

  return [
    from.x + -radius * Math.cos(angle + Math.PI),
    from.y + radius * Math.sin(angle + Math.PI),
    to.x + -radius * Math.cos(angle),
    to.y + radius * Math.sin(angle),
  ];
};

KFK.replaceNodeInSelectedDIVs = function (jqDIV) {
  for (let i = 0; i < KFK.selectedDIVs.length; i++) {
    if (KFK.selectedDIVs[i].attr("id") === jqDIV.attr("id")) {
      KFK.selectedDIVs[i] = jqDIV;
    }
  }
};

/**
 * 计算节点对象的五点坐标
 *
 * jqDIV {jquery node object}- 被计算五点坐标的对象
 *
 * @returns {JSON} A JSON object describing the 5 key points of an object like:
 *      {
 *         center: {x: 100, y: 100},
 *         points: [
 *          {x: 90,  y: 100},
 *          {x: 100, y: 90},
 *          {x: 110, y: 100},
 *          {x: 100, y: 110}
 *          ]
 *      }
 *
 *      the above returned value describes an object which is centered at (100,00),
 *      and has a width of 20 and a height of 20, thus, it's left-middle point (points[0]) is (90,110), it's top-center point (points[1]) is (100, 90), it's right-middle point(points[2]) is (110, 100), it's bottom-center point (points[3]) is (100, 110)
 */
KFK.calculateNodeConnectPoints = function (jqDIV) {
  let divLeft = KFK.unpx(jqDIV.css("left"));
  let divTop = KFK.unpx(jqDIV.css("top"));
  let divWidth = KFK.unpx(jqDIV.css("width"));
  let divHeight = KFK.unpx(jqDIV.css("height"));
  let pos = {
    center: {
      x: divLeft + divWidth * 0.5,
      y: divTop + divHeight * 0.5,
    },
    points: [{
      x: KFK.unpx(jqDIV.css("left")),
      y: KFK.unpx(jqDIV.css("top")) + KFK.unpx(jqDIV.css("height")) * 0.5,
    },
    {
      x: KFK.unpx(jqDIV.css("left")) + KFK.unpx(jqDIV.css("width")) * 0.5,
      y: KFK.unpx(jqDIV.css("top")),
    },
    {
      x: KFK.unpx(jqDIV.css("left")) + KFK.unpx(jqDIV.css("width")),
      y: KFK.unpx(jqDIV.css("top")) + KFK.unpx(jqDIV.css("height")) * 0.5,
    },
    {
      x: KFK.unpx(jqDIV.css("left")) + KFK.unpx(jqDIV.css("width")) * 0.5,
      y: KFK.unpx(jqDIV.css("top")) + KFK.unpx(jqDIV.css("height")),
    },
    ],
  };
  return pos;
};

/**
 * Draw connect between two nodes, and make sure the connect is the shorttest one among all possible links between connect points from two nodes.
 *
 * @param {jqNode} A - The beginning node
 * @param {jqNode} B - The endding node
 * @param {Array} posLimitA - Allowed connect points of A
 * @param {Array} posLimitB - Allowed connect points ofB
 * @param {boolean} drawLine - Whether draw the line or not
 */
KFK.drawConnect = async function (
  A,
  B,
  caseValue,
  posLimitA = [0, 1, 2, 3],
  posLimitB = [0, 1, 2, 3],
  drawLine = true
) {
  let APos = KFK.calculateNodeConnectPoints(A);
  let BPos = KFK.calculateNodeConnectPoints(B);
  let fromPoint = null;
  let toPoint = null;
  let AIndex = 0;
  let BIndex = 0;
  /*
  //找两个节点的4个连接点中，连接距离最短的两个连接点，一个属于from节点，一个属于to节点
  let shortestDistance = KFK.distance(APos.points[0], BPos.points[0]);
  for (let i = 0; i < APos.points.length; i++) {
    if (posLimitA.indexOf(i) < 0) continue;
    fromPoint = APos.points[i];
    for (let j = 0; j < BPos.points.length; j++) {
      if (posLimitB.indexOf(j) < 0) continue;
      toPoint = BPos.points[j];
      let tmp_drawConnect_distance = KFK.distance(fromPoint, toPoint);
      if (tmp_drawConnect_distance < shortestDistance) {
        shortestDistance = tmp_drawConnect_distance;
        AIndex = i;
        BIndex = j;
      }
    }
  }
  */

  if (APos.points[0].x > BPos.points[2].x) {
    AIndex = 0;
    BIndex = 2;
  } else if (APos.points[2].x < BPos.points[0].x) {
    AIndex = 2;
    BIndex = 0;
  } else if (APos.points[1].y > BPos.points[3].y) {
    /*
    if (APos.points[2].x < BPos.points[1].x) {
      AIndex = 2;
      BIndex = 3;
    } else if (APos.points[0].x > BPos.points[1].x) {
      AIndex = 0;
      BIndex = 3;
    } else {
      AIndex = 1;
      BIndex = 3;
    }
    */
    AIndex = 1;
    BIndex = 3;
  } else if (APos.points[3].y < BPos.points[1].y) {
    /*
    if (APos.points[2].x < BPos.points[1].x) {
      AIndex = 2;
      BIndex = 1;
    } else if (APos.points[0].x > BPos.points[1].x) {
      AIndex = 0;
      BIndex = 1;
    } else {
      AIndex = 3;
      BIndex = 1;
    }
    */
    AIndex = 3;
    BIndex = 1;
  } else {
    // 不画线
    AIndex = 0;
    BIndex = -1;
  }

  if (drawLine && BIndex >= 0) {
    //只有当BIndex>=0时画线
    await KFK.svgConnectNode(
      A.attr("id"),
      B.attr("id"),
      AIndex,
      BIndex,
      APos.points[AIndex].x,
      APos.points[AIndex].y,
      BPos.points[BIndex].x,
      BPos.points[BIndex].y, caseValue, {}
    );
  }
  return [AIndex, BIndex];
};

KFK.yarkLinkNode = function (jqDIV, shiftKey, text) {
  if (KFK.shapeDragging) return;
  if (KFK.nodeLocked(jqDIV)) return;
  KFK.tmpPos = KFK.calculateNodeConnectPoints(jqDIV);
  KFK.linkPosNode.push(jqDIV);
  KFK.procLinkNode(shiftKey, text);
};

KFK.yarkJumpNode = async function (jqDIV, shiftKey, text) {
  if (KFK.shapeDragging) return;
  if (KFK.nodeLocked(jqDIV)) return;
  KFK.jumpNodes.push(jqDIV);
  await KFK.procJumpNode();
};

KFK.cancelLinkNode = function () {
  KFK.cancelTempLine();
  KFK.linkPosNode.splice(0, 2);
  if (KFK.lockTool === false) KFK.setMode("pointer");
};

/**
 * Tool link, tool connect
 */
KFK.procLinkNode = function (shiftKey, text) {
  // Tool link, tool connect
  // connect two nodes
  // connect two nodes
  if (KFK.linkPosNode.length < 2) {
    KFK.showNodeMessage(KFK.linkPosNode[0], "A点选定，请继续点选B点");
    return;
  } else if (KFK.linkPosNode[0].attr("id") === KFK.linkPosNode[1].attr("id")) {
    KFK.linkPosNode.splice(1, 1);
    return;
  }
  if (KFK.tempSvgLine) KFK.tempSvgLine.hide();
  KFK.lineTemping = false;
  KFK.cancelAlreadySelected();
  KFK.clearNodeMessage();
  KFK.buildConnectionBetween(KFK.linkPosNode[0], KFK.linkPosNode[1]);
  KFK.redrawLinkLines(KFK.linkPosNode[0], "connect", false);
  //看两个节点的Linkto属性，在添加一个连接线后有没有什么变化，
  //如果有变化，就上传U， 如果没变化，就不用U
  //没有变化的情况：之前就有从linkPosNode[0]到 linkPosNode[1]的链接存在
  //有变化的情况：1. 之前不存在； 2. 之前存在方向相反的链接，从linkPosNode[1]到linkPosNode[0]的
  //以上两种情况中，1会只导致只U第一个； 2会导致U；两端两个节点

  if (!shiftKey) {
    KFK.linkPosNode.splice(0, 2);
  } else {
    KFK.linkPosNode[0] = KFK.linkPosNode[1];
    KFK.linkPosNode.splice(1, 1);
  }
};

KFK.procJumpNode = async function () {
  if (KFK.jumpNodes.length < 2) {
    KFK.showNodeMessage(KFK.jumpNodes[0], "起始节点，请选择跳往节点");
    return;
  } else if (KFK.jumpNodes[0].attr("id") === KFK.jumpNodes[1].attr("id")) {
    KFK.jumpNodes.splice(1, 1);
    return;
  }
  KFK.showNodeMessage(
    KFK.jumpNodes[1],
    "点原节点右上角跳转，或按f，即可跳转到这里"
  );
  let oldDIV = KFK.jumpNodes[0].clone();
  KFK.jumpNodes[0].attr("jump", KFK.jumpNodes[1].attr("id"));
  await KFK.syncNodePut(
    "U",
    KFK.jumpNodes[0].clone(),
    "add jump",
    oldDIV,
    false,
    0,
    1
  );
  KFK.jumpNodes.splice(0, 2);
  KFK.setMode("pointer");
};

KFK.clearNodeMessage = function (jqDiv) {
  if (KFK.nodeMessageTimer) {
    clearTimeout(KFK.nodeMessageTimer);
  }
  $(".nodeMessage").remove();
};
KFK.showNodeMessage = function (jqDiv, msg, lastSec = 3) {
  if (KFK.APP.model.viewConfig.nodemessage === false) return;
  if (KFK.nodeMessageTimer) {
    clearTimeout(KFK.nodeMessageTimer);
    $(".nodeMessage").remove();
  }
  let msgDiv = $("<div></div>");
  msgDiv.addClass("nodeMessage");
  msgDiv.appendTo(jqDiv);
  msgDiv.prop("innerHTML", msg);
  KFK.nodeMessageTimer = setTimeout(() => {
    msgDiv.remove();
    KFK.nodeMessageTimer = undefined;
  }, lastSec * 1000);
};

KFK.setShapeToRemember = function (theShape) {
  KFK.shapeToRemember = theShape.clone();
  KFK.shapeToRemember.attr("id", theShape.attr("id"));
  KFK.shapeToRemember.attr("stroke-width", theShape.attr("origin-width"));
};

KFK.closePolyPoint = function (x, y, shiftKey) {
  KFK.polyId = undefined;
  KFK.drawPoints.splice(0, KFK.drawPoints.length);

  let shapeId = KFK.polyShape.attr("id");
  KFK.addShapeEventListner(KFK.polyShape);
  KFK.setShapeToRemember(KFK.polyShape);

  KFK.APP.setData("show", "shape_property", true);
  KFK.APP.setData("show", "customshape", false);
  KFK.APP.setData("show", "customline", true);
  KFK.APP.setData("show", "custombacksvg", false);
  KFK.APP.setData("show", "customfont", false);
  KFK.APP.setData("show", "layercontrol", false);

  KFK.pickedShape = KFK.polyShape;
  let color = KFK.polyShape.attr("origin-color");
  let width = KFK.polyShape.attr("origin-width");
  let linecap = KFK.polyShape.attr("stroke-linecap");
  $("#lineColor").spectrum("set", color);
  $("#spinner_line_width").spinner("value", width);

  KFK.syncLinePut("C", KFK.polyShape, "create new", null, false);
};

KFK.yarkShapePoint = function (x, y, shiftKey) {
  if (KFK.shapeDragging) return;
  if (KFK.isFreeHandDrawing) return;

  //如果这是划线时，所点的第二个点(此时，开始画线)
  if (KFK.drawMode === "line" && KFK.drawPoints.length === 1) {
    //如果按着alt键，则应该画直线
    if (KFK.KEYDOWN.alt) {
      //如果更起始点的x距离比y距离更小，则画垂直线，否则画水平线
      if (
        Math.abs(x - KFK.drawPoints[0].center.x) <
        Math.abs(y - KFK.drawPoints[0].center.y)
      ) {
        //画垂直线(x相等)
        x = KFK.drawPoints[0].center.x;
      } else {
        //画水平线(y相等)
        y = KFK.drawPoints[0].center.y;
      }
    }
  }
  KFK.drawPoints.push({
    type: "point",
    center: {
      x: x,
      y: y,
    },
    points: [{
      x: x,
      y: y,
    },],
  });
  KFK.procDrawShape(shiftKey);
};
KFK.procDrawShape = function (shiftKey) {
  if (KFK.drawPoints.length < 2) {
    return;
  } else {
    if (KFK.tempShape) KFK.tempShape.hide();
    KFK.lineTemping = false;
  }
  if (["line", "rectangle", "ellipse"].indexOf(KFK.drawMode) >= 0)
    KFK.justCreatedShape = KFK.svgDrawShape(
      KFK.drawMode,
      KFK.myuid(),
      KFK.drawPoints[0].center.x,
      KFK.drawPoints[0].center.y,
      KFK.drawPoints[1].center.x,
      KFK.drawPoints[1].center.y, {
      color: KFK.YIQColorAux || KFK.APP.model.svg[KFK.drawMode].color,
      width: KFK.APP.model.svg[KFK.drawMode].width,
      linecap: KFK.APP.model.svg[KFK.drawMode].linecap ? "round" : "square",
    }
    );
  else if (["polyline", "polygon"].indexOf(KFK.drawMode) >= 0) {
    if (KFK.polyId === undefined) {
      KFK.polyId = KFK.myuid();
    }
    KFK.justCreatedShape = KFK.svgDrawPoly(KFK.drawMode, KFK.polyId, {
      color: KFK.YIQColorAux || KFK.APP.model.svg[KFK.drawMode].color,
      width: KFK.APP.model.svg[KFK.drawMode].width,
      linecap: KFK.APP.model.svg[KFK.drawMode].linecap ? "round" : "square",
    });
    KFK.polyShape = KFK.justCreatedShape;
  }

  let theShape = KFK.justCreatedShape;
  KFK.setShapeToRemember(theShape);

  KFK.APP.setData("show", "shape_property", true);
  KFK.APP.setData("show", "customshape", false);
  KFK.APP.setData("show", "customline", true);
  KFK.APP.setData("show", "custombacksvg", false);
  KFK.APP.setData("show", "customfont", false);
  KFK.APP.setData("show", "layercontrol", false);

  KFK.pickedShape = theShape;
  let color = theShape.attr("stroke");
  let width = theShape.attr("origin-width");
  let linecap = theShape.attr("stroke-linecap");
  $("#lineColor").spectrum("set", color);
  $("#spinner_line_width").spinner("value", width);

  if (["line", "rectangle", "ellipse"].indexOf(KFK.drawMode) >= 0) {
    KFK.syncLinePut("C", theShape, "create new", null, false);
    KFK.drawPoints.splice(0, 2);
  }
};

KFK.addLinkTo = function (jq1, jq2) {
  let id1 = jq1.attr("id");
  let id2 = jq2.attr("id");
  let filter = `.link[from="${id1}"][to="${id2}"]`;
  console.log(filter);
  let links = KFK.tpl.find(filter);
  if (links.length > 0) {
    return;
  } else {
    KFK.tpl.append(`<div class="link" from="${id1}" to="${id2}"></div>`);
  }
};
KFK.removeLinkTo = function (jq1, jq2) {
  let id1 = jq1.attr("id");
  let id2 = jq2.attr("id");
}
/**
 * 建立两个节点之间的连接
 * 建立从jq1到jq2的连接，会同时删除反方向从jq2到jq1的连接
 * @param jq1 从这个节点开始
 * @param jq2 连到这个节点
 *
 *
 */
KFK.buildConnectionBetween = function (jq1, jq2) {
  KFK.addLinkTo(jq1, jq2);
  KFK.removeLinkTo(jq2, jq1);
};

/**
 * 断掉两个节点之间的连接
 * @param jq 连接的from节点
 * @param idToRemove 连接的to节点的id
 */
KFK.removeLinkTo = function (jq, idToRemove) {
  let str = jq.attr("linkto");
  let arr = KFK.stringToArray(str);
  //如对手节点在反方向存在，就把反方向的对手节点去掉
  let index = arr.indexOf(idToRemove);
  if (index >= 0) {
    arr.splice(index, 1);
    if (arr.length > 0) jq.attr("linkto", arr.join(","));
    else jq.removeAttr("linkto");
  }
};

/**
 * 获得一个节点的所有父节点
 * @param jq 子节点
 * @return 一个包含所有父节点的数组
 */
KFK.getParent = (jq) => {
  let ret = [];
  let myId = jq.attr("id");
  KFK.JC3.find(".kfknode").each((index, aNode) => {
    let jqConnectFrom = $(aNode);
    if (jqConnectFrom.attr("id") !== myId) {
      let arr = KFK.stringToArray(jqConnectFrom.attr("linkto"));
      if (arr.indexOf(myId) >= 0) ret.push(jqConnectFrom);
    }
  });
  return ret;
};

/**
 * 获得一个节点的所有子节点
 * @param jq 父节点
 * @return 所有子节点
 */
KFK.getChildren = function (jq) {
  let str = jq.attr("linkto");
  if (NotSet(str)) return [];
  let arr = KFK.stringToArray(str);
  arr = arr.filter((id) => {
    if ($("#" + id).length > 0) {
      return true;
    } else {
      return false;
    }
  });
  let ret = arr.map((id) => {
    return $("#" + id);
  });
  return ret;
};

/**
 * 两个节点之间是否有连接？
 * @param jq1  from节点
 * @param jq2  to节点
 */
KFK.hasConnection = function (jq1, jq2) {
  let str = jq1.attr("linkto");
  if (NotSet(str)) return fasle;
  let arr = KFK.stringToArray(str);

  let linkToId = "";
  if (typeof jq2 === "string") {
    linkToId = jq2;
  } else {
    linkToId = jq2.attr("id");
  }

  let index = arr.indexOf(linkToId);
  return index >= 0;
};

KFK.distance = function (p1, p2) {
  return Math.sqrt(
    (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
  );
};

KFK.getZIndex = function (jqDiv) {
  let zz = parseInt(jqDiv.css("z-index"));
  zz = isNaN(zz) ? 0 : zz;
  return zz;
};
KFK.setZIndex = function (jqDiv, zz) {
  jqDiv.css("z-index", zz);
};
//unselect all, deselect all
KFK.cancelAlreadySelected = function () {
  while (KFK.selectedDIVs.length > 0) {
    KFK.deselectNode(KFK.selectedDIVs[0]);
  }
  KFK.selectedDIVs.clear();
  KFK.focusOnNode(null);

};


KFK.getLineIdFromString = function (str) {
  let m = str.match(/id\s*=\s*('|")([^"]+)('|")/);
  if (m) {
    return m[2];
  } else return null;
};

KFK.undo = async () => {
  console.log("KFK.undo");
  if (KFK.opz < 0) {
    console.log("undo 到头了");
    return;
  }
  console.log("UNDO....");
  let pair = KFK.opstack[KFK.opz];
  if (pair.obj === 'node') {
    if (pair.from !== null && pair.to !== null) {
      let nodeId = pair.to.attr("id");
      let jqNode = KFK.JC3.find(`#${nodeId}`);
      jqNode.prop('outerHTML', pair.from.prop('outerHTML'));
      jqNode = KFK.JC3.find(`#${nodeId}`);
      //KFK.addSvgLayer();
      await KFK.setNodeEventHandler(jqNode);
      await KFK.redrawLinkLines(jqNode, "undo", true);
    } else if (pair.from === null && pair.to !== null) {
      //A create
      let nodeId = pair.to.attr("id");
      let jqNode = KFK.JC3.find(`#${nodeId}`);
      await KFK.cleanUpConnection(jqNode, true);
      jqNode.remove();
    } else if (pair.from !== null && pair.to === null) {
      //A delete
      let nodeId = pair.from.attr("id");
      KFK.JC3.append(pair.from);
      let jqNode = KFK.JC3.find(`#${nodeId}`);
      await KFK.setNodeEventHandler(jqNode);
      await KFK.redrawLinkLines(jqNode, "undo", true);
    }
  } else if (pair.obj === "link") {
    //对连接的操作
    if (pair.from !== null && pair.to === null) {
      let fromNodeId = pair.from.attr("from");
      let toNodeId = pair.from.attr("to");
      let jqFrom = KFK.JC3.find(`#${fromNodeId}`);
      if (jqFrom && jqFrom.length > 0) {
        await KFK.tpl.append(pair.from);
        await KFK.redrawLinkLines(jqFrom, "undo", false);
      }
    }
  }
  KFK.opz = KFK.opz - 1;
  KFK.onChange("Undo");
};

KFK.redo = async () => {
  console.log("KFK.redo");
  if (KFK.opz >= KFK.opstack.length - 1) {
    console.log("redo 到头了");
    return;
  }
  KFK.opz = KFK.opz + 1;
  let pair = KFK.opstack[KFK.opz];
  //对节点的操作
  if (pair.obj === "node") {
    if (pair.from !== null && pair.to !== null) {
      let nodeId = pair.to.attr("id");
      let jqNode = KFK.JC3.find(`#${nodeId}`);
      jqNode.prop('outerHTML', pair.to.prop('outerHTML'));
      jqNode = KFK.JC3.find(`#${nodeId}`);
      await KFK.setNodeEventHandler(jqNode);
      await KFK.redrawLinkLines(jqNode, "redo", true);
    } else if (pair.from === null && pair.to !== null) {
      let nodeId = pair.to.attr("id");
      KFK.JC3.append(pair.to);
      let jqNode = KFK.JC3.find(`#${nodeId}`);
      await KFK.setNodeEventHandler(jqNode);
      await KFK.redrawLinkLines(jqNode, "redo", true);
    } else if (pair.from !== null && pair.to === null) {
      let nodeId = pair.from.attr("id");
      let jqNode = KFK.JC3.find(`#${nodeId}`);
      await KFK.cleanUpConnection(jqNode, true);
      jqNode.remove();
    }
  } else if (pair.obj === "link") {
    //对连接的操作
    if (pair.from !== null && pair.to === null) {
      let fromNodeId = pair.from.attr("from");
      let toNodeId = pair.from.attr("to");
      let connectId = `connect_${fromNodeId}_${toNodeId}`;
      await KFK.removeConnectById(connectId);
    }
  }
  KFK.onChange("Redo");
};

KFK.initLayout = function () {
  KFK.debug("...initLayout");
  KFK.JC1 = $("#C1");
  KFK.C1 = el(KFK.JC1);
  KFK.JS1 = $("#S1");
  KFK.S1 = el(KFK.JS1);
  KFK.JC1.css({
    width: KFK.px(KFK.PageWidth * (KFK.PageNumberHori + 2)),
    height: KFK.px(KFK.PageHeight * (KFK.PageNumberVert + 2)),
  });
};

KFK.scrollToPos = function (pos) {
  KFK.JS1.scrollLeft(pos.x);
  KFK.JS1.scrollTop(pos.y);
};

//create C3 create c3
KFK.initC3 = function () {
  KFK.debug("...initC3");
  KFK.JC3 = $("#C3");
  KFK.C3 = el(KFK.JC3);
  KFK.JC3.css({
    width: KFK.px(KFK.PageWidth * KFK.PageNumberHori),
    height: KFK.px(KFK.PageHeight * KFK.PageNumberVert),
    left: KFK.px(KFK.LeftB),
    top: KFK.px(KFK.TopB),
  });
  // KFK.JC3.focus((evt) => { KFK.debug("JC3 got focus"); })
  KFK.JCBKG = $("#containerbkg");
  KFK.JCBKG.css({
    width: KFK.px(KFK.PageWidth * KFK.PageNumberHori),
    height: KFK.px(KFK.PageHeight * KFK.PageNumberVert),
    left: KFK.px(KFK.LeftB),
    top: KFK.px(KFK.TopB),
  });

  KFK.JC3.dblclick(async function (evt) {
    if (KFK.isEditting && KFK.inlineEditor) {
      KFK.endInlineEditing();
    }
    if (KFK.isEditting || KFK.resizing || KFK.dragging) {
      return;
    }
    if (KFK.inOverviewMode === true) {
      KFK.toggleOverview({
        x: evt.offsetX,
        y: evt.offsetY,
      });
    } else if (KFK.mode === "pointer") {
      KFK.toggleOverview();
    }
    KFK.cancelTempLine();
    evt.preventDefault();
    evt.stopImmediatePropagation();
    evt.stopPropagation();
  });
  KFK.JC1.on("contextmenu", function (evt) {
    evt.preventDefault();
    KFK.kuangXuanMouseIsDown = false;
  });
  KFK.JC1.on("click", async function (evt) {
    if (IsSet(KFK.selectedTodo)) {
      KFK.selectedTodo.removeClass("current");
    }
    KFK.kuangXuanMouseIsDown = false;
    KFK.hide($(".clickOuterToHide"));
  });
  KFK.JC3.keydown(function (evt) {
    // console.log('JC3.keydown', evt.keyCode, KFK.mode, KFK.drawMode);
    if (
      (evt.keyCode === 13 || evt.keyCode === 27) &&
      KFK.mode === "line" &&
      (KFK.drawMode === "polyline" || KFK.drawMode === "polygon")
    ) {
      KFK.closePolyPoint();
    }
  });
  //click c3
  KFK.JC3.on("contextmenu", function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    KFK.kuangXuanMouseIsDown = false;
    if (KFK.ctrlMouseToPan === true) {
      KFK.panStartAt = {
        x: evt.clientX,
        y: evt.clientY,
      };
    }
  });
  KFK.JC3.on("click", async function (evt) {
    console.log("JC3 onClick");
    if (evt.ctrlKey) {
      evt.stopPropagation();
      evt.preventDefault();
      return;
    }
    KFK.focusOnNode(null);

    let tmpPoint = {
      x: evt.clientX,
      y: evt.clientY,
    };
    //KFK.pointAfterResize 记录着DIV重新拖动大小后，释放鼠标的一霎那间的鼠标位置
    //这样，在鼠标释放同时，click事件发起时，下面的代码避免执行
    if (KFK.pointAfterResize) {
      if (KFK.distance(tmpPoint, KFK.pointAfterResize) < 10) {
        KFK.pointAfterResize = undefined;
        return;
      } else {
        KFK.pointAfterResize = undefined;
      }
    }
    if (KFK.docIsNotReadOnly()) {
      await KFK.placeNodeOnClick(evt);
    } else {
      console.log("Not in edit mode: " + KFK.mode);
    }
  });

  //place node on click
  KFK.placeNodeOnClick = async function (evt) {
    if (KFK.isEditting || KFK.resizing || KFK.dragging) {
      return;
    }
    evt.preventDefault();
    KFK.hide($(".clickOuterToHide"));
    if (KFK.ignoreClick) return;

    // KFK.focusOnNode(null);
    KFK.justCreatedJqNode = null;
    KFK.justCreatedShape = null;

    KFK.pickedShape = null;
    KFK.morphedShape = null;

    // if (KFK.mode === 'lock' || KFK.mode === 'connect') {
    //   KFK.setMode('pointer');
    // }
    if (KFK.docIsReadOnly()) return;

    if (KFK.tobeTransformJqLine) KFK.tobeTransformJqLine.removeClass("shadow2");
    KFK.hide("#linetransformer");
    KFK.tobeTransformJqLine = null;
    KFK.divStylerRefDiv = null;

    if (KFK.afterDragging === true) {
      KFK.afterDragging = false;
      // return;
    }
    if (KFK.afterResizing === true) {
      KFK.afterResizing = false;
      // return;
    }

    //place image, place material
    if (KFK.mode === "material" && KFK.materialPicked) {
      let fileId = KFK.myuid();

      await KFK.makeImageDiv(
        fileId,
        KFK.scalePoint(KFK.scrXToJc3X(evt.clientX)),
        KFK.scalePoint(KFK.scrYToJc3Y(evt.clientY)),
        KFK.materialPicked.url
      );
      return;
    } else if (
      KFK.mode === "line" &&
      KFK.isFreeHandDrawing === false &&
      IsFalse(KFK.isZoomingShape) &&
      KFK.pmsOk("C") === true
    ) {
      // console.log("yarkShapePoint");
      KFK.yarkShapePoint(
        KFK.scalePoint(KFK.scrXToJc3X(evt.clientX)),
        KFK.scalePoint(KFK.scrYToJc3Y(evt.clientY)),
        evt.shiftKey
      );
      return;
    } else {
      if (KFK.selectedDIVs.length > 0 || KFK.selectedShapes.length > 0) {
        if (KFK.duringKuangXuan === false) KFK.cancelAlreadySelected();
      }
      if (cocoConfig.node[KFK.mode]) {
        let variant = "default";
        let realX = KFK.scalePoint(KFK.scrXToJc3X(evt.clientX));
        let realY = KFK.scalePoint(KFK.scrYToJc3Y(evt.clientY));
        let jqDIV = await KFK.placeNode(
          evt.shiftKey,
          KFK.myuid(),
          KFK.mode,
          variant,
          realX,
          realY,
          undefined,
          undefined,
          "",
          ""
        );
        KFK.focusOnNode(jqDIV);
        KFK.yarkOpHistory(
          {
            obj: 'node',
            from: null,
            to: jqDIV.clone()
          }
        );
        KFK.onChange("New Node");
      }
    }

    evt.stopImmediatePropagation();
    evt.stopPropagation();
    evt.preventDefault();
  };


  KFK.JC3.mouseup(async (evt) => {
    KFK.panStartAt = undefined;
    // 下面的尝试不起作用，在pad.js中的dropevent中是起作用的
    // console.log('JC3 mouseup');
    // if (KFK.toolboxMouseDown === true){
    //     console.log("place", KFK.toolboxMouseDownOn);
    //     KFK.placeNodeOnClick(evt);
    //     KFK.toolboxMouseDown = false;
    //     KFK.toolboxMouseDownOn = null;
    // }
    KFK.ignoreClick = false;
  });

  KFK.simplifyPoints = function (polyline, points, tolerance) {
    let lastPoint = points[0];
    let newPoints = [];
    newPoints.push(lastPoint);
    let lastIndex = 0;
    for (let i = 1; i < points.length; i++) {
      if (KFK.distance(points[i], lastPoint) >= tolerance) {
        lastPoint = points[i];
        lastIndex = i;
        newPoints.push(points[i]);
      }
    }
    if (lastIndex < points.length - 1) {
      newPoints.push(points[points.length - 1]);
    }
    KFK.plotFreeHandPoints(polyline, newPoints);
  };

  KFK.JC3.on("mousemove", function (evt) {
    KFK.currentMousePos.x = evt.clientX;
    KFK.currentMousePos.y = evt.clientY;

    //跟随鼠标的indicator图标的位置, 在鼠标的位置向右右下偏移10个像素点
    let indicatorX = KFK.scrXToJc1X(KFK.currentMousePos.x) + 10;
    let indicatorY = KFK.scrYToJc1Y(KFK.currentMousePos.y) + 10;

    $("#modeIndicator").css("left", indicatorX);
    $("#modeIndicator").css("top", indicatorY);
    // KFK.kuangXuanEndPoint = {
    //   x: KFK.scrXToJc3X(evt.clientX),
    //   y: KFK.scrYToJc3Y(evt.clientY)
    // };

    //如果文档是只读,返回就可以了
    if (KFK.docIsReadOnly()) return;

    //把屏幕鼠标位置,翻译为JC3的坐标位置,再翻译成放大缩小后的点坐标
    let tmpPoint = {
      x: KFK.scalePoint(KFK.scrXToJc3X(KFK.currentMousePos.x)),
      y: KFK.scalePoint(KFK.scrYToJc3Y(KFK.currentMousePos.y)),
    };

    //检查是否为正在拖动一个形状,还是正在手绘
    if (KFK.shapeToDrag && KFK.lineLocked(KFK.shapeToDrag) === false) {
      if (KFK.distance(KFK.mousePosToRemember, KFK.currentMousePos) > 5) {
        //正在拖动形状
        KFK.shapeDragging = true;
      }
    } else {
      KFK.shapeToDrag = null;
    }

    //判断是否为正在框选 .
    //正在编辑时, 这了拖动形状是,正在拖动线条两端时,以及鼠标位于minimap上时,均不处理框选
    if (
      KFK.isEditting //正在编辑
      ||
      KFK.shapeDragging //正在拖动形状
      ||
      KFK.lineTransfomerDragging //正在拖动线条两端
      || KFK.minimapMouseDown //鼠标位于minimap上
    ) {
      KFK.duringKuangXuan = false; //不再框选过程中
    }

    if (KFK.mode === "connect" && KFK.docIsNotReadOnly()) {
      if (KFK.linkPosNode.length === 1) {
        //如果当前为连接两个节点,且已经选择了起始点
        KFK.lineTemping = true;
        let fromPoint = null;
        let toPoint = null;
        let selectedFromIndex = 0;
        let shortestDistance = KFK.distance(KFK.tmpPos.points[0], tmpPoint);
        for (let i = 0; i < KFK.tmpPos.points.length; i++) {
          fromPoint = KFK.tmpPos.points[i];
          toPoint = tmpPoint;
          let tmp_dis = KFK.distance(fromPoint, toPoint);
          if (tmp_dis < shortestDistance) {
            shortestDistance = tmp_dis;
            selectedFromIndex = i;
          }
        }
        //画出临时连接线
        KFK.svgDrawTmpLine(
          KFK.tmpPos.points[selectedFromIndex].x,
          KFK.tmpPos.points[selectedFromIndex].y,
          tmpPoint.x,
          tmpPoint.y, {
          color: KFK.YIQColorAux || "#888888",
          stroke: 10,
        }
        );
      }
    }
    if (KFK.mode === "line" && KFK.docIsNotReadOnly()) {
      //如果当前模式为画线,则在鼠标移动时,画出临时线
      if (KFK.drawPoints.length === 1) {
        KFK.lineTemping = true;
        KFK.svgDrawTmpShape(
          KFK.drawMode,
          KFK.drawPoints[0].center.x,
          KFK.drawPoints[0].center.y,
          tmpPoint.x,
          tmpPoint.y, {
          color: KFK.YIQColorAux || "#888888",
          stroke: 10,
        }
        );
      }
    }
    if (
      KFK.shapeDragging &&
      KFK.docIsReadOnly() === false &&
      KFK.lineLocked(KFK.shapeToDrag) === false &&
      KFK.pmsOk("U", KFK.shapeToDrag) === true
    ) {
      let realX = KFK.scalePoint(KFK.scrXToJc3X(evt.clientX));
      let realY = KFK.scalePoint(KFK.scrYToJc3Y(evt.clientY));
      let deltaX = realX - KFK.shapeDraggingStartPoint.x;
      let deltaY = realY - KFK.shapeDraggingStartPoint.y;
      // if (KFK.shapeToDrag.array) {
      //     console.log(typeof KFK.shapeToDrag.array);
      //     console.log(typeof KFK.shapeToDrag.array());
      //     console.log(KFK.shapeToDrag.array());
      // }
      if (
        KFK.shapeToDrag.hasClass("kfkpolyline") ||
        KFK.shapeToDrag.hasClass("kfkpolygon")
      ) {
        let arr = KFK.shapeToDrag.array();
        KFK.shapeToDrag.plot(arr);
      }
      KFK.shapeToDrag.dmove(deltaX, deltaY);
      KFK.shapeDraggingStartPoint.x += deltaX;
      KFK.shapeDraggingStartPoint.y += deltaY;
    }
  });

  KFK.addMinimap();
};

KFK.isDuringKuangXuan = function () {
  if (
    KFK.mode === "pointer" &&
    KFK.kuangXuanMouseIsDown &&
    KFK.shapeDragging === false &&
    KFK.lineTransfomerDragging === false &&
    KFK.minimapMouseDown === false &&
    KFK.isShowingModal === false &&
    KFK.touchChatTodo === false &&
    KFK.isEditting === false &&
    KFK.isZoomingShape === false
  )
    return true;
  else {
    return false;
  }
};

KFK.scalePoint = (pt) => {
  return pt / KFK.scaleRatio;
};

KFK.addMinimap = function () {
  KFK.refreshC3Event = new CustomEvent("refreshC3");
  KFK.zoomEvent = new CustomEvent("zoomC3");
  KFK.changedEvent = new CustomEvent("changedC3");
  /*
  import("./minimap/jquery-minimap").then((pack) => {
    KFK.MiniMap = pack.MiniMap;
    KFK.MiniMap.minimap($("#minimap"), KFK);
    KFK.MiniMap.init();
  });
  */
};

KFK.getImageSrc = (img) => {
  if (KFK.APP && KFK.APP.images && KFK.APP.images[img]) {
    return KFK.APP.images[img].src;
  } else {
    return undefined;
  }
};


KFK.moveLineMoverTo = function (position) {
  $("#linetransformer").css("left", position.x - 10);
  $("#linetransformer").css("top", position.y - 10);
};
/**
 * 选定一个元素
 */
KFK.selectNode = function (jqDIV) {
  jqDIV.addClass("selected");
  KFK.selectedDIVs.push(jqDIV);
  KFK.setSelectedNodesBoundingRect();
};

/**
 * 根据选定的多个元素，显示其周围的边框
 */
KFK.setSelectedNodesBoundingRect = function () {
  let brect = $(".boundingrect");
  if (brect.length <= 0) {
    let rect = document.createElement("div");
    brect = $(rect);
    brect.addClass("boundingrect");
    brect.appendTo(KFK.JC3);
    brect.css("z-index", -1);
  }
  if (KFK.selectedDIVs.length > 1) {
    let rect = KFK.getBoundingRectOfSelectedDIVs();
    brect.css("left", rect.left - cocoConfig.ui.boundingrect_padding);
    brect.css("top", rect.top - cocoConfig.ui.boundingrect_padding);
    brect.css("width", rect.width + cocoConfig.ui.boundingrect_padding * 2);
    brect.css("height", rect.height + cocoConfig.ui.boundingrect_padding * 2);
    brect.show();
  } else {
    brect.hide();
  }
};
KFK.kuangXuan = function (pt1, pt2) {
  let x1 = pt1.x + KFK.LeftB;
  let y1 = pt1.y + KFK.TopB;
  let x2 = pt2.x + KFK.LeftB;
  let y2 = pt2.y + KFK.TopB;
  if (Math.abs(x1 - x2) < 10 && Math.abs(y1 - y2) < 10) {
    //这里，如果滑动大小横向和纵向都小于10， 则不作为框选
    return;
  }
  let jqRect = $("#selectingrect");
  jqRect.css("left", Math.min(x1, x2));
  jqRect.css("top", Math.min(y1, y2));
  jqRect.css("width", Math.abs(x1 - x2));
  jqRect.css("height", Math.abs(y1 - y2));
  KFK.duringKuangXuan = true;
  jqRect.show();
};

KFK.selectShape = function (theShape) {
  let alreadySelected = false;
  for (let i = 0; i < KFK.selectedShapes.length; i++) {
    if (KFK.selectedShapes[i].attr("id") === theShape.attr("id")) {
      alreadySelected = true;
      break;
    }
  }
  if (alreadySelected) return;
  KFK.selectedShapes.push(theShape);
  let prevWidth = theShape.attr("stroke-width");
  prevWidth = KFK.unpx(prevWidth);
  theShape.addClass("selected");
  let color = theShape.attr("origin-color");
  KFK.shapeOriginColor = color;
  let color1 = KFK.reverseColor(color);
  let originWidth = theShape.attr("origin-width");
  let newWidth =
    originWidth * 2 > KFK.CONST.MAX_SHAPE_WIDTH ?
      originWidth :
      KFK.CONST.MAX_SHAPE_WIDTH;
  theShape.stroke({
    width: newWidth,
    color: "#0000FF",
  });
};
KFK.isShapeSelected = function (theShape) {
  if (KFK.selectedShapes.length <= 0) {
    return false;
  } else {
    if (KFK.selectedShapes.indexOf(theShape) >= 0) {
      return true;
    } else {
      return false;
    }
  }
};

KFK.getShapeConfig = function (shapeType) {
  return KFK.APP.model.svg[shapeType];
};

KFK.getShapeRectFromJqObj = function (shape) {
  return KFK.getShapeRect(SVG(shape));
};
KFK.getShapeRect = function (svgShape) {
  let x = svgShape.x();
  let y = svgShape.y();
  let width = svgShape.width();
  let height = svgShape.height();
  return {
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
    center: x + width * 0.5,
    middle: y + height * 0.5,
    width: width,
    height: height,
  };
};

KFK.deselectNode = function (theDIV) {
  $(theDIV).removeClass("selected");
  let index = KFK.selectedDIVs.indexOf(theDIV);
  KFK.selectedDIVs.splice(index, 1);
  KFK.setSelectedNodesBoundingRect();
};

KFK.selectNodeOnClick = function (jqDIV, shiftKey) {
  let exist = KFK.selectedDIVs.indexOf(jqDIV);
  if (shiftKey) {
    if (exist >= 0) {
      KFK.deselectNode(KFK.selectedDIVs[exist]);
    } else {
      KFK.selectNode(jqDIV);
    }
  } else {
    while (KFK.selectedDIVs.length > 0) {
      KFK.deselectNode(KFK.selectedDIVs[0]);
    }
    KFK.selectNode(jqDIV);
  }
};

KFK.getNearGridPoint = function (x, y) {
  if (y === undefined && x.x) {
    return KFK._getNearGridPoint(x.x, x.y);
  } else {
    return KFK._getNearGridPoint(x, y);
  }
};
KFK._getNearGridPoint = function (x, y) {
  let newX = x;
  let newY = y;
  if (x % KFK.APP.model.gridWidth < KFK.APP.model.gridWidth * 0.5) {
    newX = Math.floor(x / KFK.APP.model.gridWidth) * KFK.APP.model.gridWidth;
  } else {
    newX =
      (Math.floor(x / KFK.APP.model.gridWidth) + 1) * KFK.APP.model.gridWidth;
  }
  if (y % KFK.APP.model.gridWidth < KFK.APP.model.gridWidth * 0.5) {
    newY = Math.floor(y / KFK.APP.model.gridWidth) * KFK.APP.model.gridWidth;
  } else {
    newY =
      (Math.floor(y / KFK.APP.model.gridWidth) + 1) * KFK.APP.model.gridWidth;
  }
  return {
    x: newX,
    y: newY,
  };
};

function unpx(v) {
  return KFK.unpx(v);
}

function px(v) {
  return KFK.px(v);
}

KFK.px = (v) => {
  if (typeof v === "string") {
    if (v.endsWith("px")) {
      return v;
    } else {
      return v + "px";
    }
  } else {
    return v + "px";
  }
};

KFK.unpx = (v) => {
  if (typeof v === "string" && v.endsWith("px")) {
    return parseInt(v.substr(0, v.length - 2));
  } else {
    return v;
  }
};

/**
 * a Node object 放在起中心位置，构建Node对象时使用的x,y指的是其中心位置
 * 在实际放置时，需要算出它的左上角位置
 *
 * @param node a Node object
 * @return the left/top point of the node
 */
KFK.ltPos = function (node) {
  return {
    x: node.x - node.width * 0.5,
    y: node.y - node.height * 0.5,
  };
};


KFK.getKFKNodeNumber = function () {
  let nodes = KFK.JC3.find(".kfknode");
  return nodes.length;
};


/**
 * 在C3上放置一个对象
 * @param  shfitKey，是否按着shiftkey
 * @param  id, id of the new node,
 * @param  type  one of text/textblock/yellowtip/richtext
 * @param  variant  default, usefull for yellowtip only.
 * @param   x  the x of the center point, in C3's dimension
 * @param   y  the y of the center point, in C3's dimension
 * @param   w  the width of the node
 * @param   h  the height of the node
 * @param   attach  the inner content
 * @param   attach2  the lower inner content, which has a ossimage class which z-index is -1, normally, attach2 is suitable for place a backgrund div
 */
KFK.placeNode = async function (shiftKey, id, nodeType, variant, x, y, w, h, attach, attach2) {
  //create node, new node, place node
  let nodeDIV = document.createElement("div");
  let jqDIV = $(nodeDIV);
  jqDIV.attr("id", id);
  let label = "Activity";
  switch (nodeType) {
    case "ACTION":
      label = "Activity";
      break;
    case "INFORM":
      label = "Email";
      break;
    case "SCRIPT":
      label = "Script";
      break;
    case "TIMER":
      label = "Timer";
      break;
    case "SUB":
      label = "Sub Process";
      break;
    case "AND":
      label = "AND";
      break;
    case "OR":
      label = "OR";
      break;
    default:
      label = "Activity";
  }
  jqDIV.append("<p>" + label + "</p>");
  if (nodeType === "ACTION") {
    jqDIV.append('<div class="kvars">e30=</div>');
    jqDIV.append('<div class="katts">e30=</div>');
  }
  console.log("placeNode", nodeType);
  await KFK.JC3.append(nodeDIV);
  let nodeCount = KFK.getKFKNodeNumber();
  jqDIV.css("top", KFK.px(y - KFK.tplNode_height * 0.5));
  jqDIV.css("left", KFK.px(x - KFK.tplNode_width * 0.5));
  jqDIV.css("z-index", `${nodeCount + 1}`);
  //default padding for all

  jqDIV.addClass("node");
  jqDIV.addClass("kfknode");
  jqDIV.addClass(nodeType);

  await KFK.setNodeEventHandler(jqDIV);

  KFK.justCreatedJqNode = jqDIV;
  KFK.lastCreatedJqNode = jqDIV; //如果在脑图模式下，则自动建立脑图链接
  KFK.C3.dispatchEvent(KFK.refreshC3Event);
  return jqDIV;
};



//删除添加eventHandler带来的额外的、会引起复制节点event响应不正常的内容
KFK.removeNodeEventFootprint = function (jqNodeDIV) {
  jqNodeDIV.find(".ui-resizable-handle").remove();
  jqNodeDIV.find(".locklabel").remove();
  jqNodeDIV.removeClass(
    "ui-resizable ui-draggable ui-draggable-handle ui-draggable-dragging ui-droppable selected ui-resizable-autohide shadow1 shadow2 lock"
  );
};

KFK.removeLinkto = function (jqNodeDIV) {
  jqNodeDIV.attr("linkto", "");
};

KFK.startTrx = function () {
  if (KFK.state.TRX_FLAG === 0) {
    KFK.opArray = [];
  }
  KFK.state.TRX_FLAG += 1;
  console.log("STARTTRX:", KFK.state.TRX_FLAG);
};
/**
 * Close operation transaction
 */
KFK.endTrx = function () {
  KFK.state.TRX_FLAG -= 1;
  if (KFK.state.TRX_FLAG === 0) {
    console.log("ENDTRX:", KFK.state.TRX_FLAG);
  }
};
/**
 * During operation transaction or not
 */
KFK.inTrx = function () {
  if (KFK.state.TRX_FLAG > 0) return true;
  else return false;
};

/**
 * 在内存中记录操作历史
 */
KFK.yarkOpHistory = function (changedPair) {
  //如果没有操作被记录,则提示warn,并返回. 这是一个不应该发生的异常情况.
  KFK.opstack.splice(KFK.opz + 1, KFK.opstacklen);
  if (KFK.opstack.length >= KFK.opstacklen) {
    KFK.opstack.shift();
    KFK.opz = KFK.opz - 1;
    if (KFK.opz < -1) KFK.opz = -1;
  }
  KFK.opstack.push(changedPair);
  console.log(KFK.opstack.length);
  KFK.opz = KFK.opz + 1;
};

function getNull(value) {
  switch (value) {
    case undefined:
    case null:
    case "undefined":
    case "null":
      return true;
    default:
      return false;
  }
}

function getBoolean(value) {
  return ([true, "true", 1, "1", "on", "yes"].indexOf(value) >= 0);
}


//jqNode can be a node or even a svgline
KFK.anyLocked = function (jqNode) {
  if (jqNode) return KFK.docIsReadOnly() || KFK.nodeLocked(jqNode);
  else return KFK.docIsReadOnly();
};

KFK.notAnyLocked = function (jqNode) {
  return !KFK.anyLocked(jqNode);
};

KFK.docIsReadOnly = function () {
  return KFK.APP.model.cocodoc.readonly || KFK.tpl_mode !== "edit";
  //return KFK.APP.model.cocodoc.readonly;
};
KFK.docIsNotReadOnly = function () {
  return !KFK.docIsReadOnly()
};

KFK.nodeLocked = function (jqNode) {
  //Even works for svline, because svg line has .hasClass function as well
  return jqNode.hasClass("lock");
};
KFK.lineLocked = function (svgLine) {
  return svgLine.hasClass("lock");
};

KFK.setModeIndicatorForYellowTip = function (tipvariant) {
  if ($("#modeIndicatorDiv").length < 1) {
    KFK.debug("modeIndicatorDiv not found");
    return;
  }
  $("#modeIndicatorDiv").empty();
  let svg = $(SVGs[tipvariant]);
  if (NotSet(svg)) {
    svg = $(
      "<img src='" + cocoConfig.frontend.url + "/svgs/" + tipvariant + ".svg'/>"
    );
  }
  svg.css("width", "18px");
  svg.css("height", "18px");
  svg.appendTo($("#modeIndicatorDiv"));
};


KFK.stringToArray = function (str) {
  let arr = [];
  if (str) {
    arr = str.split(",");
    if (arr.length === 1 && arr[0] === "") arr = [];
  }
  return arr;
};

KFK.getNodeLinkIds = function (jq1, direction) {
  let linksStr = jq1.attr(direction);
  let linksArr = KFK.stringToArray(linksStr);
  //过滤掉不存在的节点
  // linksArr = linksArr.filter((aId) => {
  //   return $(`#${aId}`).length > 0;
  // })
  return linksArr;
};

KFK.removeConnectById = async function (connect_id) {
  try {
    await KFK.svgDraw.find(`.${connect_id}`).remove();
  } catch (err) {}
  let triangle_id = connect_id + "_triangle";
  try {
    await KFK.svgDraw.find(`.${triangle_id}`).remove();
  } catch (err) {}
  let text_id = connect_id + "_text";
  try {
    await KFK.svgDraw.find(`.${text_id}`).remove();
  } catch (err) {}
  try {
    let tmpNodeIdPair = KFK.getNodeIdsFromConnectId(connect_id);
    let fromNode_id = tmpNodeIdPair[0];
    let toNode_id = tmpNodeIdPair[1];
    console.log(`.link[from="${fromNode_id}"][to="${toNode_id}"]`);
    let aLinkInTemplate = KFK.tpl.find(`.link[from="${fromNode_id}"][to="${toNode_id}"]`);
    console.log(aLinkInTemplate);
    $(aLinkInTemplate).remove();
  } catch (err) {console.error(err)}
};

/**
 * 从新画节点所有的连接线
 * @param jqNode 要重画连接线的节点
 * @param reason 画线的原因
 * @param bothside 如果为false， 则只画从jqNode出去的线； 如为true, 则也画连到jqNode的线
 * @param allowConnectPoints 控制画线的上下左右连接点。缺省为全部可自动根据最短路线来选择。 一共四个数组，缺省为[[0,1,2,3],[0,1,2,3],[0,1,2,3],[0,1,2,3]]
 * 第一个数组为连接出去的线条的，from的连接点控制
 * 第二个数组为连接出去的线条的，to的连接点控制
 * 第三个数组为连接进来的线条的，from的连接点控制
 * 第四个数组为连接进来的线条的，to的连接点控制
 * 每个连接点控制数组中，0表示 左中点； 1表示上中点； 2表示右中点； 3表示下中点
 */

KFK.redrawLinkLines = async function (
  jqNode,
  reason = "unknown",
  bothside = true,
  allowConnectPoints = [
    [2],
    [0],
    [2],
    [0],
  ]
) {
  KFK.debug('Redrawlinks', reason, 'bothside', bothside);
  if (!(jqNode instanceof jQuery)) {
    console.error(
      "redrawLinkLines for a non-jquery object, sometime caused by no await"
    );
    return;
  }
  let myId = jqNode.attr("id");
  let guiLinks = KFK.tpl.find(`.link[from="${myId}"]`);
  //得到当前节点连接到的节点id列表
  //let toIds = KFK.getNodeLinkIds(jqNode, "linkto");
  //找出所有svg连接线条
  let list = KFK.svgDraw.find(".connect");

  list.each(async (connect) => {
    //如果这根连接线条的fid属性是当前node的id
    if (connect.attr("fid") === myId) {
      let connect_id = connect.attr("id");
      //移除线条
      await connect.remove();
      //移除三角
      let triangle_id = connect_id + "_triangle";
      await KFK.svgDraw.find(`.${triangle_id}`).remove();
    }
  });
  //画出从当前node:jqNode到所有"连接到"节点的连接线
  let anchorPositions = [];
  for (let i = 0; i < guiLinks.length; i++) {
    let toId = $(guiLinks[i]).attr("to");
    let jqTo = $(`#${toId}`);
    let caseValue = $(guiLinks[i]).attr("case");
    caseValue = lodash.isEmpty(caseValue) ? "" : caseValue;
    let anchorPair = await KFK.drawConnect(
      jqNode,
      jqTo,
      caseValue,
      allowConnectPoints[0],
      allowConnectPoints[1],
      true
    );
    //anchorPair返回一个包含两个数字的数组,第一个数字标识父节点的锚点位置,第二个数字标识子节点的锚点位置
    anchorPositions.push(anchorPair[0]);
  }

  //如果是双边画线,则需要找出那些父节点
  if (bothside) {
    let guiLinks_toMe = KFK.tpl.find(`.link[to="${myId}"]`);

    let anchorPositions = [];
    for (let i = 0; i < guiLinks_toMe.length; i++) {
      let fromId = $(guiLinks_toMe[i]).attr("from");
      let jqFrom = $(`#${fromId}`);
      let caseValue = $(guiLinks_toMe[i]).attr("case");
      caseValue = lodash.isEmpty(caseValue) ? "" : caseValue;
      let anchorPair = await KFK.drawConnect(
        jqFrom,
        jqNode,
        caseValue,
        allowConnectPoints[2],
        allowConnectPoints[3],
        true
      );
      anchorPositions.push(anchorPair[0]);
    }
  }
};


KFK.getNodeDefaultSize = function (nodeType, variant) {
  var ret = {w: 100, h: 40};
  if (
    KFK.config.defaultSize[nodeType] &&
    KFK.config.defaultSize[nodeType][variant] &&
    KFK.config.defaultSize[nodeType][variant].width &&
    KFK.config.defaultSize[nodeType][variant].height
  ) {
    ret = {
      w: KFK.config.defaultSize[nodeType][variant].width,
      h: KFK.config.defaultSize[nodeType][variant].height,
    };
  } else if (
    KFK.config.node[nodeType] &&
    KFK.config.node[nodeType].style &&
    KFK.config.node[nodeType].style.width &&
    KFK.config.node[nodeType].style.height
  ) {
    ret = {
      w: KFK.config.node[nodeType].style.width,
      h: KFK.config.node[nodeType].style.height,
    };
  } else {
    ret = {
      w: 100,
      h: 40,
    };
  }
  return ret;
};

//用于对已有的nodeEvent进行修改控制，如enable, disable, destroy
//action: one of resizable/droppable/draggable
//cmd: one of enable, disable destroy
KFK.updateNodeEvent = function (jqNode, action, cmd) {
  if (action === "resizable") {
    if (cocoConfig.node[jqNode.attr("nodetype")].resizable) {
      jqNode.resizable(cmd);
    }
  } else if (action === "droppable") {
    if (cocoConfig.node[jqNode.attr("nodetype")].droppable) {
      jqNode.droppable(cmd);
    }
  } else if (action === "draggable") {
    jqNode.draggable(cmd);
  }
};

/**
 * 只是检查是否不包含“noedit" class, 以及是否有innerlink属性
 */
KFK.updateable = function (jqNode) {
  if (KFK.isNotA(jqNode, "noedit") || jqNode.attr("innerlink")) {
    return true;
  } else {
    return false;
  }
};

KFK.procNodeDoubleClick = async function (evt, jqNodeDIV) {
  evt.stopPropagation();
  evt.preventDefault();
  //Don't edit todolist direclty, show edit dialog instead.
  //double click to edit
  if (jqNodeDIV.hasClass("noedit")) {
    if (jqNodeDIV.attr("id") === "coco_todo") {
      KFK.toggleInputFor("todo");
      await KFK.showMsgInputDlg();
    } else if (jqNodeDIV.attr("id") === "coco_chat") {
      KFK.toggleInputFor("chat");
      await KFK.showMsgInputDlg();
    }
    return;
  }
  if (KFK.anyLocked(jqNodeDIV)) return;
  //下面这句判断其实没用，因为在演示模式和概览模式下，都加了遮罩，点不到nodeDIV上
  if (KFK.inPresentingMode === true || KFK.inOverviewMode) return;

  KFK.startNodeEditing(jqNodeDIV);
};

KFK.driveNodeBalls = function (jqNodeDIV) {
  let tplLinks = KFK.tpl.find(`.link[from="${jqNodeDIV.attr("id")}"]`);
  let needToAdd = tplLinks.length - KFK.tmpBalls.length;
  for (let i = 0; i < needToAdd; i++) {
    let tmpBall = KFK.ball.clone();
    let ballId = "ball_" + KFK.myuid();
    tmpBall.attr("id", ballId);
    tmpBall.addClass(ballId);
    tmpBall.addTo(KFK.ball.parent());
    KFK.tmpBalls.push(tmpBall);
  }
  for (let i = 0; i < tplLinks.length; i++) {
    KFK.tmpBalls[i].removeClass("noshow");
    KFK.tmpBalls[i].fill(KFK.config.connect.styles.style1.normal.color);
  }
  tplLinks.each(async (index, link) => {
    let jLink = $(link);
    let connectSelector = `.connect_${jLink.attr("from")}_${jLink.attr("to")}`;
    let svgConnect = KFK.svgDraw.findOne(connectSelector);
    let length = svgConnect.length();
    let runner_duration = 1500;
    let runner = KFK.tmpBalls[index].animate({duration: runner_duration, when: "now"});
    runner.ease(">");
    runner.during(function (pos) {
      var p = svgConnect.pointAt(pos * length);
      KFK.tmpBalls[index].center(p.x, p.y);
    }).loop(3);
  });
};

KFK.stopNodeBalls = async function () {
  for (let i = 0; i < KFK.tmpBalls.length; i++) {
    await KFK.tmpBalls[i].timeline().stop();
    await KFK.tmpBalls[i].addClass("noshow");
  }
};

KFK.setNodeEventHandler = async function (jqNodeDIV, callback) {

  //drag node
  try {
    var click = {
      x: 0,
      y: 0,
    };
    jqNodeDIV.off("mouseover mouseout");
    jqNodeDIV.on("mouseover", () => {
      KFK.driveNodeBalls(jqNodeDIV);
    });
    jqNodeDIV.on("mouseout", async () => {
      await KFK.stopNodeBalls();
    });
    jqNodeDIV.draggable({
      scroll: true,
      containment: "parent",
      start: (evt, ui) => {
        KFK.stopNodeBalls();
        click.x = evt.clientX;
        click.y = evt.clientY;
        KFK.fromJQ = jqNodeDIV.clone();
        evt.stopImmediatePropagation();
        evt.stopPropagation();
        KFK.originZIndex = KFK.getZIndex(jqNodeDIV);
        jqNodeDIV.css("z-index", "99999");
        KFK.dragging = true;
        KFK.positionBeforeDrag = {
          x: KFK.divLeft(jqNodeDIV),
          y: KFK.divTop(jqNodeDIV),
        };
      },
      drag: (evt, ui) => {
        var original = ui.originalPosition;

        // jQuery will simply use the same object we alter here
        ui.position = {
          left: (evt.clientX - click.x + original.left) / KFK.scaleRatio,
          top: (evt.clientY - click.y + original.top) / KFK.scaleRatio,
        };
      },
      stop: async (evt, ui) => {
        KFK.dragging = false;
        await KFK.stopNodeBalls();

        //如果做了这个标记，则不再做U操作，否则，节点又会被同步回来
        if (jqNodeDIV.shouldBeDeleted === true) {
          return;
        }
        if (KFK.updateable(jqNodeDIV) === false) {
          console.log("upateable === false");
          return;
        }
        if (KFK.APP.model.viewConfig.snap) {
          let newPos = KFK.DivStyler.snapToGrid(jqNodeDIV);
          KFK.DivStyler.moveDivTo(jqNodeDIV, newPos.x, newPos.y);
        }
        if (KFK.AdvOps.existsInGroup(KFK.selectedDIVs, jqNodeDIV) === false) {
          KFK.cancelAlreadySelected();
        }
        KFK.startTrx();
        try {
          let deltaOfDragging = {
            x: KFK.divLeft(jqNodeDIV) - KFK.positionBeforeDrag.x,
            y: KFK.divTop(jqNodeDIV) - KFK.positionBeforeDrag.y,
          };

          let tobeMovedNodes = [];
          //如果按住了shiftkey, 则只移动当前node, 不移动其他被选定Node
          //move nodes, move divs, drag divs end, end drag divs
          // dragend drag end
          if (!evt.shiftKey) {
            //拖动其它被同时选中的对象
            KFK.shouldMovedInParalles = [];
            let treeMap = new Map();
            for (let i = 0; i < KFK.selectedDIVs.length; i++) {
              if (KFK.selectedDIVs[i].attr("id") !== jqNodeDIV.attr("id")) {
                KFK.shouldMovedInParalles.push(KFK.selectedDIVs[i]);
              }
            }

            for (let i = 0; i < KFK.selectedDIVs.length; i++) {
              await KFK.AdvOps.getDescendants(
                KFK.selectedDIVs[i],
                KFK.selectedDIVs[i],
                KFK.shouldMovedInParalles,
                treeMap
              );
            }

            if (KFK.shouldMovedInParalles.length > 0) {
              KFK.debug("others should be moved");
              //要移动的个数是被选中的全部
              for (let i = 0; i < KFK.shouldMovedInParalles.length; i++) {
                let tmpFromJQ = KFK.shouldMovedInParalles[i].clone();
                //虽然这出跳过了被拖动的节点，但在后面这个节点一样要被移动
                //因此，所有被移动的节点数量就是所有被选中的节点数量
                if (KFK.updateable(KFK.shouldMovedInParalles[i])) {
                  let tmp = KFK.shouldMovedInParalles[i].clone();
                  KFK.DivStyler.moveDivByDelta(
                    KFK.shouldMovedInParalles[i],
                    deltaOfDragging.x,
                    deltaOfDragging.y
                  );
                  tobeMovedNodes.push({
                    from: tmp,
                    to: KFK.shouldMovedInParalles[i],
                  });
                  /*
                  await KFK.syncNodePut(
                    "U",
                    KFK.shouldMovedInParalles[i].clone(),
                    "move following selected",
                    tmpFromJQ,
                    false
                  );
                  */
                }
              }
              for (let i = 0; i < KFK.shouldMovedInParalles.length; i++) {
                KFK.redrawLinkLines(
                  KFK.shouldMovedInParalles[i],
                  "codrag",
                  true
                );
              }
            }
          }

          KFK.afterDragging = true;
          jqNodeDIV.css("z-index", KFK.originZIndex);
          KFK.originZIndex = 1;
          //节点移动后，对连接到节点上的连接线重新划线
          KFK.redrawLinkLines(jqNodeDIV, "after moving");
          KFK.setSelectedNodesBoundingRect();

          tobeMovedNodes.push({
            from: KFK.fromJQ,
            to: jqNodeDIV,
          });

        } finally {
          console.log("END DRAG TRX");
          KFK.yarkOpHistory({
            obj: 'node',
            from: KFK.fromJQ.clone(),
            to: jqNodeDIV.clone()
          });
          KFK.onChange("Dragged");
          KFK.focusOnNode(jqNodeDIV);
          KFK.endTrx();
        }
      },
    });
  } catch (error) {
    console.error(error);
  }

  try {
    jqNodeDIV.hover(
      () => {
        $(document.body).css("cursor", "pointer");
        KFK.hoverJqDiv(jqNodeDIV);
        KFK.onC3 = true;
      },
      () => {
        $(document.body).css("cursor", "default");
        // jqNodeDIV.resizable('disable');
        KFK.hoverJqDiv(null);
        KFK.onC3 = true;
      }
    );
  } catch (error) {
    console.error(error);
  }

  try {
    //防止点在节点上，以后，画出框选框
    jqNodeDIV.mousedown((evt) => {
      evt.stopImmediatePropagation();
      evt.stopPropagation();
    });
  } catch (error) {
    console.error(error);
  }
  //click node
  //click on node
  try {
    jqNodeDIV.click(async (evt) => {
      KFK.hide($(".clickOuterToHide"));
      if (KFK.edittingJQ) {
        await KFK.handleOutsideClick(evt);
      }


      KFK.pickedShape = null;
      KFK.afterDragging = false;
      KFK.afterResizing = false;
      evt.stopImmediatePropagation();
      evt.stopPropagation();
      KFK.focusOnNode(jqNodeDIV);
      if (KFK.mode === "pointer") {
        KFK.selectNodeOnClick(jqNodeDIV, evt.shiftKey);
        console.log("Set node property here ...");
      } else if (KFK.mode === "connect") {
        if (KFK.afterDragging === false) {
          KFK.yarkLinkNode(jqNodeDIV, evt.shiftKey, "", KFK.FROM_CLIENT);
        } else {
          KFK.afterDragging = true;
        }
        evt.stopImmediatePropagation();
        evt.stopPropagation();
        evt.preventDefault();
        return;
      } else {
        KFK.setMode("pointer");
      }
    });
  } catch (error) {
    console.error(error);
  }

  try {
    //dblclick to edit
    jqNodeDIV.dblclick(async function (evt) {
      await KFK.procNodeDoubleClick(evt, jqNodeDIV);
    });
  } catch (error) {
    console.error(error);
  }

  if (callback) await callback();
};

/**
 * 从一个节点，向其attr jump所记录ID的节点跳转
 */
KFK.tryToJump = async function (jqDIV) {
  if (NotSet(jqDIV)) jqDIV = KFK.getFocusHoverLastCreate();
  if (jqDIV && jqDIV.attr("jump")) {
    let followDIV = $(`#${jqDIV.attr("jump")}`);
    if (followDIV.length <= 0) {
      return;
    }
    followDIV = followDIV.first();
    await KFK.addFromTo(jqDIV, followDIV);
    KFK.scrollToNode(followDIV);
  }
};

KFK.tryToJumpBack = function () {
  KFK.jumpToPrevious(false);
};

// getSelection、createRange兼容
KFK.isSupportRange = function () {
  return (
    typeof document.createRange === "function" ||
    typeof window.getSelection === "function"
  );
};

KFK.getCurrentRange = function () {
  let range = null;
  let selection = null;
  if (KFK.isSupportRange()) {
    selection = document.getSelection();
    if (selection.getRangeAt && selection.rangeCount) {
      range = document.getSelection().getRangeAt(0);
    }
  } else {
    range = document.selection.createRange();
  }
  return range;
};
KFK.insertHtmlAfterRange = function (html) {
  let selection = null;
  let range = null;
  if (KFK.isSupportRange()) {
    // IE > 9 and 其它浏览器
    selection = document.getSelection();
    if (selection.getRangeAt && selection.rangeCount) {
      let fragment, node, lastNode;
      range = selection.getRangeAt(0);
      range.deleteContents();
      let el = document.createElement("span");
      el.innerHTML = html;
      // 创建空文档对象,IE > 8支持documentFragment
      fragment = document.createDocumentFragment();

      while ((node = el.firstChild)) {
        lastNode = fragment.appendChild(node);
      }
      range.insertNode(fragment);

      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  } else if (document.selection && document.selection.type != "Control") {
    // IE < 9
    document.selection.createRange().pasteHTML(html);
  }
};

KFK.cleanTextInput = function (jInner, allowBR) {
  let html = jInner.prop("innerHTML");
  html = html.replace("<div>", " ");
  html = html.replace("</div>", " ");
  if (allowBR) {
    html = html.replace(/<br><br>$/, "<br>");
    html = html + "<br><br>";
  } else {
    html = html.replace("<br>", "");
  }
  jInner.prop("innerHTML", html);
  // KFK.insertHtmlAfterRange('<br><br>');
  if (window.getSelection) {
    //ie11 10 9 ff safari
    jInner.focus();
    var range = window.getSelection(); //创建range
    range.selectAllChildren(jInner[0]); //range 选择obj下所有子内容
    range.collapseToEnd(); //光标移至最后
  } else if (document.selection) {
    //ie10 9 8 7 6 5
    var range = document.selection.createRange(); //创建选择对象
    //var range = document.body.createTextRange();
    range.moveToElementText(jInner[0]); //range定位到obj
    range.collapse(false); //光标移至最后
    range.select();
  }
};

//启动单行文字编辑
KFK.startInlineEditing = function (jqNodeDIV) {
  KFK.isEditting = true;
  jqNodeDIV.find(".innerobj").focus();
  KFK.inlineEditor = jqNodeDIV;
  let allowBR = jqNodeDIV.attr("nodetype") !== "text";
  //div keydown
  jqNodeDIV.keydown(function (evt) {
    if (evt.keyCode === 13 && (evt.shiftKey || evt.ctrlKey || evt.metaKey)) {
      let jInner = jqNodeDIV.find(".innerobj");
      KFK.cleanTextInput(jInner, allowBR);
      evt.stopPropagation();
      evt.preventDefault();
    } else if (evt.keyCode === 13) {
      //ENTER || PageUp
      let jInner = jqNodeDIV.find(".innerobj");
      KFK.cleanTextInput(jInner, allowBR);
      evt.stopPropagation();
      evt.preventDefault();
    } else if (evt.keyCode == 35 || evt.keyCode === 34) {
      //END  || PageDown
      //阻止浏览器滚动窗口的缺省动作
      evt.stopPropagation();
      evt.preventDefault();
    } else if (evt.keyCode === 36 || evt.keyCode === 33 || evt.keyCode === 32) {
      //HOME
      //阻止浏览器滚动窗口的缺省动作
      evt.stopPropagation();
      evt.preventDefault();
      // let jInner = jqNodeDIV.find('.innerobj');
      // if (window.getSelection) { //ie11 10 9 ff safari
      //   jInner.focus();
      //   var range = window.getSelection(); //创建range
      //   range.selectAllChildren(jInner[0]); //range 选择obj下所有子内容
      //   range.collapseToStart(); //光标移至最后
      // } else if (document.selection) { //ie10 9 8 7 6 5
      //   var range = document.selection.createRange(); //创建选择对象
      //   //var range = document.body.createTextRange();
      //   range.moveToElementText(jInner[0]); //range定位到obj
      //   range.moveEnd(jInner[0], 0);
      //   range.moveStart(jInner[0], 0);
      //   range.collapse(); //光标移至最后
      // }
    }
    // on esc do not set value back to node
    // if (evt.keyCode === 27) {
    //   console.log("presessed ESC");
    // }
  });
};
KFK.endInlineEditing = function () {
  KFK.isEditting = false;
  KFK.inlineEditor = null;
};

/**
 * 开始节点编辑，根据节点类型，相应使用不同的编辑器
 * 单行文字用inline editing，  textblock和yellowtip用textarea
 */
KFK.startNodeEditing = async function (jqNodeDIV, enterSelect) {
  if (KFK.anyLocked(jqNodeDIV)) return;
  if (jqNodeDIV.attr("nodetype") === "text") {
    KFK.startInlineEditing(jqNodeDIV);
  } else KFK.startNodeEditing_withTextArea(jqNodeDIV, enterSelect);
};

KFK.startNodeEditing_withTextArea = function (jqNodeDIV, enterSelect) {
  if (getBoolean(jqNodeDIV.attr("edittable")) && KFK.notAnyLocked(jqNodeDIV)) {
    KFK.fromJQ = jqNodeDIV.clone();
    let innerText = el(jqNodeDIV.find(".innerobj"));
    KFK.editTextNodeWithTextArea(innerText, el(jqNodeDIV), enterSelect);
  }
};

KFK.divLeft = function (jqDiv) {
  return KFK.unpx(jqDiv.css("left"));
};
KFK.divCenter = function (jqDiv) {
  return KFK.divLeft(jqDiv) + KFK.divWidth(jqDiv) * 0.5;
};
KFK.divRight = function (jqDiv) {
  return KFK.divLeft(jqDiv) + KFK.divWidth(jqDiv);
};
KFK.divTop = function (jqDiv) {
  return KFK.unpx(jqDiv.css("top"));
};
KFK.divMiddle = function (jqDiv) {
  return KFK.divTop(jqDiv) + KFK.divHeight(jqDiv) * 0.5;
};
KFK.divBottom = function (jqDiv) {
  return KFK.divTop(jqDiv) + KFK.divHeight(jqDiv);
};
KFK.divWidth = function (jqDiv) {
  // return jqDiv.width();
  return KFK.unpx(jqDiv.css("width"));
};
KFK.divHeight = function (jqDiv) {
  // return jqDiv.height();
  return KFK.unpx(jqDiv.css("height"));
};
KFK.divRect = function (jqDiv) {
  return {
    left: KFK.divLeft(jqDiv),
    top: KFK.divTop(jqDiv),
    right: KFK.divRight(jqDiv),
    bottom: KFK.divBottom(jqDiv),
    center: KFK.divCenter(jqDiv),
    middle: KFK.divMiddle(jqDiv),
    width: KFK.divWidth(jqDiv),
    height: KFK.divHeight(jqDiv),
  };
};
KFK.divMove = function (jqDiv, left, top) {
  jqDiv.css({
    left: left,
    top: top,
  });
};
KFK.divDMove = function (jqDiv, deltaX, deltaY) {
  let left = KFK.divLeft(jqDiv);
  let top = KFK.divTop(jqDiv);
  jqDiv.css({
    left: left + deltaX,
    top: top + deltaY,
  });
};

/**
 * 得到所选DIVS中没有被锁定的div的个数
 * @param divs  如为undefined，则自动处理KFK.selectedDIVs
 */
KFK.getUnlockedCount = function (divs) {
  if (divs === undefined) {
    divs = KFK.selectedDIVs;
  }
  let numberOfNotLocked = 0;
  for (let i = 0; i < divs.length; i++) {
    if (KFK.anyLocked(divs[i]) === false) {
      numberOfNotLocked = numberOfNotLocked + 1;
    }
  }
  return numberOfNotLocked;
};

KFK.sameSize = async function (direction) {
  KFK.DivStyler ?
    KFK.DivStyler.sameSize(direction) :
    import("./divStyler").then((pack) => {
      KFK.DivStyler = pack.DivStyler;
      KFK.DivStyler.sameSize(direction);
    });
};
KFK.arrangeNodes = async function (direction) {
  KFK.DivStyler ?
    KFK.DivStyler.arrangeNodes(direction) :
    import("./divStyler").then((pack) => {
      KFK.DivStyler = pack.DivStyler;
      KFK.DivStyler.arrangeNodes(direction);
    });
};

KFK.scroll_posX = function (x) {
  return x + KFK.scrollContainer.scrollLeft();
};
KFK.scroll_posY = function (y) {
  return y + KFK.scrollContainer.scrollTop();
};

KFK.offsetLineDataAttr = function (lineDIV, offset) {
  let x1 = parseInt($(lineDIV).attr("x1"));
  let y1 = parseInt($(lineDIV).attr("y1"));
  let x2 = parseInt($(lineDIV).attr("x2"));
  let y2 = parseInt($(lineDIV).attr("y2"));
  x1 += offset.x;
  y1 += offset.y;
  x2 += offset.x;
  y2 += offset.y;
  $(lineDIV).attr("x1", x1);
  $(lineDIV).attr("y1", y1);
  $(lineDIV).attr("x2", x2);
  $(lineDIV).attr("y2", y2);
};

//Delete node  remove node
KFK.deleteNode_request = async function (jqDIV) {
  KFK.stopNodeBalls();
  let myId = jqDIV.attr("id");
  let links = KFK.tpl.find(`.link[from="${myId}"], .link[to="${myId}"]`);
  console.log(links);
  KFK.yarkOpHistory(
    {
      obj: 'node',
      from: jqDIV,
      to: null,
      links: links
    }
  );
  await KFK.deleteLinks(jqDIV, links, true);
  jqDIV.remove();
  KFK.onChange("Delete");
};

KFK.deleteLinks = async function (jqDIV, links) {
  links.each(async (index, link) => {
    let jLink = $(link);
    let connect_id = `connect_${jLink.attr("from")}_${jLink.attr("to")}`;
    await KFK.removeConnectById(connect_id);
  });
};

/**
 * 去掉一个div的所有链接
 * @param jqDIV 元素
 * @param forDelete 这个节点是要被删除吗？
 */
KFK.cleanUpConnection = async function (jqDIV, forDelete = false) {
  //删除linkto线条
  let myId = jqDIV.attr("id");
  let toIds = KFK.stringToArray(jqDIV.attr("linkto"));
  toIds.forEach((toId) => {
    let lineClassSelector = `.connect_${myId}_${toId}`;
    let triClassSelector = `.connect_${myId}_${toId}_triangle`;
    try {
      KFK.svgDraw.findOne(lineClassSelector).remove();
    } catch (err) {} finally {}
    try {
      KFK.svgDraw.findOne(triClassSelector).remove();
    } catch (err) {} finally {}
  });
  //如果这个节点不是要删除，那么它的变化要被记录
  if (forDelete === false) {
    if (toIds.length > 0) {
      let oldJq = jqDIV.clone();
      jqDIV.attr("linkto", "");
      await KFK.syncNodePut(
        "U",
        jqDIV.clone(),
        "remove connect",
        oldJq,
        false,
        0,
        1
      );
    }
  }

  //重置全局ZIndex 同时，删除那些链接到当前节点的连接线
  let myZI = KFK.getZIndex(jqDIV);
  let count = 0;
  let allnodes = KFK.JC3.find(".kfknode");
  let tmp1 = "";
  let tmp2 = "";
  allnodes.each(async (index, aDIV) => {
    count += 1;
    let jqDIV = $(aDIV);
    let fromId = jqDIV.attr("id");
    let tmpzi = KFK.getZIndex(jqDIV);
    //if (tmpzi > myZI) {
    //KFK.setZIndex(jqDIV, tmpzi - 1);
    //}
    tmp1 = jqDIV.attr("linkto");
    let arr = KFK.stringToArray(tmp1);
    if (arr.indexOf(myId) >= 0) {
      let oldJq = jqDIV.clone();
      arr.splice(arr.indexOf(myId), 1);
      jqDIV.attr("linkto", arr.join(","));
      await KFK.syncNodePut(
        "U",
        jqDIV.clone(),
        "remove connect",
        oldJq,
        false,
        0,
        1
      );

      let lineClassSelector = `.connect_${fromId}_${myId}`;
      let triClassSelector = `.connect_${fromId}_${myId}_triangle`;
      try {
        KFK.svgDraw.findOne(lineClassSelector).remove();
      } catch (err) {} finally {}
      try {
        KFK.svgDraw.findOne(triClassSelector).remove();
      } catch (err) {} finally {}
    }
  });
  let nodeIndex = KFK.selectedDIVs.indexOf(jqDIV);
  if (nodeIndex >= 0) {
    KFK.selectedDIVs.splice(nodeIndex, 1);
    KFK.setSelectedNodesBoundingRect();
  }
};

KFK._deleteShape = async function (svgLine) {
  svgLine.attr({
    "stroke-width": svgLine.attr("origin-width"),
  });
  await KFK.syncLinePut("D", svgLine, "delete shape", null, false);
};

KFK.getNodeIdsFromConnectId = function (cid) {
  let nid = cid;
  let tid = cid;
  nid = nid.substr(nid.indexOf("_") + 1);
  nid = nid.substr(0, nid.indexOf("_"));
  tid = tid.substr(tid.lastIndexOf("_") + 1);
  return [nid, tid];
};

/**
 * 删除hover或者selected 节点
 * @param evt oncut事件
 * @param cutMode， 是否是cut方式，cut方式下，删除前先复制
 */
KFK.deleteObjects = async function (evt, cutMode = false) {
  //如果有多个节点被选择，则优先进行多项删除
  if (KFK.docIsReadOnly()) return;
  let affectedParentsArray = [];
  KFK.startTrx();
  try {
    KFK.copyCandidateDIVs = [];
    KFK.copyCandidateLines = [];
    if (KFK.selectedDIVs.length > 1 || KFK.selectedShapes.length > 1) {
      if (KFK.selectedDIVs.length > 1) {
        KFK.debug("delete, selected DIVS >1");
        let notLockedCount = 0;
        for (let i = 0; i < KFK.selectedDIVs.length; i++) {
          if (KFK.anyLocked(KFK.selectedDIVs[i]) === false) {
            notLockedCount += 1;
          }
        }
        KFK.debug(
          `没锁定的节点数量是 ${notLockedCount}, 一共是${KFK.selectedDIVs.length}`
        );
        if (notLockedCount > 0) {
          let delSer = 0;
          let delCount = notLockedCount;
          for (let i = 0; i < KFK.selectedDIVs.length;) {
            if (KFK.anyLocked(KFK.selectedDIVs[i]) === false) {
              if (cutMode === true) {
                //copy时不过滤nocopy
                let jTemp = KFK.selectedDIVs[i].clone();
                let jTitle = jTemp.find(".coco_title");
                if (jTitle.length > 0) {
                  jTitle.text(jTitle.text() + "的复制");
                }
                KFK.copyCandidateDIVs.push(jTemp);
              }
              affectedParentsArray.push([
                ...KFK.getParent(KFK.selectedDIVs[i]),
              ]);
              await KFK.syncNodePut(
                "D",
                KFK.selectedDIVs[i],
                "delete node",
                null,
                false,
                i,
                delCount
              );
              i++;
            }
          }

          affectedParentsArray = KFK.AdvOps.uniquefyKfkObjectArray(
            affectedParentsArray
          );
          //TODO: for every affected Parent, re-layout it's children if it's a autolayout node
          //TODO: place autolayout icon on the right or left of parent node
          console.log(affectedParentsArray.length);
        }
      }
      if (KFK.selectedShapes.length > 1) {
        KFK.debug("delete, selected Shapes >1");
        let notLockedCount = 0;
        for (let i = 0; i < KFK.selectedShapes.length; i++) {
          if (KFK.lineLocked(KFK.selectedShapes[i]) === false) {
            notLockedCount += 1;
          }
        }
        KFK.debug(
          `没锁定的Shape数量是 ${notLockedCount}, 一共是${KFK.selectedShapes.length}`
        );
        if (notLockedCount > 0) {
          let delSer = 0;
          let delCount = notLockedCount;
          for (let i = 0; i < KFK.selectedShapes.length;) {
            if (KFK.lineLocked(KFK.selectedShapes[i]) === false) {
              KFK._deleteShape(KFK.selectedShapes[i]);
              i++;
            }
          }
        }
      }
    } else {
      //没有多项选择时，则进行单项删除
      //首先，先处理鼠标滑过的NODE
      if (KFK.hoverJqDiv()) {
        let theDIV = KFK.hoverJqDiv();
        if (KFK.anyLocked(theDIV)) return;
        let jTemp = theDIV.clone();
        let jTitle = jTemp.find(".coco_title");
        if (jTitle.length > 0) {
          jTitle.text(jTitle.text() + "的复制");
        }
        KFK.copyCandidateDIVs = [jTemp];
        //这个地方加上shouldBeDeleted标志应该没有必要，不过还是加一下
        //在拖动覆盖其它节点，内容合并后删除被拖动节点时，这个标志是一定要加的，防止draggable end事件中，重新上传U指令，这样内容又会update回来
        theDIV.shouldBeDeleted = true;
        KFK.deleteNode_request(theDIV);
        KFK.hoverJqDiv(null);
      } else if (KFK.hoveredConnectId) {
        //delete connect
        //最后看鼠标滑过的connect（节点间连接线）
        if (KFK.docIsReadOnly()) return;
        console.log("Delete a Connection...");
        //Find ids of the two nodes connected by this connect.
        let tmpNodeIdPair = KFK.getNodeIdsFromConnectId(KFK.hoveredConnectId);
        let nid = tmpNodeIdPair[0];
        let tid = tmpNodeIdPair[1];
        //let jqFrom = $(`#${nid}`);
        //let jqTo = $(`#${tid}`);
        //if (KFK.anyLocked(jqFrom)) return;
        //if (KFK.anyLocked(jqTo)) return;
        //let oldJq = jqFrom.clone();
        //Remove this connect from the FROM node
        //KFK.removeLinkTo(jqFrom, tid);
        //let connect_id = `connect_${nid}_${tid}`;
        //Remove ths connect drawing
        let tmp = KFK.tpl.find(`.link[from="${nid}"][to="${tid}"]`);
        let jTmp = $(tmp).clone();
        await KFK.removeConnectById(KFK.hoveredConnectId);
        KFK.yarkOpHistory(
          {
            obj: 'link',
            from: jTmp,
            to: null
          }
        );
        //KFK.redrawLinkLines(jqFrom);
        //删除一个connect, 则jqFrom被修改
        KFK.onChange("Delete Connect");
      }
    }
    if (KFK.copyCandidateDIVs.length > 0 || KFK.copyCandidateLines.length > 0) {
      //判断是否是cut， 而不是delete， cut有clipbaordData, delete没有
      if (evt && evt.clipboardData) {
        evt.clipboardData.setData("text/plain", "usediv");
        evt.clipboardData.setData("text/html", "usediv");
      }
    }
    evt.preventDefault();
    KFK.holdEvent(evt);
  } catch (error) {
    console.error(error);
  } finally {
    KFK.endTrx();
  }
};

/**
 * get Hovered, if null, then focused, if null, then lastcraeted node
 */
KFK.getHoverFocusLastCreateInner = () => {
  let div = KFK.getHoverFocusLastCreate();
  if (NotSet(div)) return undefined;
  let inner = div.find(".innerobj");
  if (inner.length > 0) return inner;
  else return undefined;
};
KFK.getHoverFocusLastCreate = () => {
  let ret = KFK.hoverJqDiv();
  if (NotSet(ret)) {
    ret = KFK.lastFocusOnJqNode;
    if (NotSet(ret)) {
      ret = KFK.lastCreatedJqNode;
      if (NotSet(ret)) {
        ret = undefined;
      }
    }
  }
  return ret;
};

KFK.getFocusHoverLastCreate = () => {
  let ret = KFK.lastFocusOnJqNode;
  if (NotSet(ret)) {
    ret = KFK.hoverJqDiv();
    if (NotSet(ret)) {
      ret = KFK.lastCreatedJqNode;
      if (NotSet(ret)) {
        ret = undefined;
      }
    }
  }
  return ret;
};

/**
 * 进入当前hover对象的编辑状态。
 * 锁定状态的对象不可编辑。
 * todolist，如果是 待办， 则打开底部编辑窗，进行中，已完成，无动作
 *
 * @param evt  键盘事件，有document的keydown事件处理传递过来
 * @param enterSelect 之前考虑用来控制开始编辑后是否全选，现在看好像没什么用，缺省全选了
 */
KFK.editFocusedThenHoveredObject = async function (evt, enterSelect = false) {
  //如果是todolist, 不允许编辑
  let jqNodeDIV = KFK.getFocusHoverLastCreate();
  if (NotSet(jqNodeDIV)) return;
  if (KFK.anyLocked(jqNodeDIV)) return;
  //Don't edit todolist directly, show edit dialog instead.

  if (jqNodeDIV.hasClass("noedit")) {
    if (jqNodeDIV.attr("id") === "coco_todo") {
      KFK.toggleInputFor("todo");
      await KFK.showMsgInputDlg();
    } else if (jqNodeDIV.attr("id") === "coco_chat") {
      KFK.toggleInputFor("chat");
      await KFK.showMsgInputDlg();
    }
    return;
  }
  //回车的evt要组织掉,否则,在textarea.select()时,会导致文字丢失
  evt.preventDefault();
  evt.stopImmediatePropagation();
  evt.stopPropagation();
  KFK.startNodeEditing(jqNodeDIV, enterSelect);
};

/**
 * 复制对象
 */
KFK.duplicateHoverObject = async function (evt, action = undefined) {
  KFK.debug("entered duplicateHoverObject");
  if (KFK.docIsReadOnly()) {
    KFK.debug("docIsReady, no duplicate");
    return;
  }
  let offset = {
    x: 0,
    y: 0,
  };
  if (action === "copy") {
    if (KFK.selectedDIVs.length > 1) {
      //优先多选
      KFK.debug("multiple nodes were selected");
      //过滤掉TODOLISTDIV/chatmessage 等nocopy DIV
      let filteredDIVs = KFK.selectedDIVs.filter((div) => {
        return div.hasClass("nocopy") === false;
      });
      KFK.copyCandidateDIVs = filteredDIVs.map((div) => {
        let jTemp = div.clone();
        let jTitle = jTemp.find(".coco_title");
        if (jTitle.length > 0) {
          jTitle.text(jTitle.text() + "的复制");
        }
        return jTemp;
      });
      return true;
    } else if (KFK.getPropertyApplyToJqNode()) {
      //然后selected
      //过滤掉TODOLISTDIV
      if (KFK.getPropertyApplyToJqNode().hasClass("nocopy")) {
        KFK.copyCandidateDIVs = [];
        KFK.copyCandidateLines = [];
      } else {
        let jTemp = KFK.getPropertyApplyToJqNode().clone();
        let jTitle = jTemp.find(".coco_title");
        if (jTitle.length > 0) {
          jTitle.text(jTitle.text() + "的复制");
        }
        KFK.copyCandidateDIVs = [jTemp];
        KFK.copyCandidateLines = [];
      }
      return true;
    } else if (
      KFK.hoverSvgLine() &&
      (action === undefined || action === "copy")
    ) {
      KFK.hoverSvgLine().attr({
        "stroke-width": KFK.hoverSvgLine().attr("origin-width"),
      });
      KFK.copyCandidateLines = [KFK.hoverSvgLine().clone()];
      KFK.copyCandidateDIVs = [];
      //下面这句代码在第一次按META-D时就粘贴了一条,有些不用,
      // await KFK.makeACopyOfLine(KFK.lineToCopy, evt.shiftKey);
      return true;
    } else {
      return false;
    }
  } else if (action === "paste") {
    if (KFK.copyCandidateDIVs && KFK.copyCandidateDIVs.length > 0) {
      await KFK.makeCopyOfJQs(KFK.copyCandidateDIVs, evt.shiftKey);
    } else if (KFK.copyCandidateLines && KFK.copyCandidateLines.length > 0) {
      await KFK.makeCopyOfLines(KFK.copyCandidateLines, evt.shiftKey);
    } else {
      KFK.debug("Nothing to paste");
    }
    // if (KFK.jqToCopy) {
    // } else if (KFK.lineToCopy) {
    //   await KFK.makeACopyOfLine(KFK.lineToCopy, evt.shiftKey);
    //   //await KFK.makeACopyOfLine(KFK.lineToCopy, evt.shiftKey);
    // }
    return true;
  }
  return true;
  evt.stopPropagation();
};

KFK.makeCopyOfJQs = async function (jqstocopy, shiftKey) {
  //现在是移动指定位置再次META-D才放置对象,因此offset没用.事实上,offset在复制node时就一直没有用到
  let offset = {
    x: 0,
    y: 0,
  };
  let theDIV = el(jqstocopy[0]);

  let startPoint = {
    x: KFK.divLeft(jqstocopy[0]),
    y: KFK.divTop(jqstocopy[0]),
  };
  KFK.startTrx();
  try {
    for (let i = 0; i < jqstocopy.length; i++) {
      let oldJqPos = {
        x: KFK.divLeft(jqstocopy[i]),
        y: KFK.divTop(jqstocopy[i]),
      };
      let deltaX = oldJqPos.x - startPoint.x;
      let deltaY = oldJqPos.y - startPoint.y;
      let jqNewNode = KFK.makeCloneDIV(jqstocopy[i], KFK.myuid(), {
        left: KFK.scalePoint(KFK.scrXToJc3X(KFK.currentMousePos.x))
          - KFK.tplNode_width * 0.5
          + deltaX,

        top: KFK.scalePoint(KFK.scrYToJc3Y(KFK.currentMousePos.y))
          - KFK.tplNode_height * 0.5
          + deltaY,
      });
      KFK.justCreatedJqNode = jqNewNode;
      KFK.lastCreatedJqNode = jqNewNode;

      jqNewNode.appendTo(KFK.C3);
      await KFK.setNodeEventHandler(jqNewNode, async function () {
        if (i === 0) KFK.focusOnNode(jqNewNode);
      });
    }
  } finally {
    KFK.endTrx();
    KFK.onChange("Copy");
  }
  return;
};

KFK.makeCloneDIV = function (orig, newid, newcss) {
  let ret = orig.clone(false);
  ret.attr("id", newid);
  if (newcss) ret.css(newcss);
  KFK.removeNodeEventFootprint(ret);

  return ret;
};
KFK.makeCopyOfLines = async function (linestocopy) {
  let startPoint = {
    x: linestocopy[0].cx(),
    y: linestocopy[0].cy(),
  };
  for (let i = 0; i < linestocopy.length; i++) {
    let newLine = linestocopy[i].clone();
    let deltaX = linestocopy[i].cx() - startPoint.x;
    let deltaY = linestocopy[i].cy() - startPoint.y;

    let newline_id = "shape_" + KFK.myuid();
    let classes = newLine.classes();
    classes.forEach((className, index) => {
      if (className !== "kfkshape") {
        newLine.removeClass(className);
      }
    });
    newLine.attr("id", newline_id);
    newLine.addClass(newline_id);
    //现在是移动指定位置再次META-D才放置对象,因此offset没用.
    //之前的代码在x,y后面分别加了个20, 以便不覆盖到节点
    //现在第一次点取不马上复制了,+offset已经没有了必要
    newLine.center(
      KFK.scalePoint(KFK.scrXToJc3X(KFK.currentMousePos.x)) + deltaX,
      KFK.scalePoint(KFK.scrYToJc3Y(KFK.currentMousePos.y)) + deltaY
    );
    // newLine.addTo(linestocopy[i].parent());
    newLine.addTo(KFK.svgDraw);
    KFK.addShapeEventListner(newLine);
    await KFK.syncLinePut("C", newLine, "duplicate line", null, false);
  }
};
KFK.makeACopyOfLine = async function (linetocopy) {
  let newLine = KFK.lineToCopy.clone();

  let newline_id = "shape_" + KFK.myuid();
  let classes = newLine.classes();
  classes.forEach((className, index) => {
    if (className !== "kfkshape") {
      newLine.removeClass(className);
    }
  });
  newLine.attr("id", newline_id);
  newLine.addClass(newline_id);
  //现在是移动指定位置再次META-D才放置对象,因此offset没用.
  //之前的代码在x,y后面分别加了个20, 以便不覆盖到节点
  //现在第一次点取不马上复制了,+offset已经没有了必要
  //TODO: curentMousePos位置有问题, 现在应该是JC3的了
  newLine.center(
    KFK.scalePoint(KFK.scrXToJc3X(KFK.currentMousePos.x)),
    KFK.scalePoint(KFK.scrYToJc3Y(KFK.currentMousePos.y))
  );
  newLine.addTo(KFK.lineToCopy.parent());
  KFK.addShapeEventListner(newLine);
  await KFK.syncLinePut("C", newLine, "duplicate line", null, false);
};

KFK.getBoundingRectOfSelectedDIVs = function () {
  if (KFK.selectedDIVs.length == 0) return;
  let ret = {
    left: KFK.divLeft(KFK.selectedDIVs[0]),
    top: KFK.divTop(KFK.selectedDIVs[0]),
    right: KFK.divRight(KFK.selectedDIVs[0]),
    bottom: KFK.divBottom(KFK.selectedDIVs[0]),
  };
  for (let i = 0; i < KFK.selectedDIVs.length; i++) {
    let tmpRect = {
      left: KFK.divLeft(KFK.selectedDIVs[i]),
      top: KFK.divTop(KFK.selectedDIVs[i]),
      right: KFK.divRight(KFK.selectedDIVs[i]),
      bottom: KFK.divBottom(KFK.selectedDIVs[i]),
    };
    if (tmpRect.left < ret.left) {
      ret.left = tmpRect.left;
    }
    if (tmpRect.top < ret.top) {
      ret.top = tmpRect.top;
    }
    if (tmpRect.right > ret.right) {
      ret.right = tmpRect.right;
    }
    if (tmpRect.bottom > ret.bottom) {
      ret.bottom = tmpRect.bottom;
    }
  }
  ret.width = ret.right - ret.left;
  ret.height = ret.bottom - ret.top;

  return ret;
};

KFK.getText = function (jqdiv) {
  let text_filter = ".innerobj";
  return jqdiv.find(text_filter).text();
};

KFK.setText = function (jqdiv, text) {
  let text_filter = ".innerobj";
  return jqdiv.find(text_filter).text(text);
};

KFK.jc3PosToJc1Pos = function (pos) {
  return {
    x: pos.x * KFK.scaleRatio + KFK.LeftB,
    y: pos.y * KFK.scaleRatio + KFK.TopB,
  };
};

KFK.jc3XToJc1X = function (x) {
  return x + KFK.LeftB;
};
KFK.jc3YToJc1Y = function (y) {
  return y + KFK.TopB;
};
KFK.jc1XToJc3X = function (x) {
  return x - KFK.LeftB;
};
KFK.jc1YToJc3Y = function (y) {
  return y - KFK.TopB;
};

//Screen pos x to JC3 pos x
KFK.scrXToJc3X = function (x) {
  return KFK.scrXToJc1X(x) - KFK.LeftB;
};
KFK.scrYToJc3Y = function (y) {
  return KFK.scrYToJc1Y(y) - KFK.TopB;
};

//Screen pos x to JC1 pos x
KFK.scrXToJc1X = function (x) {
  return x + KFK.JS1.scrollLeft();
};
KFK.scrYToJc1Y = function (y) {
  return y + KFK.JS1.scrollTop();
};
KFK.jc1XToScrX = function (x) {
  return x - KFK.JS1.scrollLeft();
};
KFK.jc1YToScrY = function (y) {
  return y - KFK.JS1.scrollTop();
};

KFK.saveLocalViewConfig = function () {
  localStorage.setItem("viewConfig", JSON.stringify(KFK.APP.model.viewConfig));
};


KFK.toggleShowGrid = function (checked) {
  if (checked) {
    let bgcolor = $("#containerbkg").css("background-color");
    bgcolor = KFK.secureHexColor(bgcolor);
    KFK.setGridColor(bgcolor);
  } else {
    $("#containerbkg").removeClass("grid1");
    $("#containerbkg").removeClass("grid2");
  }
  KFK.saveLocalViewConfig();
};

KFK.init = async function () {
  if (KFK.inited === true) {
    console.error("KFK.init was called more than once, maybe loadImages error");
    return;
  }
  KFK.debug("Initializing...");
  //KFK.checkBrowser();
  $("body").css("overflow", "scroll");
  $(".showAfterInit").removeClass("showAfterInit");
  try {
    //KFK.loadImages();
    // KFK.loadSvgs();
    KFK.initLayout();
    KFK.initC3();
    KFK.initLineTransformer();
    KFK.initLeftRightPanelEventHandler();
  } catch (error) {
    console.error("Designer initialization error");
    console.error(error);
  }
  KFK.loadModule("AdvOps");
  KFK.loadModule("DivStyler");
  //$("body").css("overflow", "hidden");
  if ($("#S1").length < 1) {
    console.warn("S1 not found, designer is missing, should not happen");
    return;
  }
  KFK.hide(KFK.JC3);

  KFK.addSvgLayer();

  KFK.opstack.splice(0, KFK.opstacklen);
  KFK.opz = -1;
  KFK.setAppData("model", "actionlog", []);

  // KFK.APP.setData("model", "cocodoc", KFK.DocController.getDummyDoc());
  // localStorage.removeItem("cocodoc");

  console.log("Add document event handler");
  KFK.addDocumentEventHandler();
  KFK.focusOnC3();
  KFK.cancelAlreadySelected();

  //需要在explorer状态下隐藏的，都可以加上noshow, 在进入Designer时，noshow会被去掉
  //并以动画形式显示出来
  $(".padlayout").removeClass("noshow");
  $(".padlayout").fadeIn(1000, function () {
    // Animation complete
  });

  if (KFK.docIsReadOnly()) {
    $('#leftPanel').addClass("noshow");
  }
  if (KFK.tplid === "inner") {
    await KFK.loadWorkflow(KFK.wfid);
  } else {
    await KFK.loadDoc(KFK.tplid);
  }
};

KFK.loadDoc = async function (tplid) {
  try {
    KFK.hide(KFK.JC3);
    /*
    Client.setSessionToken();
    Client.readTemplate(tplid).then(async (tplobj) => {
      KFK.currentTplId = tplid;
      KFK.tpl = $(tplobj.doc);
      let nodes = KFK.tpl.find(".node");
      nodes.addClass("kfknode");
      await KFK.JC3.append(nodes);
      let guiNodes = KFK.JC3.find(".node");
      for (let i = 0; i < guiNodes.length; i++) {
        let jqNode = $(guiNodes[i]);
        await KFK.setNodeEventHandler(jqNode);
        if (KFK.docIsReadOnly()) {
          jqNode.draggable("disable");
        } else {
          jqNode.draggable("enable");
        }
        KFK.redrawLinkLines(jqNode, "loadDoc", false);
      }

      if (KFK.docIsNotReadOnly()) {
        $("#linetransformer").draggable("enable");
      } else {
        $("#linetransformer").draggable("disable");
      }
      KFK.myFadeOut($(".loading"));
      KFK.myFadeIn(KFK.JC3, 100);
      $("#overallbackground").removeClass("grid1");
      //focusOnC3会导致C3居中
      KFK.focusOnC3();
      KFK.scrollToLastPosition(KFK.tplid);
      KFK.C3.dispatchEvent(KFK.refreshC3Event);
    });;
    */

  } catch (err) {
    console.error(err);
  } finally {
    KFK.inited = true;
  }
};

/**
 * @type {}
 */
KFK.loadWorkflow = async function (wfid) {
  try {
    KFK.hide(KFK.JC3);
    Client.setSessionToken();
    Client.readWorkflow(wfid).then(async (wfobj) => {
      KFK.tpl = $(wfobj.doc).first(".template");
      let nodes = KFK.tpl.find(".node");
      nodes.addClass("kfknode");
      await KFK.JC3.append(nodes);
      let guiNodes = KFK.JC3.find(".node");
      for (let i = 0; i < guiNodes.length; i++) {
        let jqNode = $(guiNodes[i]);
        await KFK.setNodeEventHandler(jqNode);
        jqNode.draggable("disable");
        KFK.redrawLinkLines(jqNode, "loadDoc", false);
      }

      KFK.workflow = $(wfobj.doc).first(".workflow");
      let works = KFK.workflow.find(".work");
      for (let i = 0; i < works.length; i++) {
        let aWork = $(works[i]);
        let theNodeid = aWork.attr("nodeid");
        let theGuiNode = KFK.JC3.find("#" + theNodeid);
        let classes = aWork.attr("class").split(/\s+/);
        for (let j = 0; j < classes.length; j++) {
          if (classes[j].startsWith("ST_")) {
            theGuiNode.addClass(classes[j]);
          }
        }
        theGuiNode.append(aWork);
      }

      for (let i = 0; i < guiNodes.length; i++) {
        //let jqNode = $(guiNodes[i]);
        //Add node className by it's running status in process
        //Change link line style by it's status
      }

      KFK.myFadeOut($(".loading"));
      KFK.myFadeIn(KFK.JC3, 100);
      $("#overallbackground").removeClass("grid1");




      //focusOnC3会导致C3居中
      KFK.focusOnC3();
      KFK.scrollToLastPosition(KFK.wfid);
      KFK.C3.dispatchEvent(KFK.refreshC3Event);



    });;

  } catch (err) {
    console.error(err);
  } finally {
    KFK.inited = true;
  }
};

KFK.scrollToLastPosition = function (objid) {
  let docPos = {};
  //从localStorage中读取docPos记录
  let scrollPositionCache = localStorage.getItem("docPos");
  if (scrollPositionCache) {
    docPos = JSON.parse(scrollPositionCache);
  }
  //如果有当前文档的滚动位置记录，则滚动到起位置去
  if (docPos[objid]) {
    KFK.scrollToPos(docPos[objid]);
  } else {
    //如果没有，则滚动到第一屏
    KFK.scrollToPos({
      x: KFK.LeftB,
      y: KFK.TopB,
    });
  }
};

KFK.initLeftRightPanelEventHandler = function () {
  $("#leftPanel").on("click", function (evt) {
    evt.stopPropagation();
  });
  $("#rightPanel").on("click", function (evt) {
    evt.stopPropagation();
  });
  $("#leftPanel").on("mousedown", function (evt) {
    evt.stopPropagation();
  });
  $("#rightPanel").on("mousedown", function (evt) {
    evt.stopPropagation();
  });
};

KFK.onToolboxMouseDown = function (mode, evt) {
  KFK.toolboxMouseDown = true;
  KFK.mode = mode;
  KFK.debug("Set drop toolbox mode to ", KFK.mode);
};
KFK.onToolboxMouseUp = function (mode, evt) {
  KFK.toolboxMouseDown = false;
  KFK.toolboxMouseDownOn = null;
};


KFK.showSection = async function (options) {
  let section = $.extend({}, KFK.APP.show.section, options);
  await KFK.APP.setData("show", "section", section);
};

KFK.showForm = async function (options) {
  let form = $.extend({}, KFK.APP.show.form, options);
  await KFK.APP.setData("show", "form", form);
};

KFK.showDialog = async function (options) {
  let dialog = $.extend({}, KFK.APP.show.dialog, options);
  await KFK.APP.setData("show", "dialog", dialog);
};
KFK.mergeAppData = async (data, key, value) => {
  if (
    typeof data === "string" &&
    typeof key === "string" &&
    typeof value === "object"
  ) {
    let tmpData = $.extend({}, KFK.APP[data][key], value);
    await KFK.APP.setData(data, key, tmpData);
  } else if (
    typeof data === "string" &&
    data.indexOf(".") > 0 &&
    typeof key === "object"
  ) {
    let arr = data.split(".");
    let tmpData = $.extend({}, KFK.APP[arr[0]][arr[1]], key);
    await KFK.APP.setData(arr[0], arr[1], tmpData);
  }
};

KFK.setAppData = (data, key, value) => {
  //KFK.APP.setData(data, key, value);
  console.log("TBI: setAppData");
};

KFK.sleep = async function (miliseconds) {
  await new Promise((resolve) => setTimeout(resolve, miliseconds));
};



KFK.getProductUrl = function () {
  // return cocoConfig.product.url;
  return KFK.urlBase;
};


KFK.checkLoading = async function (num) {};

KFK.cleanupJC3 = async function () {
  await KFK.JC3.empty();
  KFK.addSvgLayer();
};


KFK.recreateObject = async function (obj, callback) {
  if (obj.etype === "document") {
    KFK.recreateDoc(obj, callback);
  } else if (obj.etype === "DIV") {
    await KFK.recreateNode(obj, callback);
  } else if (obj.etype === "SLINE") {
    await KFK.recreateShape(obj, callback);
  } else {
    KFK.error("Unknown etype, guess it");
    let tmpHtml = await KFK.gzippedContentToString(obj.content);
    KFK.detail(tmpHtml);
    if (
      tmpHtml.indexOf("nodetype") > 0 &&
      tmpHtml.indexOf("edittable") > 0 &&
      tmpHtml.indexOf("kfknode") > 0
    ) {
      obj.etype = "DIV";
      KFK.recreateNode(obj, callback);
    }
  }
};

KFK.recreateDoc = function (obj, callback) {
  try {
    let docRet = obj.content;
    KFK.APP.setData("model", "cocodoc", docRet);
  } catch (err) {
    console.error(err);
  } finally {
    if (callback) callback(1);
  }
};
KFK.recreateShape = async function (obj, callback) {
  try {
    let isALockedNode = obj.lock;
    let content = await KFK.gzippedContentToString(obj.content);
    let shape_id = obj.nodeid;
    let theShape = KFK.restoreShape(shape_id, content);
    if (isALockedNode) {
      KFK.NodeController.lockline(KFK, theShape);
    } else {
      KFK.NodeController.unlockline(KFK, theShape);
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (callback) callback(1);
  }
};

KFK.gzippedContentToString = async function (content) {
  if (content.type !== "Buffer" || content.data === undefined) {
    console.error(
      "gzippedContentToString was passed in wrong content",
      content
    );
  }
  let tmp = await gunzip(new Buffer(content.data));
  return tmp.toString("utf8");
};

KFK.recreateNode = async function (obj, callback) {
  try {
    let isALockedNode = obj.lock;

    html = await KFK.gzippedContentToString(obj.content);

    let jqDIV = $($.parseHTML(html));
    let nodeid = jqDIV.attr("id");

    if (jqDIV.hasClass("notify")) {
      //TODO: notification
    } else if (jqDIV.hasClass("ad")) {
      //TODO: Advertisement
    } else {
      //需要先清理，否则在替换已有node时，会导致无法resize
      KFK.cleanNodeEventFootprint(jqDIV);
      KFK.setNodeShowEditor(jqDIV);
      let existingNode = KFK.getNodeById(nodeid);
      if (existingNode.length > 0) {
        //节点存在，需要刷新
        let isBrNode = false;
        if (existingNode.find(".brsnode").length > 0) {
          isBrNode = true;
        }
        existingNode.prop("outerHTML", jqDIV.prop("outerHTML"));
        if (isBrNode) {
          KFK.startBrainstorm(existingNode);
        }
        jqDIV = existingNode;
      } else {
        //新载入
        KFK.JC3.append(jqDIV);
      }
      jqDIV = KFK.getNodeById(nodeid);
      if (KFK.APP.model.cocodoc.readonly === false) {
        await KFK.setNodeEventHandler(jqDIV, async function () {
          if (isALockedNode) {
            // KFK.debug('is a locked');
            KFK.NodeController.lock(jqDIV);
          }
        });
      }
      KFK.redrawLinkLines(jqDIV, "server update");
    }
    if (obj.mdnote) {
      let tmp = await KFK.gzippedContentToString(obj.mdnote);
      KFK.mdnotes.set(jqDIV.attr("id"), tmp);
    } else {
      KFK.mdnotes.set(jqDIV.attr("id"), "# Recreate empty note #");
    }
  } catch (error) {
    KFK.error(error);
  } finally {
    if (callback) callback(1);
    KFK.C3.dispatchEvent(KFK.refreshC3Event);
  }
};

KFK.getLineOptions = function (div) {
  return JSON.parse(KFK.base64ToCode(div.attr("options")));
};
KFK.setLineOptions = function (div, options) {
  div.attr("options", KFK.codeToBase64(JSON.stringify(options)));
};
KFK.codeToBase64 = function (code) {
  return Buffer.from(code).toString("base64");
};
KFK.base64ToCode = function (base64) {
  return Buffer.from(base64, "base64").toString("utf-8");
};

KFK.getPropertyApplyToJqNode = function () {
  let ret = null;
  if (KFK.hoverJqDiv() !== null) {
    ret = KFK.hoverJqDiv();
  } else if (KFK.lastFocusOnJqNode != null) {
    ret = KFK.lastFocusOnJqNode;
  } else if (KFK.justCreatedJqNode != null) {
    ret = KFK.justCreatedJqNode;
  } else {
    ret = null;
  }
  return ret;
};

KFK.getPropertyApplyToShape = function () {
  if (KFK.hoverSvgLine() != null) {
    return KFK.hoverSvgLine();
  } else if (KFK.pickedShape != null) {
    return KFK.pickedShape;
  } else if (KFK.justCreatedShape != null) {
    return KFK.justCreatedShape;
  } else {
    return null;
  }
};




KFK.setMode = function (mode, event) {
  if (KFK.docIsReadOnly()) mode = "pointer";

  let shiftKey = event ? event.shiftKey : false;

  let oldMode = KFK.mode;
  KFK.mode = mode;
  for (let key in KFK.APP.toolActiveState) {
    KFK.APP.toolActiveState[key] = false;
  }
  if (KFK.APP.toolActiveState[mode] == undefined)
    console.warn(`APP.toolActiveState.${mode} does not exist`);
  else KFK.APP.toolActiveState[mode] = true;

  if (oldMode === "interlink" && mode !== "interlink") {
    KFK.hide(KFK.interLinkDialog);
  }
  if (
    (oldMode === "line" && mode !== "line") ||
    (oldMode === "connect" && mode !== "connect")
  ) {
    KFK.cancelTempLine();
  }

  if (shiftKey) {
    if (KFK.mode === "connect") {
      KFK.lockTool = true;
    } else {
      KFK.lockTool = false;
    }
  } else {
    KFK.lockTool = false;
  }

  $("#modeIndicator").hide();

  if (KFK.mode === "text") {
    KFK.APP.setData("show", "shape_property", true);
    KFK.APP.setData("show", "customshape", false);
    KFK.APP.setData("show", "custombacksvg", false);
    KFK.APP.setData("show", "customfont", true);
    KFK.APP.setData("show", "layercontrol", true);
    KFK.APP.setData("show", "customline", false);
  } else if (KFK.mode === "textblock") {
    KFK.APP.setData("show", "shape_property", true);
    KFK.APP.setData("show", "customshape", true);
    KFK.APP.setData("show", "customfont", true);
    KFK.APP.setData("show", "custombacksvg", true);
    KFK.APP.setData("show", "layercontrol", true);
    KFK.APP.setData("show", "customline", false);
  } else if (KFK.mode === "yellowtip" || KFK.mode === "comment") {
    KFK.APP.setData("show", "shape_property", true);
    KFK.APP.setData("show", "customfont", true);
    KFK.APP.setData("show", "custombacksvg", true);
    KFK.APP.setData("show", "customshape", false);
    KFK.APP.setData("show", "layercontrol", true);
    KFK.APP.setData("show", "customline", false);
  } else if (KFK.mode === "line") {
    KFK.APP.setData("show", "shape_property", true);
    KFK.APP.setData("show", "customshape", false);
    KFK.APP.setData("show", "custombacksvg", false);
    KFK.APP.setData("show", "customfont", false);
    KFK.APP.setData("show", "layercontrol", false);
    KFK.APP.setData("show", "customline", true);
  } else if (KFK.mode === "freehand") {
    KFK.drawMode = KFK.mode;
  } else if (KFK.mode === "material") {
    KFK.materialUpdated || KFK.loadMatLibForMyself();
    if (KFK.pickerMatlib.hasClass("noshow")) {
      KFK.showPickerMatlib();
    } else {
      KFK.hidePickerMatlib();
      KFK.setMode("pointer");
    }
  } else if (KFK.mode === "todo") {
    KFK.showTodo();
    KFK.setMode("pointer");
  } else if (KFK.mode === "chat") {
    KFK.showChat();
    KFK.setMode("pointer");
  } else if (KFK.mode === "draw") {
    KFK.drawMode = "polyline";
  } else if (KFK.mode === "interlink") {
    KFK.showInterLinkDialog();
  }

  KFK.focusOnC3();
};

KFK.getNodeById = function (nodeId) {
  return $("#" + nodeId);
};

//用在index.js中的boostrapevue
KFK.isActive = function (mode) {
  return KFK.mode === mode;
};

KFK.width = function (w) {
  if (w) {
    KFK._width = w;
    KFK.stage.width(w);
  }
  return KFK._width;
};
KFK.height = function (h) {
  if (h) {
    KFK._height = h;
    KFK.stage.height(h);
  }
  return KFK._height;
};

KFK.size = function (w, h) {
  KFK.width(w);
  KFK.height(h);
};
/**
 * 是否是一个kfknode
 * @param a node div
 */
KFK.isKfkNode = function (jqdiv) {
  return KFK.isA(jqdiv, "kfknode");
};
/**
 * 是否是一个有某个className的对象
 * @param jqdiv  要检查的对象
 * @param className 要检查的className
 * @return true，如果有这个className， false如果没有这个className
 */
KFK.isA = function (jqdiv, className) {
  return jqdiv && jqdiv.hasClass(className);
};
/**
 * 是否不是一个有某个className的对象
 * 跟 KFK.isA(jqdiv, className)相反
 *
 * @param jqdiv  要检查的对象
 * @param className 要检查的className
 * @return true，如果没有这个className， false如果有这个className
 */
KFK.isNotA = function (jqdiv, className) {
  return !KFK.isA(jqdiv, className);
};
KFK.holdEvent = function (evt) {
  evt.stopImmediatePropagation();
  evt.stopPropagation();
  evt.preventDefault();
};

KFK.loadModule = function (moduleName) {
  switch (moduleName) {
    case "AdvOps":
      KFK.AdvOps ?
        console.log("AdvOps already loaded") :
        import("./advOps").then((pack) => {
          KFK.AdvOps = pack.AdvOps;
          console.log("AdvOps just loaded");
        });
      break;
    case "DivStyler":
      KFK.DivStyler ?
        console.log("DivStyler already exists") :
        import("./divStyler").then((pack) => {
          KFK.DivStyler = pack.DivStyler;
          console.log("DivStyler just loaded");
        });
      break;
  }
};
KFK.addDocumentEventHandler = function () {
  if (IsSet(KFK.documentEventHandlerSet)) return;
  //document keydown
  $(document).keydown(async function (evt) {
    if (KFK.isShowingModal === true) return;
    if (KFK.onC3 === false) return;
    if (KFK.isEditting) return;
    if (evt.keyCode === 16) KFK.KEYDOWN.shift = true;
    else if (evt.keyCode === 17) KFK.KEYDOWN.ctrl = true;
    else if (evt.keyCode === 18) KFK.KEYDOWN.alt = true;
    else if (evt.keyCode === 91) KFK.KEYDOWN.meta = true;
    //如果正处于编辑状态，则不做处理
    //禁止Ctrl-A  and Ctrl-S
    if (
      (evt.keyCode === 65 || evt.keyCode === 83) &&
      (evt.ctrlKey || evt.metaKey)
    ) {
      evt.stopPropagation();
      evt.preventDefault();
      return;
    }
    //key pool
    if (
      (evt.keyCode >= 48 && evt.keyCode <= 57) ||
      (evt.keyCode >= 65 && evt.keyCode <= 90) ||
      evt.keyCode === 32 ||
      evt.keyCode === 186
    ) {
      KFK.keypool += evt.key;
      KFK.keypool = KFK.keypool.toLowerCase();
      KFK.logKey(KFK.keypool);
    } else {
      KFK.keypool = "";
    }

    switch (evt.keyCode) {
      case 90: //key z
        //不要移动META-Z代码，一定要在document的key-down里面，
        //否则，在其他地方没有用。这个问题花了我三个小时时间，FX
        console.log("PRessed Z");
        if ((evt.metaKey || evt.ctrlKey) && evt.shiftKey) {
          KFK.logKey("META-SHIFT-Z");
          KFK.redo();
        }
        if ((evt.metaKey || evt.ctrlKey) && !evt.shiftKey) {
          console.log("PRessed meta-Z");
          KFK.logKey("META-Z");
          KFK.undo();
        }
        break;
      case 8: //Backspace
      case 46: //Delete key del  key delete
        KFK.deleteObjects(evt, false);
        break;
      default:
        console.log("got keycode", evt.keyCode);
    }
  });
  $(document).keyup(function (evt) {
    switch (evt.keyCode) {
      case 16:
        KFK.KEYDOWN.shift = false;
        break;
      case 17:
        KFK.KEYDOWN.ctrl = false;
        KFK.stopZoomShape();
        break;
      case 18:
        KFK.KEYDOWN.alt = false;
        break;
      default:
        break;
    }
  });

  //标记框选开始，是在JC3的mousedown中做记录的
  //标记框选结束，也是在JC3的mouseup中做记录的
  //但mousemove需要在document的mousemove事件处理中进行处理。
  //因为，如果不这样做，滑动鼠标出现选择框后，如果鼠标回到选择框内，则JC3抓不到mousemove事件
  //导致的现象就是选择框只可以放大，不可以缩小
  $(document).on("mousemove", function (evt) {
    KFK.globalMouseX = evt.clientX;
    KFK.globalMouseY = evt.clientY;
    if (KFK.inPresentingMode || KFK.inOverviewMode) return;
    if (KFK.inNoteEditor) return;
    let tmp = {
      x: KFK.scrXToJc3X(evt.clientX),
      y: KFK.scrYToJc3Y(evt.clientY),
    };
    if (KFK.isDuringKuangXuan()) {
      KFK.kuangXuan(KFK.kuangXuanStartPoint, tmp);
    } else if (KFK.isZoomingShape) {
      KFK.zoomShape(evt, KFK.shapeToZoom);
    } else if (
      KFK.panStartAt &&
      NotSet(KFK.shapeToDrag) &&
      KFK.isEditting === false &&
      KFK.isShowingModal === false &&
      KFK.lineTransfomerDragging !== true
    ) {
      let delta = {
        x: evt.clientX - KFK.panStartAt.x,
        y: evt.clientY - KFK.panStartAt.y,
      };
      KFK.JS1.scrollLeft(KFK.JS1.scrollLeft() - delta.x * 2);
      KFK.JS1.scrollTop(KFK.JS1.scrollTop() - delta.y * 2);
      KFK.panStartAt.x = evt.clientX;
      KFK.panStartAt.y = evt.clientY;
      return;
    }
  });
  $(document).on("mousedown", function (evt) {
    if (KFK.mode === "pointer") {
      if (KFK.ctrlMouseToPan === true) {
        if (evt.shiftKey) {
          KFK.panStartAt = {
            x: evt.clientX,
            y: evt.clientY,
          };
        } else {
          KFK.kuangXuanMouseIsDown = true;
          KFK.kuangXuanStartPoint = {
            x: KFK.scrXToJc3X(evt.clientX),
            y: KFK.scrYToJc3Y(evt.clientY),
          };
        }
      } else {
        if (evt.shiftKey) {
          KFK.kuangXuanMouseIsDown = true;
          KFK.kuangXuanStartPoint = {
            x: KFK.scrXToJc3X(evt.clientX),
            y: KFK.scrYToJc3Y(evt.clientY),
          };
        } else {
          KFK.panStartAt = {
            x: evt.clientX,
            y: evt.clientY,
          };
          console.log("panStart at", KFK.panStartAt);
        }
      }
    }
  });
  $(document).on("mouseup", async function (evt) {
    KFK.panStartAt = undefined;
    if (KFK.mode === "pointer") {
      KFK.kuangXuanMouseIsDown = false;
      KFK.kuangXuanEndPoint = {
        x: KFK.scrXToJc3X(evt.clientX),
        y: KFK.scrYToJc3Y(evt.clientY),
      };
      if (KFK.duringKuangXuan) {
        KFK.ignoreClick = true;
        KFK.endKuangXuan(
          KFK.kuangXuanStartPoint,
          KFK.kuangXuanEndPoint,
          evt.shfitKey
        );
        KFK.duringKuangXuan = false;
      }
    }
    //线条点下去以后，shapeToDrag就设置好了
    //移动距离大于5时，才会设置shapeDragging=true
    //如果在距离小于5内，抬起鼠标，此时，shapeDragging还是false,此时，应该把shapeToDrag置为null
    if (KFK.shapeDragging === false && KFK.shapeToDrag) {
      KFK.shapeToDrag = null;
    }
    //end shape drag, end drag shape
    if (
      KFK.shapeDragging &&
      KFK.docIsReadOnly() === false &&
      KFK.lineLocked(KFK.shapeToDrag) === false
    ) {
      if (
        KFK.isShapeSelected(KFK.shapeToDrag) === false &&
        KFK.selectedShapes.length > 0
      ) {
        KFK.cancelAlreadySelected();
      }
      let realX = KFK.scalePoint(KFK.scrXToJc3X(evt.clientX));
      let realY = KFK.scalePoint(KFK.scrYToJc3Y(evt.clientY));
      let pt = {
        x: realX,
        y: realY,
      };
      // if (KFK.APP.model.viewConfig.snap) {
      //     pt = KFK.getNearGridPoint(realX, realY);
      // }
      let alreadySelected = false;
      for (let i = 0; i < KFK.selectedShapes.length; i++) {
        if (KFK.selectedShapes[i].attr("id") == KFK.shapeToDrag.attr("id")) {
          alreadySelected = true;
          break;
        }
      }
      if (alreadySelected === false) {
        KFK.selectedShapes.push(KFK.shapeToDrag);
      }
      let unlockedShapeCount = 0;
      for (let i = 0; i < KFK.selectedShapes.length; i++) {
        if (KFK.lineLocked(KFK.selectedShapes[i]) === false) {
          unlockedShapeCount++;
        }
      }
      let unlockedDivCount = 0;
      for (let i = 0; i < KFK.selectedDIVs.length; i++) {
        if (
          KFK.anyLocked(KFK.selectedDIVs[i]) === false &&
          KFK.updateable(KFK.selectedDIVs[i])
        ) {
          unlockedDivCount++;
        }
      }
      let movedCount = unlockedDivCount + unlockedShapeCount;
      let movedSer = 0;
      KFK.startTrx();
      try {
        for (let i = 0; i < KFK.selectedShapes.length; i++) {
          let aShape = KFK.selectedShapes[i];
          if (KFK.lineLocked(aShape)) continue;
          KFK.setShapeToRemember(aShape);
          //在拖动鼠标时， shapeDraggingStartPoint 是跟着变化的,在鼠标移动时，已经对shapeToDrag做了位移
          if (aShape.attr("id") === KFK.shapeToDrag.attr("id")) {
            let deltaX = pt.x - KFK.shapeDraggingStartPoint.x;
            let deltaY = pt.y - KFK.shapeDraggingStartPoint.y;
            //aShape.dmove(deltaX, deltaY);
          } else {
            //其它对象要从原始位置计算位移
            let deltaX = pt.x - KFK.shapeFirstDraggingStartPoint.x;
            let deltaY = pt.y - KFK.shapeFirstDraggingStartPoint.y;
            await aShape.dmove(deltaX, deltaY);
          }
          let beforeSaveWidth = aShape.attr("stroke-width");
          let beforeSaveColor = aShape.attr("stroke");
          KFK.resetShapeStyleToOrigin(aShape);
          KFK.resetShapeStyleToOrigin(KFK.shapeToRemember);
          await KFK.syncLinePut(
            "U",
            aShape,
            "move",
            KFK.shapeToRemember,
            false,
            movedSer,
            movedCount
          );
          movedSer = movedSer + 1;
          aShape.attr({
            "stroke-width": beforeSaveWidth,
            stroke: beforeSaveColor,
          });
        }

        let delta = {
          x: pt.x - KFK.shapeFirstDraggingStartPoint.x,
          y: pt.y - KFK.shapeFirstDraggingStartPoint.y,
        };
        for (let i = 0; i < KFK.selectedDIVs.length; i++) {
          if (
            KFK.anyLocked(KFK.selectedDIVs[i]) ||
            KFK.updateable(KFK.selectedDIVs[i]) === false
          )
            continue;
          let tmpFromJQ = KFK.selectedDIVs[i].clone();
          //虽然这出跳过了被拖动的节点，但在后面这个节点一样要被移动
          //因此，所有被移动的节点数量就是所有被选中的节点数量
          KFK.selectedDIVs[i].css(
            "left",
            KFK.divLeft(KFK.selectedDIVs[i]) + delta.x
          );
          KFK.selectedDIVs[i].css(
            "top",
            KFK.divTop(KFK.selectedDIVs[i]) + delta.y
          );
          await KFK.syncNodePut(
            "U",
            KFK.selectedDIVs[i].clone(),
            "move following selected",
            tmpFromJQ,
            false,
            movedSer,
            movedCount
          );
          movedSer = movedSer + 1;
        }
        for (let i = 0; i < KFK.selectedDIVs.length; i++) {
          KFK.redrawLinkLines(KFK.selectedDIVs[i], "codrag", true);
        }
      } finally {
        KFK.endTrx();
      }

      console.log("moved div number: " + KFK.selectedDIVs.length);

      KFK.setShapeToRemember(KFK.shapeToDrag);
      KFK.shapeDragging = false;
      KFK.shapeToDrag = null;
      $(document.body).css("cursor", "default");
    }
  });

  // onscroll onScroll on scroll on Scroll
  $("#S1").scroll(() => {
    let sx = $("#S1").scrollLeft();
    let sy = $("#S1").scrollTop();
    try {
      //不是每次滚动都记录，滚动停止一秒后再记录
      if (KFK.scrollPosTimer) {
        clearTimeout(KFK.scrollPosTimer);
        KFK.scrollPosTimer = undefined;
      }
      KFK.scrollPosTimer = setTimeout(function () {
        let docPos = {};
        let scrollPositionCache = localStorage.getItem("docPos");
        if (scrollPositionCache) {
          docPos = JSON.parse(scrollPositionCache);
        }
        if (docPos[KFK.tplid]) {
          docPos[KFK.tplid] = {
            x: sx,
            y: sy,
          };
        } else {
          let keyCount = 0;
          for (let key in docPos) {
            keyCount++;
          }
          if (keyCount > 30) {
            let tmp = {};
            let j = 0;
            for (let key in docPos) {
              if (j > 10) {
                tmp[key] = docPos[key];
              }
              j++;
            }
            docPos = tmp;
          }
          docPos[KFK.tplid] = {
            x: sx,
            y: sy,
          };
        }
        localStorage.setItem("docPos", JSON.stringify(docPos));
      }, 1000);
    } catch (error) {
      console.log("save docPos error", error);
    }

  });

  KFK.documentEventHandlerSet = true;
};


KFK.onESC = function () {
  KFK.cancelAlreadySelected();
  if (!KFK.isEditting && KFK.mode !== "line") KFK.setMode("pointer");
  KFK.cancelTempLine();
  KFK.setMode("pointer");
  if (KFK.tempShape) KFK.tempShape.hide();
  if (KFK.noCopyPaste) {
    KFK.noCopyPaste = false;
  }
};


KFK.cancelTempLine = function () {
  if (KFK.lineTemping) {
    KFK.lineTemping = false;
    if (KFK.tempSvgLine) KFK.tempSvgLine.hide();
    KFK.linkPosNode.clear();
    KFK.drawPoints.clear();
  }
};


KFK.dataURLtoFile = function (dataurl, filename) {
  let arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {
    type: mime,
  });
};

KFK.save = async function () {
  let docPath = `/${cocoConfig.tenant.id}/${KFK.APP.model.cocodoc.doc_id}/`;
  // let result = await KFK.OSSClient.list({
  //     prefix: 'lucas/',
  // });
  try {
    // 不带任何参数，默认最多返回1000个文件。
    let result = await KFK.OSSClient.list({
      prefix: "lucas/",
    });
    // 根据nextMarker继续列出文件。
    if (result.isTruncated) {
      let result = await client.list({
        marker: result.nextMarker,
      });
    }
    // // 列举前缀为'my-'的文件。
    // let result = await client.list({
    //    prefix: 'my-'
    // });
    // // 列举前缀为'my-'且在'my-object'之后的文件。
    // let result = await client.list({
    //    prefix: 'my-',
    //    marker: 'my-object'
    // });
  } catch (err) {
    KFK.error(err);
  }
};

KFK.checkUrl = function (str_url) {
  let regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
  return str.match(regex) !== null;
};

KFK.replaceHTMLTarget = function (html) {
  html = `<div>${html}</div>`;
  try {
    let jq = $($.parseHTML(html));
    jq.find("a").prop("target", "_blank");
    jq.find("[style]").removeAttr("style");
    ret = jq.prop("innerHTML");
  } catch (err) {
    ret = "";
  }
  return ret;
};
KFK.pasteContent = function () {
  let paste = KFK.APP.model.paste;
};


KFK.onCut = async function (evt) {
  if (KFK.isShowingModal || KFK.inNoteEditor) return;
  KFK.deleteObjects(evt, true);
};

KFK.onCopy = async function (evt) {
  if (KFK.isShowingModal) return;
  if (KFK.noCopyPaste) return;
  if (KFK.APP.show.dialog.ivtCodeDialog) {
    return;
  }
  if (KFK.inNoteEditor) return;
  let someDIVcopyed = await KFK.duplicateHoverObject(evt, "copy");
  if (someDIVcopyed) {
    evt.clipboardData.setData("text/plain", "usediv");
    evt.clipboardData.setData("text/html", "usediv");
  }
  evt.preventDefault();
  evt.preventDefault();
  KFK.holdEvent(evt);
};

KFK.onPaste = async function (evt) {
  if (KFK.inNoteEditor) return;
  if (KFK.isShowingModal) {
    console.log("paste ignored since isShowingModal");
    return;
  }
  if (KFK.noCopyPaste) {
    console.log("paste ignored since noCopyPaste is true");
    return;
  }
  if (KFK.docIsReadOnly()) {
    console.log("paste ignored since docIsReadOnly");
    return;
  }
  KFK.pasteAt = {
    x: KFK.globalMouseX,
    y: KFK.globalMouseY,
  };
  let content = {
    html: "",
    text: "",
    image: null,
  };
  content.html = evt.clipboardData.getData("text/html");
  content.text = evt.clipboardData.getData("Text");
  if (content.text === "usediv") {
    await KFK.duplicateHoverObject(evt, "paste");
    return;
  } else {
    var items = (evt.clipboardData || evt.originalEvent.clipboardData).items;
    if (items[1] && (content.html !== "" || content.text !== "")) {
      KFK.showTextPasteDialog(content);
    } else if (items[0]) {
      if (
        items[0].kind === "string" &&
        (content.html !== "" || content.text !== "")
      ) {
        KFK.showTextPasteDialog(content);
      } else if (items[0].kind === "file") {
        var blob = items[0].getAsFile();
        KFK.dropAtPos = {
          x: KFK.scalePoint(KFK.scrXToJc3X(KFK.globalMouseX)),
          y: KFK.scalePoint(KFK.scrYToJc3Y(KFK.globalMouseY)),
        };
        KFK.procPasteBlob(blob);
      }
    }
  }
};


KFK.changeSVGFill = function () {};
KFK.scrCenter = function () {
  return {
    x: $(window).width() * 0.5,
    y: $(window).height() * 0.5,
  };
};


KFK.printCallStack = function (msg = "") {
  KFK.info(new Error(msg).stack);
};


KFK.onLinkConnect = async function (data) {
  let selectorFrom = `#${response.from}`;
  let selectorTo = `#${response.to}`;
  let nodeFrom = $(selectorFrom);
  let nodeTo = $(selectorTo);
  if (nodeFrom.length > 0 && nodeTo.length > 0) {
    KFK.buildConnectionBetween(nodeFrom, nodeTo);
    KFK.redrawLinkLines(nodeFrom);
    KFK.redrawLinkLines(nodeTo);
  }
};

KFK.addSvgLayer = function () {
  KFK.svgDraw && delete KFK.svgDraw;
  KFK.svgDraw = SVG()
    .addTo("#C3")
    .size(KFK._width, KFK._height);
  KFK.svgDraw.attr("id", "D3");
  KFK.svgDraw.addClass("svgcanvas");


  KFK.debug("svg layer initialized");
  KFK.pageBounding = {
    Pages: [],
  };
  let boundingLineOption = {
    color: "#FFFFFFCC",
    width: 4,
    linecap: "square",
  };
  for (let i = 0; i < KFK.PageNumberVert; i++) {
    for (let j = 0; j < KFK.PageNumberHori; j++) {
      KFK.pageBounding.Pages.push({
        left: j * KFK.PageWidth,
        top: i * KFK.PageHeight,
      });
    }
  }
  for (let i = 0; i <= KFK.PageNumberHori; i++) {
    let tmpLine = KFK.svgDraw.line(
      i * KFK.PageWidth,
      0,
      i * KFK.PageWidth,
      KFK._height
    );
    tmpLine.addClass("pageBoundingLine").stroke(boundingLineOption);
    if (cocoConfig.viewConfig.showbounding === false) {
      tmpLine.addClass("noshow");
    }
  }
  for (let j = 0; j <= KFK.PageNumberVert; j++) {
    let tmpLine = KFK.svgDraw.line(
      0,
      j * KFK.PageHeight,
      KFK._width,
      j * KFK.PageHeight
    );
    tmpLine.addClass("pageBoundingLine").stroke(boundingLineOption);
    if (cocoConfig.viewConfig.showbounding === false) {
      tmpLine.addClass("noshow");
    }
  }

  KFK.ball = KFK.svgDraw.circle(8)
  KFK.ball.addClass("noshow");
};

KFK.restoreShape = function (shape_id, html) {
  let aLine = null;
  let selector = `.${shape_id}`;
  aLine = KFK.svgDraw.findOne(selector);
  if (aLine === null || aLine === undefined) {
    aLine = KFK.svgDraw.line();
  }
  let parent = aLine.svg(html, true);
  aLine = parent.findOne(selector);
  KFK.addShapeEventListner(aLine);
  return aLine;
};

KFK.makePath = function (p1, p2) {
  let rad = 10;
  let c1 = {
    x: p2.x - rad,
    y: p1.y,
  };
  let c2 = {
    x: p2.x,
    y: p1.y + rad,
  };

  let pStr = `M${p1.x} ${p1.y} H${c1.x} S${c2.x} ${c1.y} ${c2.x} ${c2.y} V${p2.y}`;
  return pStr;
};

/**
 * 画两个节点之间的连接线
 *
 * fid - 起始节点的ID
 * tid - 终点节点的ID
 * lineClass - 事实上是这条线的ID, 用于查找正向线(svgjs用class查找对象)
 * lineCLassReverse - 反向线的class, 用于查找反向线
 * pstr - 连接线的plot string
 * triangle - 三角形的顶点坐标
 */
KFK._svgDrawNodesConnect = async function (
  fid,
  tid,
  lineClass,
  lineClassReverse,
  pstr,
  lstr,
  tstr,
  triangle,
  caseValue,
  simpleLineMode = false
) {
  try {
    let drawPstr = !simpleLineMode;
    let theConnect = null;
    let theTriangle = null;
    let fromDIV = $(`#${fid}`);
    let toDIV = $(`#${tid}`);
    //在之前的cocopad的代码中，节点上添加了三个属性：cncolor, cnwidth, cnstyle, cn表示connection
    let cnColor = fromDIV.attr("cncolor");
    let cnWidth = fromDIV.attr("cnwidth");
    let cnStyle = fromDIV.attr("cnstyle");
    let reverseLine = KFK.svgDraw.findOne(`.${lineClassReverse}`);
    let oldLine = KFK.svgDraw.findOne(`.${lineClass}`);
    let oldText = KFK.svgDraw.findOne(`.${lineClass + "_text"}`);
    let reverseTriangle = KFK.svgDraw.findOne(`.${lineClassReverse}_triangle`);
    let oldTriangle = KFK.svgDraw.findOne(`.${lineClass}_triangle`);

    let theConnect_color = cnColor || KFK.YIQColorAux || KFK.config.connect.styles.style1.normal.color;
    let theConnect_width = cnWidth || KFK.config.connect.styles.style1.normal.width;
    let theConnect_fill_color = theConnect_color;
    //如果存在同一ID的线,则重画这条线及其三角
    if (oldText) {
      oldText.remove();
    }
    if (oldLine) {
      oldLine.plot(drawPstr ? pstr : lstr);
      oldTriangle && oldTriangle.plot(triangle);
      theConnect = oldLine;
      theTriangle = oldTriangle;
    } else {
      //如果不同在同一ID的线, then
      if (reverseLine) {
        //如果存在反向线,则重画这条反向线为正向线
        reverseLine.removeClass(lineClassReverse);
        reverseLine.addClass(lineClass);
        reverseLine.plot(drawPstr ? pstr : lstr);
        reverseTriangle.removeClass(lineClassReverse + "_triangle");
        reverseTriangle.addClass(lineClass + "_triangle");
        reverseTriangle.plot(triangle);
        theConnect = reverseLine;
        theTriangle = reverseTriangle;
      } else {
        //如果同向线和反向线都不存在,则画新线条及其三角. 反向线是指与从fromNode指向toNode的线反向相反的线,也就是从toNode指向fromNode的线
        theConnect = await KFK.svgDraw.path(drawPstr ? pstr : lstr);
        theConnect
          .addClass(lineClass)
          .addClass("connect")
          .attr("styleid", "style1")
          .fill(drawPstr ? theConnect_fill_color : "none")
          .stroke({
            width: theConnect_width,
            color: theConnect_color,
          });

        if (drawPstr === false) {
          //填充时,边线为虚线可能会导致颜色溢出,待验证
          if (cnStyle === "solid") {
            theConnect.css("stroke-dasharray", "");
          } else {
            theConnect.css("stroke-dasharray", `${cnWidth * 3} ${cnWidth}`);
          }
        }
        theConnect.attr({
          id: lineClass,
          "origin-width": cocoConfig.svg.connect.width,
        });
        theTriangle = await KFK.svgDraw
          .polygon(triangle)
          .addClass(lineClass + "_triangle")
          .fill(theConnect_fill_color);
        /*
                .stroke({
                  width: KFK.APP.model.svg.connect.triangle.width,
                  color: cnColor || KFK.APP.model.svg.connect.triangle.color,
                });
                */
      }
    }
    if (lodash.isEmpty(caseValue) === false) {
      theConnect.attr("case", caseValue);
      let text = await KFK.svgDraw.text(function (add) {add.tspan(caseValue).fill(theConnect_color).dy(-2)});
      text.font({family: 'Helvetica', anchor: 'start'});
      text.addClass(lineClass + "_text");
      var textPath = text.path(lstr).attr('startOffset', '60%');
    }
    if (toDIV.hasClass("nodisplay")) {
      theConnect.addClass("nodisplay");
      theTriangle.addClass("nodisplay");
    }
    theConnect.attr({
      fid: fid,
      tid: tid,
    });
    theConnect.off("mouseover mouseout");
    theConnect.on("mouseover", () => {
      let styleid = theConnect.attr("styleid");
      let connect_color = KFK.YIQColorAux || KFK.config.connect.styles[styleid].hover.color;
      theConnect.stroke({
        width: KFK.config.connect.styles[styleid].hover.width,
        color: connect_color
      });
      KFK.ball.removeClass("noshow");
      KFK.ball.fill(connect_color);
      let length = theConnect.length();
      //let runner_duration = 500 * length / 100;
      let runner_duration = 1500;
      let runner = KFK.ball.animate({duration: runner_duration, when: "now", times: 3});
      runner.ease(">");
      runner.during(function (pos) {
        var p = theConnect.pointAt(pos * length);
        KFK.ball.center(p.x, p.y);
      }).loop(true);
      KFK.hoveredConnectId = theConnect.attr("id");
      KFK.onC3 = true;
    });
    theConnect.on("mouseout", () => {
      let styleid = theConnect.attr("styleid");
      KFK.ball.addClass("noshow");
      KFK.ball.timeline().stop();
      theConnect.stroke({
        width: cnWidth || KFK.config.connect.styles[styleid].normal.width,
        color: cnColor ||
          KFK.YIQColorAux ||
          KFK.config.connect.styles[styleid].normal.color,
      });
      KFK.hoveredConnectId = null;
    });
  } catch (error) {
    console.error(error);
  }
};


KFK.svgDrawShape = function (shapeType, id, fx, fy, tx, ty, option) {
  if (cocoConfig.viewConfig.snap) {
    let p1 = {
      x: fx,
      y: fy,
    };
    let p2 = {
      x: tx,
      y: ty,
    };
    p1 = KFK.getNearGridPoint(p1.x, p1.y);
    p2 = KFK.getNearGridPoint(p2.x, p2.y);
    fx = p1.x;
    fy = p1.y;
    tx = p2.x;
    ty = p2.y;
  }
  let width = Math.abs(fx - tx);
  let height = Math.abs(fy - ty);
  let originX = Math.min(fx, tx);
  let originY = Math.min(fy, ty);
  let shapeClass = "kfkshape";
  let shapeId = "shape_" + id;
  let theShape = KFK.svgDraw.findOne(`#shape_${id}`);
  if (theShape) theShape.remove();
  if (shapeType === "line") {
    theShape = KFK.svgDraw.line(fx, fy, tx, ty);
  } else if (shapeType === "rectangle") {
    theShape = KFK.svgDraw
      .rect(width, height)
      .fill("none")
      .move(originX, originY);
  } else if (shapeType === "ellipse") {
    theShape = KFK.svgDraw
      .ellipse(width, height)
      .fill("none")
      .move(originX, originY);
  }
  theShape.attr("id", shapeId);
  theShape
    .addClass(shapeClass)
    .addClass(shapeId)
    .addClass("kfk" + shapeType)
    .stroke(option);
  theShape.attr("shapetype", shapeType);
  theShape.attr("origin-width", option.width);
  theShape.attr("origin-color", option.color);
  KFK.addShapeEventListner(theShape);
  return theShape;
};

KFK.svgDrawPoly = function (shapeType, id, option) {
  let shapeClass = "kfkshape";
  let shapeId = "shape_" + id;
  let theShape = KFK.svgDraw.findOne(`.${shapeId}`);
  try {
    theShape.remove();
  } catch (error) {}

  let arr = [];
  for (let i = 0; i < KFK.drawPoints.length; i++) {
    arr.push([KFK.drawPoints[i].center.x, KFK.drawPoints[i].center.y]);
  }
  if (shapeType === "polyline")
    theShape = KFK.svgDraw
      .polyline(arr)
      .fill("none")
      .stroke(option);
  else
    theShape = KFK.svgDraw
      .polygon(arr)
      .fill("none")
      .stroke(option);

  theShape.attr("id", shapeId);
  theShape
    .addClass(shapeClass)
    .addClass(shapeId)
    .addClass("kfk" + shapeType)
    .stroke(option);
  theShape.attr("shapetype", shapeType);
  theShape.attr("origin-width", option.width);
  theShape.attr("origin-color", option.color);
  // KFK.addShapeEventListner(theShape);
  return theShape;
};

KFK.svgDrawTmpShape = function (shapeType, fx, fy, tx, ty, option) {
  let tmpLineClass = "shape_temp";

  KFK.tempShape = KFK.svgDraw.findOne(`.${tmpLineClass}`);
  if (KFK.tempShape) {
    KFK.tempShape.remove();
  }
  let width = Math.abs(fx - tx);
  let height = Math.abs(fy - ty);
  let originX = Math.min(fx, tx);
  let originY = Math.min(fy, ty);
  if (shapeType === "line") {
    KFK.tempShape = KFK.svgDraw
      .line(fx, fy, tx, ty)
      .addClass(tmpLineClass)
      .stroke(option);
  } else if (shapeType === "rectangle") {
    KFK.tempShape = KFK.svgDraw
      .rect(width, height)
      .move(originX, originY)
      .fill("none")
      .addClass(tmpLineClass)
      .stroke(option);
  } else if (shapeType === "ellipse") {
    KFK.tempShape = KFK.svgDraw
      .ellipse(width, height)
      .move(originX, originY)
      .fill("none")
      .addClass(tmpLineClass)
      .stroke(option);
  }
};




KFK.mouseNear = function (p1, p2, distance) {
  return (
    Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) <= distance
  );
};

KFK.moveDIVCenterToPos = function (jqDiv, pos) {
  jqDiv.css("left", pos.x - KFK.unpx(jqDiv.css("width")) * 0.5);
  jqDiv.css("top", pos.y - KFK.unpx(jqDiv.css("height")) * 0.5);
};
KFK.C3MousePos = function (evt) {
  return {
    x: KFK.scalePoint(KFK.scrXToJc3X(evt.clientX)),
    y: KFK.scalePoint(KFK.scrYToJc3Y(evt.clientY)),
  };
};
KFK.ScreenMousePos = function (pos) {
  return {
    x: pos.x - KFK.scrollContainer.scrollLeft(),
    y: pos.y - KFK.scrollContainer.scrollTop(),
  };
};
KFK.hideLineTransformer = function () {
  KFK.hide($("#linetransformer"));
};
KFK.showLineTransformer = function () {
  KFK.show($("#linetransformer"));
};
//
//shape event
KFK.addShapeEventListner = function (theShape) {
  //mouseover shape
  theShape.on("mouseover", (evt) => {
    if (KFK.shapeDragging || KFK.isFreeHandDrawing) return;
    KFK.hoverSvgLine(theShape);
    let color = theShape.attr("origin-color");
    KFK.shapeOriginColor = color;
    let color1 = KFK.reverseColor(color);
    KFK.onC3 = true;
    let originWidth = theShape.attr("origin-width");
    let newWidth =
      originWidth * 2 > KFK.CONST.MAX_SHAPE_WIDTH ?
        originWidth :
        KFK.CONST.MAX_SHAPE_WIDTH;
    if (theShape.hasClass("selected") === false) {
      theShape.stroke({
        width: newWidth,
        color: color1,
      });
    }
    if (KFK.lineLocked(theShape)) {
      KFK.hide($("#linetransformer"));
      return;
    }

    $(document.body).css("cursor", "pointer");
    if (theShape.array && theShape.hasClass("kfkline")) {
      let parr = theShape.array();
      if (
        KFK.mouseNear(
          KFK.C3MousePos(evt), {
          x: parr[0][0],
          y: parr[0][1],
        },
          20
        )
      ) {
        KFK.show("#linetransformer");
        KFK.moveLinePoint = "from";
        KFK.lineToResize = theShape;
        KFK.setShapeToRemember(theShape);
        KFK.moveLineMoverTo(
          KFK.jc3PosToJc1Pos({
            x: parr[0][0],
            y: parr[0][1],
          })
        );
      } else if (
        KFK.mouseNear(
          KFK.C3MousePos(evt), {
          x: parr[1][0],
          y: parr[1][1],
        },
          20
        )
      ) {
        KFK.show("#linetransformer");
        KFK.moveLinePoint = "to";
        KFK.lineToResize = theShape;
        KFK.setShapeToRemember(theShape);
        KFK.moveLineMoverTo(
          KFK.jc3PosToJc1Pos({
            x: parr[1][0],
            y: parr[1][1],
          })
        );
      } else {
        KFK.hide("#linetransformer");
      }
    }
  });
  //mouseout shape
  theShape.on("mouseout", () => {
    if (KFK.shapeDragging === false) {
      KFK.hoverSvgLine(null);
      $(document.body).css("cursor", "default");
      if (theShape.hasClass("selected") === false) {
        theShape.stroke({
          width: theShape.attr("origin-width"),
          color: theShape.attr("origin-color"),
        });
      }
    }
  });
  theShape.on("mousedown", (evt) => {
    KFK.closeActionLog();
    if (KFK.mode === "lock") {
      KFK.tryToLockUnlock(evt.shiftKey);
      return;
    }

    KFK.mousePosToRemember = {
      x: KFK.currentMousePos.x,
      y: KFK.currentMousePos.y,
    };
    //begin shape zoom, begin zoom shape
    if (evt.ctrlKey || evt.metaKey) {
      KFK.isZoomingShape = true;
      //这里必须重新plot一遍，否则，在zoom时会出错
      if (theShape.array) {
        let arr = theShape.array();
        theShape = theShape.plot(arr);
      }
      KFK.shapeToZoom = theShape;
      KFK.setShapeToRemember(theShape);
      KFK.shapeSizeCenter = {
        x: KFK.scalePoint(theShape.cx()),
        y: KFK.scalePoint(theShape.cy()),
      };
      KFK.shapeSizeOrigin = {
        w: theShape.width(),
        h: theShape.height(),
      };
      KFK.shapeZoomStartPoint = {
        x: KFK.scalePoint(KFK.scrXToJc3X(evt.clientX)),
        y: KFK.scalePoint(KFK.scrYToJc3Y(evt.clientY)),
      };
      let dis = KFK.distance(KFK.shapeSizeCenter, KFK.shapeZoomStartPoint);
    } else {
      //begin drag shape, begin shape drag
      KFK.isZoomingShape = false;
      KFK.shapeToDrag = theShape;
      KFK.setShapeToRemember(theShape);
      KFK.shapeDraggingStartPoint = {
        x: KFK.scalePoint(KFK.scrXToJc3X(evt.clientX)),
        y: KFK.scalePoint(KFK.scrYToJc3Y(evt.clientY)),
      };
      KFK.shapeFirstDraggingStartPoint = {
        x: KFK.scalePoint(KFK.scrXToJc3X(evt.clientX)),
        y: KFK.scalePoint(KFK.scrYToJc3Y(evt.clientY)),
      };
    }
  });
  //stop zoom shape
  theShape.on("mouseup", (evt) => {
    KFK.stopZoomShape();
  });
  //click line click shape
  theShape.on("click", (evt) => {
    evt.stopImmediatePropagation();
    evt.stopPropagation();
    evt.preventDefault();
    KFK.hoverSvgLine(theShape);
    if (KFK.anyLocked(theShape)) return;
    // if (KFK.firstShown['right'] === false && KFK.docIsNotReadOnly()) {
    // KFK.show('#right');
    // KFK.firstShown['right'] = true;
    // }
    // KFK.shapeToDrag = null;
    KFK.focusOnNode(null);
    KFK.divStylerRefDiv = null;
    KFK.APP.setData("show", "shape_property", true);
    KFK.APP.setData("show", "customshape", false);
    KFK.APP.setData("show", "customline", true);
    KFK.APP.setData("show", "custombacksvg", false);
    KFK.APP.setData("show", "customfont", false);
    KFK.APP.setData("show", "layercontrol", false);

    KFK.setShapeToRemember(theShape);
    KFK.selectShape(theShape);

    KFK.pickedShape = theShape;
    let color = theShape.attr("origin-color");
    let width = theShape.attr("origin-width");
    let linecap = theShape.attr("stroke-linecap");
    $("#lineColor").spectrum("set", KFK.shapeOriginColor);
    $("#spinner_line_width").spinner("value", width);
    let lineSetting = KFK.APP.model.svg.connect.line;
    lineSetting = {
      color: color,
      width: width,
      linecap: linecap === "round" ? true : false,
    };
    KFK.setAppData("model", "line", lineSetting);
  });
};

KFK.initLineTransformer = function () {
  KFK.debug("...initLineTransformer");
  $("#linetransformer").draggable({
    // move line resize line transform line
    start: (evt, ui) => {
      KFK.closeActionLog();
      KFK.lineTransfomerDragging = true;
      // KFK.fromJQ = KFK.tobeTransformJqLine.clone();
      // KFK.setMode('line');
      evt.stopImmediatePropagation();
      evt.stopPropagation();
    },

    drag: (evt, ui) => {
      if (KFK.tempSvgLine) KFK.tempSvgLine.hide();
      if (KFK.lineToResize === null) return;
      let parr = KFK.lineToResize.array();
      let stopAtPos = KFK.C3MousePos(evt);
      if (KFK.moveLinePoint === "from") {
        KFK.lineToResize.plot([
          [stopAtPos.x, stopAtPos.y], parr[1]
        ]);
      } else {
        KFK.lineToResize.plot([parr[0],
        [stopAtPos.x, stopAtPos.y]
        ]);
      }
    },
    stop: async (evt, ui) => {
      //transform line  change line
      KFK.lineTransfomerDragging = false;
      if (KFK.lineToResize === null) return;
      KFK.setShapeToRemember(KFK.lineToResize);
      let parr = KFK.lineToResize.array();
      let stopAtPos = KFK.C3MousePos(evt);
      if (KFK.APP.model.viewConfig.snap) {
        stopAtPos = KFK.getNearGridPoint(stopAtPos);
        let smp = KFK.ScreenMousePos(stopAtPos);
        KFK.moveDIVCenterToPos($("#linetransformer"), smp);
      }
      if (KFK.moveLinePoint === "from") {
        KFK.lineToResize.plot([
          [stopAtPos.x, stopAtPos.y], parr[1]
        ]);
      } else {
        KFK.lineToResize.plot([parr[0],
        [stopAtPos.x, stopAtPos.y]
        ]);
      }
      await KFK.syncLinePut(
        "U",
        KFK.lineToResize,
        "resize",
        KFK.shapeToRemember,
        false
      );
      KFK.hide("#linetransformer");
    },
  }); //line transformer. draggable()
};

KFK.svgDrawTmpLine = function (fx, fy, tx, ty, option) {
  let tmpLineClass = "shape_temp";

  //按着alt的话，需要画成垂直或水平线
  if (KFK.KEYDOWN.alt) {
    if (Math.abs(tx - fx) < Math.abs(ty - fy)) tx = fx;
    else ty = fy;
  }
  KFK.tempSvgLine = KFK.svgDraw.findOne(`.${tmpLineClass}`);
  if (KFK.tempSvgLine) {
    KFK.tempSvgLine.show();
    KFK.tempSvgLine.plot(fx, fy, tx, ty).stroke(option);
  } else {
    KFK.tempSvgLine = KFK.svgDraw
      .line(fx, fy, tx, ty)
      .addClass(tmpLineClass)
      .stroke(option);
  }
};

/**
 * 画线
 *
 * @param {string} fid - 起始节点的ID
 * @param {string} tid - 终点节点的ID
 * @param {number} fbp - 起始节点上的连接点的编号,从0-3
 * @param {number} tbp - 终点节点上的连接点的编号,从0-3
 * @param {number} fx - 连接点1的x坐标
 * @param {number} fy - 连接点1的y坐标
 * @param {number} tx - 连接点2的x坐标
 * @param {number} ty - 连接点2的y坐标
 */
KFK.svgConnectNode = async function (fid, tid, fbp, tbp, fx, fy, tx, ty, caseValue) {
  if (!(fid && tid)) {
    return;
  }
  let fromDIV = $(`#${fid}`);
  let lineClass = `connect_${fid}_${tid}`;
  let lineClassReverse = `connect_${tid}_${fid}`;
  let pstr = "";
  let lstr = "";
  let tstr = "";
  let x = [0, 0, 0, 0];
  let y = [0, 0, 0, 0];
  let ctrls = [0.4, 0.5, 0.5, 0.6];
  let triangle = [];
  let rad = 20;
  let ww = 10;
  let tri = 10;
  if (fromDIV.attr("cnwidth"))
    tri = Math.max(parseInt(fromDIV.attr("cnwidth")) * 2, 10);
  let tri_half = tri * 0.5;
  let tri_height = 17.3;
  let tsx = tx,
    tsy = ty - tri_height;
  //算出箭头三角形的三个顶点的坐标
  switch (tbp) {
    case 0:
      tsx = tx - tri_height;
      tsy = ty;
      triangle = [tsx, tsy + tri_half, tx, ty, tsx, tsy - tri_half];
      break;
    case 1:
      tsx = tx;
      tsy = ty - tri_height;
      triangle = [tsx - tri_half, tsy, tx, ty, tsx + tri_half, tsy];
      break;
    case 2:
      tsx = tx + tri_height;
      tsy = ty;
      triangle = [tsx, tsy - tri_half, tx, ty, tsx, tsy + tri_half];
      break;
    case 3:
      tsx = tx;
      tsy = ty + tri_height;
      triangle = [tsx - tri_half, tsy, tx, ty, tsx + tri_half, tsy];
      break;
  }
  //画线不用画到重点，只需要画到三角形即可
  switch (tbp) {
    case 0:
      tx = tx - tri_height;
      break;
    case 1:
      ty = ty - tri_height;
      break;
    case 2:
      tx = tx + tri_height;
      break;
    case 3:
      ty = ty + tri_height;
      break;
  }
  let dis = 0;
  switch (fbp) {
    case 0:
      switch (tbp) {
        case 0:
          pstr = `M${fx} ${fy} C${fx - rad} ${fy} ${tx - rad} ${ty} ${tx} ${ty}`;
          break;
        case 1:
          pstr = `M${fx} ${fy} C${tx} ${fy} ${tx} ${ty} ${tx} ${ty}`;
          break;
        case 2:
          lstr = `M${fx} ${fy} C${tx} ${fy} ${fx} ${ty} ${tx} ${ty}`;
          tstr = `M${tx} ${ty} C${fx} ${ty} ${tx} ${fy} ${fx} ${fy}`;
          dis = Math.abs(tx - fx);
          if (ty >= fy) {
            x = [3, 2, 0, 1].map((x) => fx - dis * ctrls[x]);
          } else {
            x = [0, 1, 3, 2].map((x) => fx - dis * ctrls[x]);
          }
          pstr =
            `M${fx},${fy + ww} ` +
            `L${fx},${fy - ww} ` +
            `C${x[0]},${fy - ww} ` +
            `${x[1]},${ty} ` +
            `${tx},${ty} ` +
            `C${x[2]},${ty} ` +
            `${x[3]},${fy + ww} ` +
            `${fx},${fy + ww} z`;
          break;
        case 3:
          pstr = `M${fx} ${fy} C${tx} ${fy} ${tx} ${ty} ${tx} ${ty}`;
          break;
      }
      break;
    case 1:
      switch (tbp) {
        case 0:
          pstr = `M${fx} ${fy} C${fx} ${ty} ${tx} ${ty} ${tx} ${ty}`;
          break;
        case 1:
          pstr = `M${fx} ${fy} C${fx} ${ty - rad} ${tx} ${ty -
            rad} ${tx} ${ty}`;
          break;
        case 2:
          pstr = `M${fx} ${fy} C${fx} ${ty} ${tx} ${ty} ${tx} ${ty}`;
          break;
        case 3:
          lstr = `M${fx} ${fy} C${fx} ${ty} ${tx} ${fy} ${tx} ${ty}`;
          tstr = `M${tx} ${ty} C${tx} ${fy} ${fx} ${ty} ${fx} ${fy}`;
          dis = Math.abs(ty - fy);
          if (tx >= fx) {
            y = [3, 2, 0, 1].map((x) => fy - dis * ctrls[x]);
          } else {
            y = [0, 1, 3, 2].map((x) => fy - dis * ctrls[x]);
          }
          pstr =
            `M${fx + ww},${fy} ` +
            `L${fx - ww},${fy} ` +
            `C${fx - ww}, ${y[0]} ` +
            `${tx}, ${y[1]} ` +
            `${tx},${ty} ` +
            `C${tx}, ${y[2]} ` +
            `${fx + ww}, ${y[3]} ` +
            `${fx + ww},${fy} z`;
          break;
      }
      break;
    case 2:
      switch (tbp) {
        case 0:
          dis = Math.abs(tx - fx);
          lstr = `M${fx} ${fy} C${tx} ${fy} ${fx} ${ty} ${tx} ${ty}`;
          tstr = `M${tx} ${ty} C${tx} ${fy} ${fx} ${ty} ${fx} ${fy}`;
          if (ty >= fy) {
            x = [3, 2, 0, 1].map((x) => fx + dis * ctrls[x]);
          } else {
            x = [0, 1, 3, 2].map((x) => fx + dis * ctrls[x]);
          }
          pstr =
            `M${fx},${fy + ww} ` +
            `L${fx},${fy - ww} ` +
            `C${x[0]},${fy - ww} ` +
            `${x[1]},${ty} ` +
            `${tx},${ty} ` +
            `C${x[2]},${ty} ` +
            `${x[3]},${fy + ww} ` +
            `${fx},${fy + ww} z`;
          break;
        case 1:
          lstr = `M${fx} ${fy} C${tx} ${fy} ${tx} ${ty} ${tx} ${ty}`;
          tstr = `M${tx} ${ty} C${tx} ${ty} ${tx} ${fy} ${fx} ${fy}`;
          dis = Math.abs(tx - fx);
          if (ty >= fy) {
            x = [3, 2, 0, 1].map((x) => fx + dis * ctrls[x]);
          } else {
            x = [0, 1, 3, 2].map((x) => fx + dis * ctrls[x]);
          }
          pstr =
            `M${fx},${fy + ww} ` +
            `L${fx},${fy - ww} ` +
            `C${x[0]},${fy - ww} ` +
            `${tx},${ty} ` +
            `${tx},${ty} ` +
            `C${tx},${ty} ` +
            `${x[3]},${fy + ww} ` +
            `${fx},${fy + ww} z`;
          break;
        case 2:
          dis = Math.abs(tx - fx);
          lstr = `M${fx} ${fy} C${fx + rad} ${fy} ${tx + rad} ${ty} ${tx} ${ty}`;
          tstr = `M${tx} ${yy} C${tx + rad} ${ty} ${fx + rad} ${fy} ${fx} ${fy}`;
          if (ty >= fy) {
            x = [3, 2, 0, 1].map((x) => fx + dis * ctrls[x]);
          } else {
            x = [0, 1, 3, 2].map((x) => fx + dis * ctrls[x]);
          }
          pstr =
            `M${fx},${fy + ww} ` +
            `L${fx},${fy - ww} ` +
            `C${tx + rad},${fy - ww} ` +
            `${tx + rad},${ty} ` +
            `${tx},${ty} ` +
            `C${tx + rad},${ty} ` +
            `${tx + rad},${fy + ww} ` +
            `${fx},${fy + ww} z`;
          break;
        case 3:
          pstr = `M${fx} ${fy} C${tx} ${fy} ${tx} ${ty} ${tx} ${ty}`;
          break;
      }
      break;
    case 3:
      switch (tbp) {
        case 0:
          pstr = `M${fx} ${fy} C${fx} ${ty} ${tx} ${ty} ${tx} ${ty}`;
          break;
        case 1:
          lstr = `M${fx} ${fy} C${fx} ${ty} ${tx} ${fy} ${tx} ${ty}`;
          tstr = `M${tx} ${ty} C${tx} ${fy} ${fx} ${ty} ${fx} ${fy}`;
          dis = Math.abs(ty - fy);
          if (tx >= fx) {
            y = [3, 2, 0, 1].map((x) => fy + dis * ctrls[x]);
          } else {
            y = [0, 1, 3, 2].map((x) => fy + dis * ctrls[x]);
          }
          pstr =
            `M${fx + ww},${fy} ` +
            `L${fx - ww},${fy} ` +
            `C${fx - ww}, ${y[0]} ` +
            `${tx}, ${y[1]} ` +
            `${tx},${ty} ` +
            `C${tx}, ${y[2]} ` +
            `${fx + ww}, ${y[3]} ` +
            `${fx + ww},${fy} z`;
          break;
        case 2:
          pstr = `M${fx} ${fy} C${fx} ${ty} ${tx} ${ty} ${tx} ${ty}`;
          break;
        case 3:
          pstr = `M${fx} ${fy} C${fx} ${fy + rad} ${tx} ${ty +
            rad} ${tx} ${ty}`;
          break;
      }
      break;
  }
  await KFK._svgDrawNodesConnect(
    fid,
    tid,
    lineClass,
    lineClassReverse,
    pstr,
    lstr,
    tstr,
    triangle,
    caseValue,
    KFK.APP.model.viewConfig.simpleLineMode
  );
};

KFK.myFadeIn = function (jq, ms = 200) {
  jq &&
    jq
      .css({
        visibility: "visible",
        opacity: 0.0,
      })
      .animate({
        opacity: 1.0,
      },
        ms
      );
};
KFK.myFadeOut = function (jq, ms = 200) {
  jq &&
    jq.animate({
      opacity: 0.0,
    },
      ms,
      function () {
        jq.css("visibility", "hidden");
      }
    );
};
KFK.hide = function (jq) {
  if (typeof jq === "string") jq = $(jq);
  jq.addClass("noshow");
};
KFK.show = function (jq) {
  if (typeof jq === "string") jq = $(jq);
  jq.removeClass("noshow");
};
/**
 * Is a div visible, visible means it has not 'noshow' class
 */
KFK.isShowing = function (jq) {
  if (typeof jq === "string") jq = $(jq);
  return jq.hasClass("noshow") === false;
};

KFK.checkBrowser = function () {
  const browser = Bowser.getParser(window.navigator.userAgent);
  let isValidBrowser = browser.satisfies({
    // or in general
    chrome: ">70",
    edge: ">70",
  });
  KFK.setAppData("model", "isValidBrowser", isValidBrowser);
  KFK.setAppData("model", "isNotValidBrowser", !isValidBrowser);
  KFK.APP.model.osName = browser.getOSName(true);
  KFK.debug("isValidBrowser", isValidBrowser);
  KFK.debug("osName", KFK.APP.model.osName);
  console.log(browser);
  if (["ios", "android"].indexOf(KFK.APP.model.osName) >= 0) {
    KFK.APP.model.isMobile = true;
    KFK.APP.model.isPC = false;
  } else {
    KFK.APP.model.isMobile = false;
    KFK.APP.model.isPC = true;
  }
};


KFK.onDropFiles = async function (files) {
  let aFile = files[0];
  if (NotSet(aFile)) return;
  if (aFile.type !== "image/png" && aFile.type !== "image/jpeg") {
    await KFK.onDropDocFile(aFile);
  } else {
    await KFK.onDropImage(aFile);
  }
};
KFK.onDropDocFile = async function (aFile) {
  KFK.scrLog("当前用户只能上传JPG或PNG格式图片");
  let fileData = new Blob(aFile);
  // Pass getBuffer to promise.
  var promise = new Promise(getBuffer(fileData));
  // Wait for promise to be resolved, or log error.
  promise
    .then(function (data) {
      // Here you can pass the bytes to another function.
      console.log(data);
    })
    .catch(function (err) {
      console.log("Error: ", err);
    });
};
KFK.getBuffer = function (fileData) {
  return function (resolve) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(fileData);
    reader.onload = function () {
      var arrayBuffer = reader.result;
      var bytes = new Uint8Array(arrayBuffer);
      resolve(bytes);
    };
  };
};

KFK.onDropImage = async function (imageFile) {
  function onProgress(p) {
    KFK.scrLog(`正在为您准备图片, 请稍候${p}%`, 2000);
  }
  const options = {
    // maxSizeMB: 3,
    maxWidthOrHeight: Math.round(
      Math.min(KFK.PageHeight * 0.5, KFK.PageWidth * 0.5)
    ),
    useWebWorker: true,
    onProgress: onProgress,
  };
  try {
    //const compressedImage = await imageCompression(imageFile, options);
    //KFK.fileToUpload = compressedImage;
    KFK.fileToUpload = imageFile;
    await KFK.sendCmd("GETSTS", {
      stsFor: "drop",
    });
  } catch (error) {
    console.error(error);
  }
};

KFK.onGotSTS = function (response) {
  KFK.sts = response.credential;
  // KFK.uploadToQcloudCOS();
  if (response.stsFor === "drop") {
    KFK.uploadFileToQcloudCOS(KFK.fileToUpload);
  } else if (response.stsFor === "paste") {
    KFK.uploadFileToQcloudCOS(KFK.blobToPaste);
  }
};

KFK.procPasteBlob = async function (blob) {
  KFK.blobToPaste = blob;
  await KFK.sendCmd("GETSTS", {
    stsFor: "paste",
  });
};


KFK.uploadFileToQcloudCOS = function (file) {
  let cos = new COS({
    getAuthorization: function (options, callback) {
      callback({
        TmpSecretId: KFK.sts.credentials.tmpSecretId, // 临时密钥的 tmpSecretId
        TmpSecretKey: KFK.sts.credentials.tmpSecretKey, // 临时密钥的 tmpSecretKey
        XCosSecurityToken: KFK.sts.credentials.sessionToken, // 临时密钥的 sessionToken
        StartTime: KFK.sts.startTime,
        ExpiredTime: KFK.sts.expiredTime,
      });
    },
  });
  let fileId = KFK.myuid();
  let fileName = fileId + "." + file.type.substr(file.type.indexOf("/") + 1);
  let fileKeyName = KFK.APP.model.cocouser.orgid + "/" + fileName;
  if (file.size > 1024 * 1024) {
    cos.sliceUploadFile({
      Bucket: cocoConfig.cos.bucket,
      Region: cocoConfig.cos.region,
      Key: fileKeyName,
      Body: file,
      onTaskReady: function (tid) {
        KFK.TaskId = tid;
      },
      onHashProgress: function (progressData) {
        console.log("onHashProgress", JSON.stringify(progressData));
      },
      onProgress: function (progressData) {
        console.log("onProgress", JSON.stringify(progressData));
      },
    },
      async function (err, data) {
        if (err) {
          console.log("putObject got error:", err);
        } else {
          console.log("putObject success:", data);
          try {
            let imgUrl =
              "https://" +
              cocoConfig.cos.reverseproxy +
              data.Location.substr(data.Location.indexOf("/"));
            await KFK.makeImageDiv(
              fileId,
              KFK.dropAtPos.x,
              KFK.dropAtPos.y,
              imgUrl
            );
            await KFK.refreshMatLibForAll();
          } catch (error) {
            console.error(error);
          }
        }
      }
    );
  } else {
    // console.log( "Bebegin putObject, Bucket", cocoConfig.cos.bucket, "region", cocoConfig.cos.region, "Key", fileKeyName);
    cos.putObject({
      Bucket: cocoConfig.cos.bucket, // Bucket 格式：test-1250000000
      Region: cocoConfig.cos.region,
      Key: fileKeyName,
      Body: file,
      onTaskReady: function (tid) {
        KFK.TaskId = tid;
      },
      onHashProgress: function (progressData) {
        console.log("onHashProgress", JSON.stringify(progressData));
      },
      onProgress: function (progressData) {
        console.log(JSON.stringify(progressData));
      },
    },
      async function (err, data) {
        if (err) {
          console.log("putObject got error:", err);
        } else {
          console.log("putObject success:", data);
          try {
            let imgUrl =
              "https://" +
              cocoConfig.cos.reverseproxy +
              data.Location.substr(data.Location.indexOf("/"));
            // console.log(data); console.log(imgUrl);
            await KFK.makeImageDiv(
              fileId,
              KFK.dropAtPos.x,
              KFK.dropAtPos.y,
              imgUrl
            );
            await KFK.refreshMatLibForAll();
          } catch (error) {
            console.error(error);
          }
        }
      }
    );
  }
};

KFK.getFrontEndUrl = (obj) => {
  return cocoConfig.frontend.url + "/" + obj;
};

KFK.getBossImageUrl = (img) => {
  return cocoConfig.frontend.url + "/boss/" + img;
};

/**
 * 判断一个div是否存在
 * @param div 可以是一个jqdiv对象，也可以是一个jqdiv的id
 */
KFK.nodeExist = (div) => {
  //
  let jqObjById = null;
  if (typeof div === "string") {
    jqObjById = $("#" + div);
  } else {
    jqObjById = $("#" + div.attr("id"));
  }
  if (jqObjById.length > 0) {
    return true;
  } else {
    return false;
  }
};
KFK.nodeNotExist = (jqdiv) => {
  return !KFK.nodeExist(jqdiv);
};


KFK.clickOnLeftPanel = function (evt) {
  // console.log("Clcik on Left Panel");
  // console.log(evt);
  evt.stopPropagation();
  evt.preventDefault();
};
KFK.clickOnRightPanel = function (evt) {
  evt.stopPropagation();
};
KFK.pmsOk = function () {
  return KFK.docIsNotReadOnly();
};

KFK.onChange = function (reason) {
  console.log("onChange", reason);
  KFK.templateChangeTimer && clearTimeout(KFK.templateChangeTimer);
  KFK.templateChangeTimer = setTimeout(() => {
    console.log("saving...");
    let tpldoc = KFK.drawingToTemplateDoc();
    console.log(tpldoc);
    Client.putTemplate(tpldoc);
    KFK.templateChangeTimer = undefined;
  }, 2000);
};

KFK.drawingToTemplateDoc = function () {
  let nodes = KFK.JC3.find(".node");
  let connects = KFK.svgDraw.find(".connect");
  let tplDocHtml = `<div class="template" id="${KFK.currentTplId}">`;

  nodes.each((index, aNode) => {
    let origJqNode = $(aNode);
    let jqNode = origJqNode.clone();
    KFK.removeNodeEventFootprint(jqNode);
    jqNode.removeClass("kfknode");
    let nodeHtml = jqNode.prop("outerHTML");
    tplDocHtml += nodeHtml;
  });
  connects.each((aConnect) => {
    let linkHtml = `<div class="link" from="${aConnect.attr('fid')}" to="${aConnect.attr('tid')}"></div>`;
    if (lodash.isEmpty(aConnect.attr("case")) === false) {
      linkHtml = `<div class="link" from="${aConnect.attr('fid')}" to="${aConnect.attr('tid')}" case="${aConnect.attr('case')}"></div>`;
    }
    tplDocHtml += linkHtml;
  });
  tplDocHtml += "</div>";

  return tplDocHtml;
};

//on click node, node prop
KFK.showPropForm = function (jqDIV) {
  //如果传递过来的是空或者null，就隐藏掉rightPanel
  if (NotSet(jqDIV)) {
    if (KFK.currentJqNode)
      KFK.appDataToNode("set nodisplay on undefined jqDIV");
    $('#rightPanel').addClass("nodisplay");
    return;
  }
  //否则，就要把rightPanel显示出来
  $('#rightPanel').removeClass("nodisplay");
  //先把针对不同节点类型的属性DIV全部隐藏起来
  $('#rightPanel').find('div.prop_form').each((index, aDiv) => {
    $(aDiv).addClass("nodisplay");
  });
  //然后针对edit/view的section全部隐藏起来
  $('#rightPanel').find('div.prop_section').each((index, aDiv) => {
    $(aDiv).addClass("nodisplay");
  });
  if (jqDIV) {
    if (KFK.currentJqNode && KFK.curentJqNode !== jqDIV) {
      //如果之前有节点，则先保存它的值
      KFK.appDataToNode("Save previous");
    }

    let formToShow = "";
    KFK.currentJqNode = jqDIV;
    if (jqDIV.hasClass("START")) {
      formToShow = "START";
      KFK.nodeToAppData();
    } else if (jqDIV.hasClass("ACTION")) {
      formToShow = "ACTION";
      KFK.nodeToAppData();
    } else if (jqDIV.hasClass("SCRIPT")) {
      formToShow = "SCRIPT";
      KFK.nodeToAppData();
    } else if (jqDIV.hasClass("INFORM")) {
      formToShow = "INFORM";
      KFK.nodeToAppData();
    } else if (jqDIV.hasClass("TIMER")) {
      formToShow = "TIMER";
      KFK.nodeToAppData();
    } else if (jqDIV.hasClass("SUB")) {
      formToShow = "SUB";
      KFK.nodeToAppData();
    } else if (jqDIV.hasClass("AND")) {
      formToShow = "AND";
      KFK.nodeToAppData();
    } else if (jqDIV.hasClass("OR")) {
      formToShow = "OR";
      KFK.nodeToAppData();
    } else {
      console.warn(jqDIV.attr("class"), "property form not implemented");
    }
    if (formToShow !== "") {
      $(`#prop_${formToShow}`).removeClass("nodisplay");
      $(`#prop_${formToShow} .${KFK.tpl_mode}`).removeClass("nodisplay");
    }
  }
};

KFK.closeProperties = function () {
  $('#rightPanel').addClass("nodisplay");
  if (KFK.currentJqNode)
    KFK.appDataToNode("closeProperties");
};

/**
 * KFK.nodeToAppData.
 * set App data with Node properties
 *
 * @param {} jqDIV
 */
KFK.nodeToAppData = function (jqDIV) {
  if (NotSet(jqDIV)) jqDIV = KFK.currentJqNode;
  if (jqDIV.hasClass("START")) {
    console.error("TODO: here");
  } else if (jqDIV.hasClass("ACTION")) {
    KFK.APP.node.ACTION.id = jqDIV.attr("id").trim();
    KFK.APP.node.ACTION.role = BlankToDefault(jqDIV.attr("role"), "DEFAULT");
    KFK.APP.node.ACTION.label = BlankToDefault(jqDIV.find("p").first().text(), "Activity").trim();
    let kvarsString = BlankToDefault(jqDIV.find(".kvars").text(), "e30=");
    kvarsString = KFK.base64ToCode(kvarsString);
    KFK.APP.node.ACTION.kvars = kvarsString;
    let kattsString = BlankToDefault(jqDIV.find(".katts").text(), "e30=");
    kattsString = KFK.base64ToCode(kattsString);
    KFK.APP.node.ACTION.katts = kattsString;
  } else if (jqDIV.hasClass("SCRIPT")) {
    KFK.APP.node.SCRIPT.id = jqDIV.attr("id");
    KFK.APP.node.SCRIPT.label = BlankToDefault(jqDIV.find("p").first().text(), "").trim();
    let str = BlankToDefault(jqDIV.find("code").first().text(), "").trim();
    str = KFK.base64ToCode(str);
    KFK.APP.node.SCRIPT.code = str;
  } else if (jqDIV.hasClass("INFORM")) {
    KFK.APP.node.INFORM.id = jqDIV.attr("id");
    KFK.APP.node.INFORM.label = BlankToDefault(jqDIV.find("p").first().text(), "Email").trim();
    KFK.APP.node.INFORM.role = BlankToDefault(jqDIV.attr("role"), "DEFAULT");
    KFK.APP.node.INFORM.subject = BlankToDefault(jqDIV.find("subject").first().text(), "").trim();
    KFK.APP.node.INFORM.content = BlankToDefault(jqDIV.find("content").first().text(), "").trim();
  } else if (jqDIV.hasClass("TIMER")) {
    KFK.APP.node.TIMER.id = jqDIV.attr("id");
    KFK.APP.node.TIMER.label = BlankToDefault(jqDIV.find("p").first().text(), "").trim();
    let str = BlankToDefault(jqDIV.find("code").first().text(), "").trim();
    KFK.APP.node.TIMER.code = str;
  } else if (jqDIV.hasClass("SUB")) {
    KFK.APP.node.SUB.id = jqDIV.attr("id");
    KFK.APP.node.SUB.label = BlankToDefault(jqDIV.find("p").first().text(), "").trim();
    let str = BlankToDefault(jqDIV.attr("sub"), "").trim();
    KFK.APP.node.SUB.sub = str;
  } else {
    console.warn(jqDIV.attr("class"), "nodetoAppData not implemented.");
  }
};

/**
 * KFK.appDataToNode.
 * Sync the APP data to node properties
 *
 * @param {} jqDIV, if not set, use KFK.currentJqNode, if not set then, do nothing
 */
KFK.appDataToNode = function (reason) {
  if (KFK.tpl_mode !== "edit") return;
  //如果连当前的也不存在，就要返回
  if (NotSet(KFK.currentJqNode)) return;
  let jqDIV = KFK.currentJqNode;
  //是否属性有变化
  let dirtyCount = 0;
  if (jqDIV.hasClass("ACTION")) {
    dirtyCount += KFK.setNodeLabel(jqDIV, KFK.APP.node.ACTION.label);
    dirtyCount += KFK.setNodeId(jqDIV, KFK.APP.node.ACTION.id);
    let theRole = jqDIV.attr("role");
    theRole = theRole ? theRole.trim() : "";
    if (theRole !== KFK.APP.node.ACTION.role.trim() &&
      KFK.APP.node.ACTION.role.trim() !== "DEFAULT" &&
      NotBlank(KFK.APP.node.ACTION.role.trim())) {
      jqDIV.attr("role", KFK.APP.node.ACTION.role.trim());
      console.log("Dirty: role changed");
      dirtyCount += 1;
    }
    let appData_kvars = KFK.APP.node.ACTION.kvars.trim();
    let codeInBase64 = "";
    if (NotBlank(appData_kvars)) {
      try {
        let json = JSON.parse(appData_kvars);
        codeInBase64 = KFK.codeToBase64(appData_kvars);
      } catch (error) {
        codeInBase64 = "ERROR";
      }
    }
    if (codeInBase64 === "ERROR") {
      console.log("JSON format error:", appData_kvars);
    } else {
      if (jqDIV.find(".kvars").length > 0) {
        if (jqDIV.find(".kvars").first().text().trim() !== codeInBase64) {
          console.log("Dirty: kvars changed");
          dirtyCount += 1;
          jqDIV.find(".kvars").first().prop("innerText", codeInBase64);
        }
      } else {
        jqDIV.append('<div class="kvars">' + codeInBase64 + "</div>");
        console.log("Dirty: append kvars");
        dirtyCount += 1;
      }
    }

    let appData_katts = KFK.APP.node.ACTION.katts.trim();
    codeInBase64 = "";
    if (NotBlank(appData_katts)) {
      try {
        let json = JSON.parse(appData_katts);
        codeInBase64 = KFK.codeToBase64(appData_katts);
      } catch (error) {
        codeInBase64 = "ERROR";
      }
    }
    if (codeInBase64 === "ERROR") {
      console.log("JSON format error:", appData_katts);
    } else {
      if (jqDIV.find(".katts").length > 0) {
        if (jqDIV.find(".katts").first().text().trim() !== codeInBase64) {
          console.log("Dirty: katts changed");
          dirtyCount += 1;
          jqDIV.find(".katts").first().prop("innerText", codeInBase64);
        }
      } else {
        jqDIV.append('<div class="katts">' + codeInBase64 + "</div>");
        console.log("Dirty: append katts");
        dirtyCount += 1;
      }
    }
  } else if (jqDIV.hasClass("SCRIPT")) {
    dirtyCount += KFK.setNodeId(jqDIV, KFK.APP.node.SCRIPT.id);
    dirtyCount += KFK.setNodeLabel(jqDIV, KFK.APP.node.SCRIPT.label);
    let appData_code = KFK.APP.node.SCRIPT.code.trim();
    let codeInBase64 = "";
    if (NotBlank(appData_code)) {
      codeInBase64 = KFK.codeToBase64(appData_code);
    }
    if (jqDIV.find("code").length > 0) {
      if (jqDIV.find("code").first().text().trim() !== codeInBase64) {
        console.log("Dirty: code changed");
        dirtyCount += 1;
        jqDIV.find("code").prop("innerText", codeInBase64);
      }
    } else {
      jqDIV.append("<code>" + codeInBase64 + "</code>");
      console.log("Dirty: append code");
      dirtyCount += 1;
    }
  } else if (jqDIV.hasClass("INFORM")) {
    dirtyCount += KFK.setNodeLabel(jqDIV, KFK.APP.node.INFORM.label);
    let subject = KFK.APP.node.INFORM.subject.trim();
    let content = KFK.APP.node.INFORM.content.trim();
    let node_subject = "";
    let node_content = "";
    let theRole = jqDIV.attr("role");
    theRole = theRole ? theRole.trim() : "";
    if (theRole !== KFK.APP.node.INFORM.role.trim() &&
      KFK.APP.node.INFORM.role.trim() !== "DEFAULT" &&
      NotBlank(KFK.APP.node.INFORM.role.trim())) {
      jqDIV.attr("role", KFK.APP.node.INFORM.role.trim());
      console.log("Dirty: role changed");
      dirtyCount += 1;
    }
    if (jqDIV.find("subject").length > 0) {
      node_subject = jqDIV.find("subject").first().text().trim();
      if (node_subject !== subject) {
        dirtyCount += 1;
        console.log("Dirty: subject changed");
        jqDIV.find("subject").prop("innerText", subject);
      }
    } else {
      jqDIV.append("<subject>" + subject + "</subject>");
      console.log("Dirty: append subject");
      dirtyCount += 1;
    }
    if (jqDIV.find("content").length > 0) {
      node_content = jqDIV.find("content").first().text().trim();
      if (node_content !== content) {
        dirtyCount += 1;
        console.log("Dirty: content changed");
        jqDIV.find("content").prop("innerText", content);
      }
    } else {
      jqDIV.append("<content>" + content + "</content>");
      console.log("Dirty: append content");
      dirtyCount += 1;
    }
  } else if (jqDIV.hasClass("TIMER")) {
    dirtyCount += KFK.setNodeLabel(jqDIV, KFK.APP.node.TIMER.label);
    let appData_code = KFK.APP.node.TIMER.code.trim();
    if (jqDIV.find("code").length > 0) {
      if (jqDIV.find("code").first().text().trim() !== appData_code) {
        console.log("Dirty: code changed");
        dirtyCount += 1;
        jqDIV.find("code").prop("innerText", appData_code);
      }
    } else {
      jqDIV.append("<code>" + appData_code + "</code>");
      console.log("Dirty: append code");
      dirtyCount += 1;
    }
  } else if (jqDIV.hasClass("SUB")) {
    dirtyCount += KFK.setNodeId(jqDIV, KFK.APP.node.SUB.id);
    dirtyCount += KFK.setNodeLabel(jqDIV, KFK.APP.node.SUB.label);
    let appData_sub = KFK.APP.node.SUB.sub.trim();
    if (jqDIV.attr("sub").trim() !== appData_sub) {
      console.log("Dirty: sub changed");
      dirtyCount += 1;
      jqDIV.attr("sub", appData_sub);
    }
  } else {
    console.warn(jqDIV.attr("class"), "appDataToNode not implemented.");
  }
  if (dirtyCount > 0) {
    //属性有变化，则出发保存
    console.log(reason);
    KFK.onChange("Property Changed");
  }
};

KFK.setNodeId = function (jqDIV, id) {
  let isDirty = false;
  if (jqDIV.attr("id").trim() !== id.trim() && NotBlank(id.trim())) {
    jqDIV.attr("id", id.trim());
    console.log("Dirty: id changed");
    isDirty = true;
  }
  if (IsBlank(id.trim())) {
    if (IsBlank(jqDIV.attr("id").trim())) {
      jqDIV.attr("id", KFK.myuid());
      console.log("Dirty: id changed");
      isDirty = true;
    }
  }
  return isDirty ? 1 : 0;
}
KFK.setNodeLabel = function (jqDIV, label) {
  let isDirty = false;
  label = label.trim();
  let node_label = "";
  if (jqDIV.find("p").length > 0) {
    node_label = jqDIV.find("p").first().text().trim();
    if (node_label !== label) {
      isDirty = true;
      console.log("Dirty: label changed");
      jqDIV.find("p").first().prop("innerText", label);
    }
  } else {
    jqDIV.append("<p>" + label + "</p>");
    console.log("Dirty: append p-label");
    isDirty = true;
  }
  return isDirty ? 1 : 0;
};



document.onpaste = KFK.onPaste;
document.oncopy = KFK.onCopy;
document.oncut = KFK.onCut;

let urlFull = window.location.href;
let myURL = new URL(urlFull);
KFK.tplid = myURL.searchParams.get("tplid");
KFK.wfid = myURL.searchParams.get("wfid");
KFK.tpl_mode = myURL.searchParams.get("mode");
KFK.tpl_mode = lodash.isEmpty(KFK.tpl_mode) ? "view" : KFK.tpl_mode;

console.log(KFK.tplid, KFK.tpl_mode);

export default KFK;
