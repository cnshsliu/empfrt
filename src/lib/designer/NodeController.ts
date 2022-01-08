const NodeController = {
	locked: (jqNode: any): boolean => {
		return jqNode.hasClass('lock');
	},
	lock: (jqNode: any): void => {
		if (!jqNode) {
			console.warn('lock a no existing node');
			return;
		}
		jqNode.addClass('lock');
		const lockLabel = jqNode.find('.locklabel');
		if (lockLabel.length === 0) {
			jqNode.append('<div class="locklabel"/>');
		}

		NodeController.safeNodeEventModify(jqNode, 'draggable', 'disable');
		NodeController.safeNodeEventModify(jqNode, 'resizable', 'disable');
		NodeController.safeNodeEventModify(jqNode, 'droppable', 'disable');
	},
	lockline: (KFK, line) => {
		if (!line) {
			console.warn('lock a no existing line');
			return;
		}
		line.addClass('lock');
		KFK.lockLine(line);
	},
	unlockline: (KFK, line) => {
		if (!line) {
			console.warn('unlock a no existing line');
			return;
		}
		line.removeClass('lock');
		KFK.lockLine(line, false);
	},
	safeNodeEventModify: (jqNode, action, flag) => {
		if (jqNode === undefined) {
			console.log(new Error().stack);
		}
		if (action === 'draggable' && jqNode.hasClass('ui-draggable')) {
			jqNode.draggable(flag);
		} else if (action === 'resizable' && jqNode.hasClass('ui-resizable')) {
			jqNode.resizable(flag);
		} else if (action === 'droppable' && jqNode.hasClass('ui-droppable')) {
			jqNode.droppable(flag);
		}
	},
	unlock: (jqNode) => {
		if (!jqNode) {
			console.warn('unlock a no existing node');
			return;
		}
		jqNode.removeClass('lock');
		const lockLabel = jqNode.find('.locklabel');
		if (lockLabel.length > 0) {
			lockLabel.first().remove();
		}
		NodeController.safeNodeEventModify(jqNode, 'draggable', 'enable');
		NodeController.safeNodeEventModify(jqNode, 'resizable', 'enable');
		NodeController.safeNodeEventModify(jqNode, 'droppable', 'enable');
	}
};

export default NodeController;
