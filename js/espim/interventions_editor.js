/**********************************************************************************************
                                     InterventionEditor
***********************************************************************************************/

var InterventionEditor = function(area_name, panel_group_name, canvas) {
	this.area_name = area_name
	this.area = $(area_name);
	this.panel_group_name = panel_group_name;
	this.panel_group = $(panel_group_name);
	this.canvas = canvas
	this.canvas_ctx = this.canvas.getContext("2d");

	//Block Status
	this.interventionsBlock = [];
	this.lastBlock = null;
	this.first = null;
	this.blockCount = 0;
	this.states = [];
	this.currentState = -1;
	this.finishedEdition = false;

	//Sizes ands crolls
	this.zoom = 1;

	this.documentWidth;
	this.documentHeight;

	this.windowWidth;
	this.windowHeight;

	this.halfWindowWidth;
	this.halfWindowHeight;

	this.halfScrollWidth;
	this.halfScrollHeight;
};

InterventionEditor.prototype.DRAGGABLE_OPTS = {
		scroll: true,
		cursor: "move"
};


InterventionEditor.prototype.initPosition = function() {
	window.moveTo(0,0);
	window.resizeTo(screen.width,screen.height);
};

InterventionEditor.prototype.resize = function() {
	this.refreshMap();
	this.refreshCreateArea();
};

InterventionEditor.prototype.refreshMap = function() {
	this.documentWidth = $(document).width();
	this.documentHeight = $(document).height();

	this.canvas_ctx.canvas.width  = this.documentWidth;
	this.canvas_ctx.canvas.height = this.documentHeight;

	this.area.width(this.documentWidth/this.zoom);
	this.area.height(this.documentHeight/this.zoom);

	// this.canvas_ctx.clearRect(200, 200, this.documentWidth-200, this.documentHeight);
};

InterventionEditor.prototype.refreshCreateArea = function() {
	this.windowWidth = $(window).width();
	this.windowHeight = $(window).height();

	this.halfWindowWidth = this.windowWidth/2;
	this.halfWindowHeight = this.windowHeight/2;

	this.halfScrollWidth = $(window).scrollLeft() + this.halfWindowWidth;
	this.halfScrollHeight = $(window).scrollTop() + this.halfWindowHeight;
};

InterventionEditor.prototype.setFirst = function(block) {
	if (block != this.first) {
		if (this.first != null) {
			this.first.markAsNormalBlock();
		}
		this.first = block;
		this.first.markAsFirstBlock();
		return true;
	} else {
		return false;
	}
};


InterventionEditor.prototype.addInterventinBlock = function(strId) {

	var block = null;

	switch (strId) {
		case 'addEmpty':
			block = new EmptyInterventionBlock(this);
			break;
		case 'addOpenQuestion':
			block = new OpenQuestionInterventionBlock(this);
			break;
		case 'addMult':
			block = new MultipleChoicesInterventionBlock(this);
			break;
		case 'addCheck':
			block = new MultipleOptionsInterventionBlock(this);
			break;
		case 'addMedia':
			block = new MediaInterventionBlock(this);
			break;
		case 'addTask':
			block = new TaskInterventionBlock(this);
			break;
	}


	block.init(InterventionEditor.DRAGGABLE_OPTS);
	this.interventionsBlock.push(block);
	this.panel_group.append(block.element);



	var index = this.interventionsBlock.indexOf(block);

	// block.setIndex(index, ++this.blockCount);
	block.setIndex(index, index+1);

	if (this.first == null) {
		this.first = block;
		block.markAsFirstBlock();
	} else {
		block.markAsNormalBlock();
	}


	if (this.lastBlock != null) {
		console.log("add 1");
		var position = this.lastBlock.getPosition();
		var top = position.top;
		var left = position.left + this.lastBlock.width()*2;

		block.setPositionReference(top, left);
		console.log(top, left);


		// this.canvas.xview_moveto(left);
		// this.canvas.yview_moveto(top);

		if (this.lastBlock.getNextBlock() == null) {
			this.lastBlock.nextNumber = block.number;
		}

		$('html, body').animate({
            scrollLeft: left
        }, 2000, 'swing');

		// $(window).animate({scrollLeft: left}, 800);

		// $(window).stop().animate({scrollLeft: 0}, 1000, 'swing');



		// $(window).scrollLeft(left);
		// $(window).scrollTop(top);

	} else {
		console.log("add 1");
		// this.canvas.xview_moveto(block.height()/2+50);
		// this.canvas.yview_moveto(block.width()/2);
		block.setPositionReference(block.width()/2, block.height()/2+50);
		// $(window).scrollLeft(block.width()/2);
		// $(window).scrollTop(block.height()/2+50);
	}

	this.lastBlock = block;

	this.saveState();

	// this.canvas_ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	refresh();
}

InterventionEditor.prototype.refreshSelects = function() {
	var positionSelects = [];
	var blocksOk = [];


	for (var i = 0; i < this.interventionsBlock.length; i++) {
		this.interventionsBlock[i].updateNextOptions(this.interventionsBlock);
	}
}


InterventionEditor.prototype.getBlockByNumber = function (number) {

	for (var k = 0; k < this.interventionsBlock.length; k++) {
		if (this.interventionsBlock[k].number == number) {
			return this.interventionsBlock[k];
		}

	}
	return null;
};

InterventionEditor.prototype.ordenateNumbers = function(indexOfRemoved){
	// console.log("ola");
	for (var k = 0; k < this.interventionsBlock.length; k++) {
		this.interventionsBlock[k].setIndex(k, k+1);

		refresh();
	}
}

InterventionEditor.prototype.removeBlock = function (toRemovedBlock) {

	var indexOfRemoved = this.interventionsBlock.indexOf(toRemovedBlock);

	// console.log(indexOfRemoved, this.getBlockByNumber(indexOfRemoved+1));

	this.interventionsBlock.splice (indexOfRemoved, 1);

	$(toRemovedBlock.element).remove();

	for (var i = 0; i < this.interventionsBlock.length; i++) {
		this.interventionsBlock[i].informRemotion(toRemovedBlock);
	}

	if (this.first == toRemovedBlock) {
		if (this.interventionsBlock.length > 0) {
			this.first = this.interventionsBlock[0];
			this.first.markAsFirstBlock();
		} else {
			this.first = null;
		}
	}

	// this.ordenateNumbers(indexOfRemoved);
	this.blockCount--;

	this.ordenateNumbers(indexOfRemoved);

	this.lastBlock = this.interventionsBlock[this.interventionsBlock.length-1];

	this.saveState();
	refresh();
};

InterventionEditor.prototype.getProblems = function () {
	var problems = [];

	if (this.interventionsBlock.length == 0) {
		problems.push("Nenhuma intervenção foi definida.");
		return problems;
	}

	for (var i =0; i <this.interventionsBlock.length; i++) {
		this.interventionsBlock[i].getProblems(problems);
	}

	this._getGraphProblem(problems);

	return problems;
}

InterventionEditor.prototype._getGraphProblem = function (problems) {

	//Initialization;
	var unreachableBlocks = [];
	for (var i = 0; i < this.interventionsBlock.length; i++) {
		unreachableBlocks.push (this.interventionsBlock[i].number);
	}
	unreachableBlocks.sort();

	var stack = [];
	var hasEnd = false;
	stack.push(this.first.number);

	while (stack.length > 0) {
		var number = stack.pop();
		var index = unreachableBlocks.indexOf(number);

		if (index >= 0) {
			var block = this.getBlockByNumber(number);
			unreachableBlocks.splice(index, 1);


			if (!(block instanceof MultipleChoicesInterventionBlock)) {
				var nextNumber = parseInt(block.nextNumber);
				if (block.nextNumber != "" && block.nextNumber != null && nextNumber > 0) {
					stack.push(parseInt(block.nextNumber));
				} else if (nextNumber == 0 || nextNumber == -1) {
					hasEnd = true;
				}

			} else {

				var nextNumber = parseInt(block.nextNumber);

				if (block.nextNumber != "" && block.nextNumber != null && nextNumber > 0) {
					stack.push(parseInt(block.nextNumber));
				} else if (nextNumber == 0 || nextNumber == -1) {
					hasEnd = true;
				}

				var keys = Object.keys(block.optionalNext).sort();

				for (var j = 0; j < keys.length; j++) {
					var optNext = block.optionalNext[keys[j]];

					nextNumber = parseInt(optNext);

					if (optNext != "" && optNext != null && nextNumber > 0) {
						stack.push(nextNumber);
					} else if (nextNumber == 0 || nextNumber == -1) {
						hasEnd = true;
					}
				}

			}
		}
	}

	if (unreachableBlocks.length > 0) {
		problems.push("As seguintes intervenções nunca serão executadas: " + unreachableBlocks);
	}

	if (!hasEnd) {
		problems.push("Não foi determinado um ponto de parada para este evento.");
	}
}

InterventionEditor.prototype.getState = function () {
	var json = {
		"first" : this.first != null ? this.first.number : -1,
		"blockCount" : this.blockCount,
		"blocks" : []
	}

	for (var i =0; i < this.interventionsBlock.length; i++) {
		var position = this.interventionsBlock[i].getPosition();
		json.blocks.push(
			[this.interventionsBlock[i].toJson(),
			position]);
	}

	return json;
}

InterventionEditor.prototype.updateStateButtons = function() {
	if (this.states.length > 0 && this.currentState > 0) {
		$('#undo').closest('li').removeClass("disabled");
	} else {
		$('#undo').closest('li').addClass("disabled");
	}

	if (this.currentState < this.states.length -1) {
		$('#redo').closest('li').removeClass("disabled");
	} else {
		$('#redo').closest('li').addClass("disabled");
	}
}

InterventionEditor.prototype.saveState = function () {
	var state = this.getState();

	if (this.currentState != this.states.length -1) {
		this.states.splice(this.currentState+1);

	}

	if (this.states.length == 50) {
		this.states.shift();
	}

	this.states.push(state);
	this.currentState = this.states	.length -1;

	var jsonState = JSON.stringify(editor.getState());
	localStorage.setItem("EDITOR_STATE", jsonState);

	this.updateStateButtons();
}

InterventionEditor.prototype.nextState = function () {

	if (this.currentState < this.states.length-1) {
		this.loadState( this.states[++this.currentState] );
		this.updateStateButtons();
	}

}

InterventionEditor.prototype.previousState = function () {

	if (this.currentState > 0) {
		var state = this.states[--this.currentState]
		this.loadState(state);
		this.updateStateButtons();
	}

}

InterventionEditor.prototype.loadFromParent = function (interventions) {
	var state = {
		first : 1,
		blockCount : 0,
		blocks : [],
	}

	for (var i=0; i < interventions.length; i++) {
		var inter = interventions[i]
		state.blocks.push([inter, {top : 100, left : 20 + 320*i}])

		if (inter.first) {
			state.first = inter.orderPosition;
		}

		if (inter.orderPosition > state.blockCount) {
			state.blockCount = inter.orderPosition;
		}
	}

	this.loadState(state);
}


InterventionEditor.prototype.loadState = function (state) {

	this.interventionsBlock = [];
	this.lastBlock = null;
	this.first = null;
	this.blockCount = 0;

	this.panel_group.empty();

	for (var i = 0; i < state.blocks.length; i++) {
		var blockData = state.blocks[i][0];
		var position = state.blocks[i][1];

		var block = null;

		if (blockData.type == "empty") {
			block = new EmptyInterventionBlock(this);
		} else if (blockData.type == "media") {
			block = new MediaInterventionBlock(this);
		} else if (blockData.type == "question" && blockData.questionType == 0) {
			block = new OpenQuestionInterventionBlock(this);
		} else if (blockData.type == "question" && blockData.questionType == 1) {
			block = new MultipleChoicesInterventionBlock(this);
		} else if (blockData.type == "question" && blockData.questionType == 2) {
			block = new MultipleOptionsInterventionBlock(this);
		} else if (blockData.type == "task") {
			block = new TaskInterventionBlock(this);
		}


		block.init(InterventionEditor.DRAGGABLE_OPTS);
		this.interventionsBlock.push(block);
		this.panel_group.append(block.element);

		var index = this.interventionsBlock.indexOf(block);

		// block.setIndex(index, blockData.orderPosition);
		block.setIndex(index, index+1); // MEU
		block.loadState(blockData);

		if (position != null) {
			block.setPosition(position);
		}

	}

	this.setFirst(this.getBlockByNumber(state.first));
	this.blockCount = state.blockCount;
	this.lastBlock = this.interventionsBlock[this.interventionsBlock.length-1];

	refresh();
}



InterventionEditor.prototype.refreshRoutes = function () {

	this.resize();

	var ctx = this.canvas_ctx;

	ctx.strokeStyle = '#333333';
	ctx.beginPath();
	ctx.setLineDash([8,4]);



	for (var k = 0; k < this.interventionsBlock.length; k++) {
		var currentBlock = this.interventionsBlock[k];

		var multipleRoutes = false;

		if ((currentBlock instanceof MultipleChoicesInterventionBlock) && currentBlock.hasMultipleRoutes()) {
			multipleRoutes = true;
		}

		if (!multipleRoutes) {

			var nextBlock = currentBlock.getNextBlock();

			if (nextBlock instanceof InterventionBlock) {
				this.drawArrow(ctx,
					currentBlock.element.position(), currentBlock.width(), currentBlock.height(),
					nextBlock.element.position(), nextBlock.width(), nextBlock.height());

			}

		} else {
			var selects = currentBlock.element.find("select.selectBlock");
			var selectsIndex;

			for (selectsIndex =0; selectsIndex < selects.length; selectsIndex++)  {
				var select = selects[selectsIndex];
				var nextBlock = this.getBlockByNumber($(select).val());


				if (nextBlock instanceof InterventionBlock) {
					this.drawArrow(ctx,
									$(select).offset(), $(select).width(), $(select).height(),
									nextBlock.element.position(), nextBlock.width(), nextBlock.height())


				}

			}

		}
	}

	ctx.lineWidth = 1;
	ctx.stroke();

}

InterventionEditor.prototype.drawArrow = function (ctx, originOffset, originWidth, originHeight, destinyOffset, destinyWidth, destinyHeight) {
	var headlen = 10;
	var arrowSpace = headlen+5;

	var origin = [];
	origin[0] = [];

	origin[0][0] = originOffset.left - arrowSpace;
	origin[0][1] = originOffset.top + originHeight / 2;

	origin[1] = [];

	origin[1][0] = originOffset.left + originWidth + arrowSpace;
	origin[1][1] = originOffset.top + originHeight / 2;

	var destiny = [];

	destiny[0] = [];
	destiny[0][0] = destinyOffset.left + destinyWidth / 2;
	destiny[0][1] = destinyOffset.top - arrowSpace;

	destiny[1] = [];
	destiny[1][0] = destinyOffset.left + destinyWidth + arrowSpace;
	destiny[1][1] = destinyOffset.top + destinyHeight / 2;

	destiny[2] = [];
	destiny[2][0] = destinyOffset.left + destinyWidth / 2;
	destiny[2][1] = destinyOffset.top + destinyHeight + arrowSpace;

	destiny[3] = [];
	destiny[3][0] = destinyOffset.left - arrowSpace;
	destiny[3][1] = destinyOffset.top + destinyHeight / 2;

	var minDestinyN = 0;
	var minOriginN = 0;
	var minHip = 0;
	for (var j = 0;j<2;j++) {
		for (var i = 0;i<4;i++) {

			var hip = Math.abs(Math.sqrt(Math.pow(Math.abs(destiny[i][0]-origin[j][0]),2)+Math.pow(Math.abs(destiny[i][1]-origin[j][1]),2)));

			if (((i == 0) && (j == 0)) || (hip < minHip)) {
				minHip = hip;
				minDestinyN = i;
				minOriginN = j;
			}

		}
	}
	// começo da linha
	//console.log('começo da linha', origin[minOriginN][0], origin[minOriginN][1]);
	ctx.moveTo(origin[minOriginN][0], origin[minOriginN][1]);

	// angulo para desenhar setas

	var angle = Math.atan2(destiny[minDestinyN][1]-origin[minOriginN][1],destiny[minDestinyN][0]-origin[minOriginN][0]);
	//console.log('angulo', angle);

	// primeira seta
	ctx.lineTo(origin[minOriginN][0]-headlen*Math.cos(angle-Math.PI/6),origin[minOriginN][1]-headlen*Math.sin(angle-Math.PI/6));
	ctx.moveTo(origin[minOriginN][0], origin[minOriginN][1]);
	ctx.lineTo(origin[minOriginN][0]-headlen*Math.cos(angle+Math.PI/6),origin[minOriginN][1]-headlen*Math.sin(angle+Math.PI/6));
	ctx.moveTo(origin[minOriginN][0], origin[minOriginN][1]);

	// fim da linha
	//console.log('fim da linha', destiny[minDestinyN][0], destiny[minDestinyN][1]);
	ctx.lineTo(destiny[minDestinyN][0], destiny[minDestinyN][1]);

	// segunda seta
	ctx.lineTo(destiny[minDestinyN][0]-headlen*Math.cos(angle-Math.PI/6),destiny[minDestinyN][1]-headlen*Math.sin(angle-Math.PI/6));
	ctx.moveTo(destiny[minDestinyN][0], destiny[minDestinyN][1]);
	ctx.lineTo(destiny[minDestinyN][0]-headlen*Math.cos(angle+Math.PI/6),destiny[minDestinyN][1]-headlen*Math.sin(angle+Math.PI/6));

}