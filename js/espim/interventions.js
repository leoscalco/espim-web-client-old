/**********************************************************************************************
                                     InterventionBlock
***********************************************************************************************/

var QUESTION_TYPE_OPEN_TEXT = 0;
var QUESTION_TYPE_RADIO = 1;
var QUESTION_TYPE_CHECKBOX = 2;
var QUESTION_TYPE_LIKERT = 3;
var QUESTION_TYPE_SEMANTIC_DIFFERENTIAL = 4;


var InterventionBlock = function(editor, json) {
	this.editor = editor;
	this.blockTitle = '';
	this.icon = '';
	this.statementPlaceHolder = 'Digite a questão'
	this.element = null;
	this.nextNumber = null;
	this.number = -1;
	this.mediaType = null;
	this.mediaUrl = null;
	this.first = false;
}

InterventionBlock.prototype.notifyStateChange = function() {
	this.editor.saveState();
}

InterventionBlock.prototype.width = function() {
	var r = this.element.width();
	return 300;
}

InterventionBlock.prototype.height = function() {
	var r = this.element.height();
	return 350;
}

InterventionBlock.prototype.getPosition = function() {
	return this.element.position();
}

InterventionBlock.prototype.setPosition = function(position) {
	return $(this.element).offset(
		{ top : position.top,
			left : position.left});
}


InterventionBlock.prototype.informRemotion = function(removedBlock) {
	if (this.nextNumber == removedBlock.number) {
		this.nextNumber = null;
	}
}

InterventionBlock.prototype.getHTML = function(intervention) {
	var html = '<div id="blockSendMedia"> \
					<div class="panel panel-primary" aria-hidden="true" data-toggle="tooltip" data-placement="top">\
						<div class="panel-heading">\
							<h3 class="panel-title">\
								<strong class="blockNumber"></strong> - ' + this.blockTitle + '</a> \
								<a href="#" class="removeBlock"><span class="glyphicon glyphicon-trash pull-right" aria-hidden="true"></span></a>\
							</h3>\
						</div>\
						<div class="panel-body">\
						<div class="row">\
								<div class="col-xs-12">\
									<div class="form-group">\
										<div class="radio">\
											<label><input type="radio" name="isFirst" class="blockStart"> 1&#170  intervenção</label>\
										</div>\
									</div>\
								</div>\
								<div class="col-xs-12">\
									<div class="form-group">\
										<div class="checkbox">\
											<label><input type="checkbox" class="checkObligatory"> Obrigatória</label>\
										</div>\
									</div>\
								</div>\
							</div>\
							<hr class="dashed">\
							<div class="row">\
								<div class="col-xs-12">\
									<div class="form-group" >\
                          <label for="description">'+ this.statementPlaceHolder +' (<span class="desc-counter">0/800</span>):</label>\
                          <textarea id="txtDescription" ng-model="description"\
                          placeholder="Digite o texto" type="text" class="form-control question description"\
                          ng-trim="false" maxlength="800"></textarea>\
									</div>\
								</div>\
								<div class="col-xs-12">\
									<div class="form-group">\
	  									<video src="https://s3-sa-east-1.amazonaws.com/icmc-espim/espim/5be41e10-69d1-41ae-a516-6d1f339bf022.mp4" style="width:100%; display:none;" controls ></video>\
      									<audio src="https://s3-sa-east-1.amazonaws.com/icmc-espim/espim/4938a734-78ae-4c7d-92ca-c1d74f0be2e6.wav" style="width:100%; display:none;" controls ></audio>\
      									<img src="https://s3-sa-east-1.amazonaws.com/icmc-espim/espim/bac25a02-f807-43e2-9efa-d7c00ad0cd7d.jpg" id="uploadImage" class="img-responsive center-block" \
      										style="display:none; max-width: 100%; max-height: 180px; object-fit: contain"></img>\
										<p>\
										<br/>\
										<button class="btn btn-block btn-default btn getMedia pull-left">Anexar Mídia <span class="fa fa-paperclip" aria-hidden="true"></span></button>\
										<button class="btn btn-block btn-cancel removeMedia pull-left trash" style="display:none;">Remover Mídia <span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>\
										<br/><br/>\
									</div>\
								</div>' + this.getInnerHTML() + '\
								</div>\
								<div class="row">\
								<hr class="dashed">\
								<div class="col-xs-12">\
									<div class="form-group">\
											<select class="form-control selectBlock">\
												<option selected disabled value="">Próxima intervenção</option>\
												<option value="0">Finalizar</option>\
												<option value="-1">Cancelar</option>\
											</select>\
									</div>\
								</div>\
							</div>\
						</div>\
					</div>\
				</div>';

	return html;
};

InterventionBlock.prototype.updateNextOptions = function(allBlocks) {
	var currentSelect = this.element.find("select.selectBlock");

	currentSelect.empty();

	var html = "";
	for (var i = 0; i < allBlocks.length; i++) {
		if (this != allBlocks[i]) {
			html += '<option value="' + allBlocks[i].number + '">' + allBlocks[i].number + ' (' + allBlocks[i].blockTitle + ')</option>';
		}

	}

	html += '<option selected disabled value="">Próxima intervenção</option>\
				<option value="0">Finalizar</option>\
				<option value="-1">Cancelar</option>';

	currentSelect.append($(html));

	if (this.nextNumber == 0 || this.nextNumber == -1) {
		currentSelect.val(this.nextNumber);
	} else if (this.nextNumber == null || this.nextNumber == "") {
		currentSelect.val("");
	} else {
		var nextBlock = this.getNextBlock();
		if (nextBlock == null){
			// this.nextNumber--;
			// nextBlock = this.getNextBlock();
			currentSelect.val(this.nextNumber--);
		}else{
			currentSelect.val(nextBlock.number);
		}
	}

}

InterventionBlock.prototype.getInnerHTML = function(intervention) {
	return "";
}

InterventionBlock.prototype.init = function(opts) {
	this.element = $(this.getHTML());
	this.element.draggable(opts);

	this.bindEvents();
}

InterventionBlock.prototype.bindEvents = function() {
	var thisIntervertion = this;

	//Drag and Drop
	this.element.on( "drag", function( event, ui ) {
		ui.position.top = Math.max(50, ui.position.top);
		ui.position.left = Math.max(0, ui.position.left);

		refresh();
	});


	this.element.on("click", ".removeBlock", function(event, ui) {

		 swal({
              title: "Removendo Intervenção",
              text: "Deseja remover a intervenção '" + thisIntervertion.number + "'?",
              type: "warning",
              showCancelButton: true,
              confirmButtonText: "Sim",
              cancelButtonText: "Não",
              closeOnConfirm: true,
              closeOnCancel: true
            }, function(isConfirm) {
              if (isConfirm) {
              	thisIntervertion.editor.removeBlock(thisIntervertion);
              }
            });

	});

	this.element.on("change", ".blockStart", function(event, ui) {
		if (thisIntervertion.editor.setFirst(thisIntervertion)) {
			thisIntervertion.notifyStateChange();
		};

	});

	this.element.on("change keyup paste", ".description", function(event, ui) {
		$(this).parent().find('.desc-counter').text(event.currentTarget.textLength+"/800");
	});


	this.bindSelectEvents();
	this.bindAlternativesEvents();
	this.bindParametersEvents();
	this.bindMediaEvents();
}

InterventionBlock.prototype.bindSelectEvents = function() {
	var selects = this.element.find("select.selectBlock");

	var interventionObject = this;


	selects.on("change", function( event, ui ) {

		var value = this.value;
		interventionObject.nextNumber = value;

		if (this.value == 0) {
			// $(this).css("background-color","#5cb85c");
		} else if (value == "" || this.value == null) {
			$(this).css("background-color","transparent");
		} else if (this.value == -1) {
			// $(this).css("background-color","#f0ad4e");
		} else {
			$(this).css("background-color","transparent");
		}

		interventionObject.notifyStateChange();
		refresh();
	});

}

InterventionBlock.prototype.bindMediaEvents = function() {
	var thisIntervention = this;

	this.element.on( "click", ".getMedia", function(event) {
		event.preventDefault();
		var w = window.open("getMedia.html?id="+thisIntervention.number, "popupWindowGetMedia", "width=1200, height=700, scrollbars=yes");
		var $w = $(w.document.body);
		thisIntervention.notifyStateChange();
	});


	this.element.on( "click", ".removeMedia", function(event) {
		event.preventDefault();
		thisIntervention.mediaUrl = null;
		thisIntervention.mediaType = null;

		thisIntervention.element.find('video').hide();
		thisIntervention.element.find('audio').hide();
		thisIntervention.element.find('img').hide();

		thisIntervention.element.find('.removeMedia').hide();
		var button = thisIntervention.element.find('.getMedia');
		button.empty();
		button.append('Anexar Mídia <span class="fa fa-paperclip" aria-hidden="true"></span>');
		thisIntervention.notifyStateChange();
	});
}

InterventionBlock.prototype.addMedia = function(mediaType, mediaUrl) {
	this.mediaUrl = mediaUrl;
	this.mediaType = mediaType

	this.element.find('video').hide();
	this.element.find('audio').hide();
	this.element.find('img').hide();

	this.element.find('.removeMedia').show();
	//var button = this.element.find('.getMedia');
	//button.empty();
	//button.append('Anexar Mídia <span class="fa fa-paperclip" aria-hidden="true"></span>');

	if (mediaType == 'video') {
		this.element.find('video').show();
		this.element.find('video').attr("src", mediaUrl);
	} else if (mediaType == 'audio') {
		this.element.find('audio').show();
		this.element.find('audio').attr("src", mediaUrl);
	} else if (mediaType == 'image') {
		this.element.find('img').show();
		this.element.find('img').attr("src", mediaUrl);

	}
}

InterventionBlock.prototype.bindAlternativesEvents = function() {


}

InterventionBlock.prototype.bindParametersEvents = function() {


}


InterventionBlock.prototype.setPositionReference = function(top, left) {
	this.element.css('left',(left-(this.width())/2)+'px');
	this.element.css('top',top +'px');
}


InterventionBlock.prototype.setIndex = function(index, number) {
	this.index = index;
	this.number = number;

	this.element.find('.blockNumber').html(this.number);
}

InterventionBlock.prototype.markAsFirstBlock = function() {
	// this.element.find(".panel").removeClass("panel-default");
	// this.element.find(".panel").addClass("panel-primary");
	// this.element.find(".panel-title .glyphicon").removeClass("glyphicon-star-empty");
	// this.element.find(".panel-title .glyphicon").addClass("glyphicon-star");
	this.first = true;

}


InterventionBlock.prototype.markAsNormalBlock = function() {
	// this.element.find(".panel").addClass("panel-default");
	// this.element.find(".panel").removeClass("panel-primary");
	// this.element.find(".panel-title .glyphicon").addClass("glyphicon-star-empty");
	// this.element.find(".panel-title .glyphicon").removeClass("glyphicon-star");
	this.first = false;
}


InterventionBlock.prototype.getNextBlock = function() {
	// verificar
	if (this.nextNumber == "" || this.nextNumber  == null ||
		this.nextNumber  == -1 || this.nextNumber  == 0) {
		return null;
	} else {
		return this.editor.getBlockByNumber(this.nextNumber);
	}
}

InterventionBlock.prototype.toJson = function() {
	var json = {
		type: this.interventionType,
		orderPosition: this.number,
		first: this.first,
		next: this.nextNumber,
		medias: []
	}

	if (this.mediaUrl != null && this.mediaType != null) {
		json.medias.push(
			{
				'type' : this.mediaType,
				'mediaUrl' : this.mediaUrl
			});
	}

	json['statement'] = $(this.element).find('textarea').val();
	json['obligatory'] = $(this.element).find('.checkObligatory').is(":checked");

	return json;
}

InterventionBlock.prototype.loadState = function(state) {
	this.number = state.orderPosition;
	this.first = state.first;
	if (this.first){
		$(this.element).find('.blockStart').attr('checked', true);
	}

	this.nextNumber = state.next;

	if (state.medias.length > 0) {
		this.addMedia(state.medias[0].type, state.medias[0].mediaUrl);
	}

	$(this.element).find('textarea').val(state.statement);
	$(this.element).find('.desc-counter').text(state.statement.length+"/800")

	if (state.obligatory) {
		$(this.element).find('.checkObligatory').prop('checked', true);
	} else {
		$(this.element).find('.checkObligatory').prop('checked', false);
	}

	var select = $(this.element).find('select.selectBlock');

	if (this.nextNumber == "" || this.nextNumber == null) {
			$(select).css("background-color","transparent");
		} else if (this.nextNumber == 0) {
			// $(select).css("background-color","#5cb85c");
		} else if (this.nextNumber == -1) {
			// $(select).css("background-color","#f0ad4e");
		} else {
			$(select).css("background-color","transparent");
		}
}

InterventionBlock.prototype.getProblems = function(problems) {

	if ($(this.element).find('textarea').val() == "") {
		problems.push("Intervenção " + this.blockTitle + " " + this.number + ": não possui uma descrição.");
	}

	if ($(this.element).find('select').val() == "") {
			problems.push("Intervenção " + this.blockTitle + " " + this.number + ": não foi definida a próxima intervenção.");
	}

	return problems;
}

/**********************************************************************************************
                                     EmptyInterventionBlock
***********************************************************************************************/


var EmptyInterventionBlock = function (editor, jsonObj) {

	InterventionBlock.call(this, editor, jsonObj);
	this.blockTitle = 'Mensagem';
	this.icon = '<i class="fa fa-comment fa-1x" aria-hidden="true"></i>';
	this.statementPlaceHolder = 'Digite a mensagem';
	this.interventionType = 'empty';

};

EmptyInterventionBlock.prototype = Object.create(InterventionBlock.prototype);
EmptyInterventionBlock.prototype.constructor = EmptyInterventionBlock;


/**********************************************************************************************
                                     MediaInterventionBlock
***********************************************************************************************/


var MediaInterventionBlock = function (editor, jsonObj) {

	InterventionBlock.call(this, editor, jsonObj);
	this.blockTitle = 'Solicitar Mídia';
	this.icon = '<i class="fa fa-video-camera fa-1x" aria-hidden="true"></i>';
	this.statementPlaceHolder = 'Digite a mensagem';
	this.interventionType = 'media';
};

MediaInterventionBlock.prototype = Object.create(InterventionBlock.prototype);
MediaInterventionBlock.prototype.constructor = MediaInterventionBlock;


MediaInterventionBlock.prototype.getInnerHTML = function(intervention) {
	return 	'<div class="row interventionSubtitle"><div class="col-xs-12"><h6>Tipo de mídia</h6></div></div><div class="col-xs-12">\
				<div class="form-group">\
					<select class="form-control selectMedia">\
						<option selected disabled value="">Selecione o tipo de mídia</option>\
						<option value="image">Imagem</option>\
						<option value="audio">Áudio</option>\
						<option value="video">Vídeo</option>\
					</select>\
				</div>\
			</div>';
}

MediaInterventionBlock.prototype.toJson = function() {
	var json = {
		type: this.interventionType,
		orderPosition: this.number,
		first: this.first,
		next: this.nextNumber,
		medias: []
	}

	if (this.mediaUrl != null && this.mediaType != null) {
		json.medias.push(
			{
				'type' : this.mediaType,
				'mediaUrl' : this.mediaUrl
			});
	}

	json['statement'] = $(this.element).find('textarea').val();
	json['obligatory'] = $(this.element).find('.checkObligatory').is(":checked");
	json['mediaType'] = $(this.element).find('.selectMedia').val();

	return json;
}

MediaInterventionBlock.prototype.loadState = function(state) {
	InterventionBlock.prototype.loadState.call(this, state);

	$(this.element).find('.selectMedia').val(state.mediaType);

}

MediaInterventionBlock.prototype.getProblems = function(problems) {
	console.log("media intervention get problems")
	InterventionBlock.prototype.getProblems.call(this, problems);
	console.log($(this.element).find('.selectMedia').val());
	console.log($(this.element));
	if ($(this.element).find('.selectMedia').val() == null) {
			problems.push("Intervenção " + this.blockTitle + " " + this.number + ": não foi selecionado o tipo de mídia.");
	}
	// if ($(this.element).find('textarea.parameters').val() == "") {
 //                        problems.push("Intervenção " + this.blockTitle + " " + this.number + ": não foram definidos os parâmetros.");
 //        }

	return problems;
}

/**********************************************************************************************
                                     OpenQuestionInterventionBlock
***********************************************************************************************/

var OpenQuestionInterventionBlock = function (editor, jsonObj) {

	InterventionBlock.call(this, editor, jsonObj);
	this.blockTitle = 'Questão Aberta';
	this.icon = '<i class="fa fa-align-left fa-1x" aria-hidden="true"></i>';
	this.statementPlaceHolder = 'Digite a questão'
	this.interventionType = 'question';
};

OpenQuestionInterventionBlock.prototype = Object.create(InterventionBlock.prototype);
OpenQuestionInterventionBlock.prototype.constructor = MediaInterventionBlock;

OpenQuestionInterventionBlock.prototype.toJson = function() {
	var json = {
		type: this.interventionType,
		orderPosition: this.number,
		first: this.first,
		next: this.nextNumber,
		medias: [],
		options : [],
		conditions : {},
	}

	if (this.mediaUrl != null && this.mediaType != null) {
		json.medias.push(
			{
				'type' : this.mediaType,
				'mediaUrl' : this.mediaUrl
			});
	}

	json['statement'] = $(this.element).find('textarea').val();
	json['obligatory'] = $(this.element).find('.checkObligatory').is(":checked");
	json['questionType'] = QUESTION_TYPE_OPEN_TEXT;

	return json;
}


/**********************************************************************************************
                                     MultipleChoicesInterventionBlock
***********************************************************************************************/


var MultipleChoicesInterventionBlock = function (editor, jsonObj) {

	InterventionBlock.call(this, editor, jsonObj);
	//this.nextNumber = -1;
	this.blockTitle = 'Escolha Única';
	this.icon = '<i class="fa fa-dot-circle-o  fa-1x" aria-hidden="true"></i>';
	this.statementPlaceHolder = 'Digite a questão';
	this.optionPlaceHolder = 'Digite a alternativa';
	this.interventionType = 'question';
	this.optionalNext = {};
};

MultipleChoicesInterventionBlock.prototype = Object.create(InterventionBlock.prototype);
MultipleChoicesInterventionBlock.prototype.constructor = MultipleChoicesInterventionBlock;

MultipleChoicesInterventionBlock.prototype.getHTML = function(intervention) {
	var strRet = '<div id="blockMult">\
			<div class="panel panel-primary panelMult" aria-hidden="true" data-toggle="tooltip" data-placement="top">\
				<div class="panel-heading">\
					<h3 class="panel-title">\
						<strong class="blockNumber"></strong> - ' + this.blockTitle + '\
						<a href="#" class="removeBlock"><span class="glyphicon glyphicon-trash pull-right" aria-hidden="true"></span></a>\
					</h3>\
				</div>\
				<div class="panel-body">\
					<div class="row">\
								<div class="col-xs-12">\
									<div class="form-group">\
										<div class="radio">\
											<label><input type="radio" name="isFirst" class="blockStart">  1&#170 intervenção</label>\
										</div>\
									</div>\
								</div>\
								<div class="col-xs-12">\
									<div class="form-group">\
										<div class="checkbox">\
											<label><input type="checkbox" class="checkObligatory"> Obrigatória</label>\
										</div>\
									</div>\
								</div>\
							</div>\
							<hr class="dashed">\
							<div class="row">\
								<div class="col-xs-12">\
									<div class="form-group" >\
                          <label for="description">'+ this.statementPlaceHolder +' (<span class="desc-counter">0/800</span>):</label>\
                          <textarea id="txtDescription"\
                          placeholder="Digite o texto" type="text" class="form-control question description"\
                          ng-trim="false" maxlength="800"></textarea>\
									</div>\
								</div>\
					<div class="row">\
						<div class="col-xs-12">\
							<div class="form-group">\
	  									<video src="https://s3-sa-east-1.amazonaws.com/icmc-espim/espim/5be41e10-69d1-41ae-a516-6d1f339bf022.mp4" style="width:100%; display:none;" controls ></video>\
      									<audio src="https://s3-sa-east-1.amazonaws.com/icmc-espim/espim/4938a734-78ae-4c7d-92ca-c1d74f0be2e6.wav" style="width:100%; display:none;" controls ></audio>\
      									<img src="https://s3-sa-east-1.amazonaws.com/icmc-espim/espim/bac25a02-f807-43e2-9efa-d7c00ad0cd7d.jpg" id="uploadImage" class="img-responsive center-block" \
      										style="display:none; max-width: 100%; max-height: 180px; object-fit: contain"></img>\
										<p>\
										<button class="btn btn-default btn-block getMedia pull-left">Anexar Mídia <span class="fa fa-paperclip" aria-hidden="true"></span></button>\
										<button class="btn btn-cancel btn-block removeMedia pull-left trash" style="display:none;">Remover Mídia <span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>\
							</div>\
						</div>\
					</div>\
					<div class="row interventionSubtitle"><div class="col-xs-12"><h6>Alternativas</h6></div></div>\
					<div class="alternatives">';

		var c;
		for (var i = 0; i < 2; i++) {
			c = i +1;
			strRet += '<div class="row alternative">\
							<div class="col-xs-2 alternativeCounter" style="text-align: center;display: cell">'+
							c
							+'</div>\
							<div class="col-xs-8">\
								<div class="form-group">\
									<textarea class="form-control" placeholder="' + this.optionPlaceHolder + '" rows="1"></textarea>\
								</div>\
							</div>\
							<div class="col-xs-2">\
								<div class="form-group">\
									<button class="btn btn-link removeAlternative colorHide"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>\
								</div>\
							</div>\
							<div class="col-xs-offset-2 col-xs-10">\
								<div class="form-group">\
									<select class="form-control selectBlock">\
										<option selected disabled value="">Próxima intervenção</option>\
										<option value="0">Fim</option>\
										<option value="-1">Cancelar</option>\
									</select>\
								</div>\
							</div>\
					  </div>';
		}

		strRet +=  '</div>\
					<div class="row">\
						<div class="col-xs-12">\
							<div class="form-group">\
								<button class="btn btn-prev btn-block addAlternative">Nova alternativa</button>\
							</div>\
						</div>\
					</div>\
				</div>\
			</div>\
		</div>';

	return strRet;
}

MultipleChoicesInterventionBlock.prototype.updateNextOptions = function(allBlocks) {
	var selects = this.element.find("select.selectBlock");

	selects.empty();

	var html = "";

	for (var i = 0; i < allBlocks.length; i++) {
		if (this != allBlocks[i]) {
			html += '<option value="' + allBlocks[i].number + '">' + allBlocks[i].number + ' (' + allBlocks[i].blockTitle + ')</option>';
		}

	}

	html += '<option selected disabled value="">Próxima intervenção</option>\
				<option value="0">Finalizar</option>\
				<option value="-1">Cancelar</option>';

	selects.append($(html));

	var thisIntervention = this;

	var alLEquals = true;
	var equalCandidate;
	var last;

	$.each(selects, function(index, select){

		var nextNumber = thisIntervention.getNextByOption(index);

		if (nextNumber == 0 || nextNumber == -1) {
			$(select).val(nextNumber);
		} else if (nextNumber == null || nextNumber == "") {
			$(select).val("");
			// this.nextNumber = -1;
		} else {
			var nextBlock = thisIntervention.editor.getBlockByNumber(nextNumber);
			if (nextBlock != null) {
				$(select).val(nextBlock.number);
			} else {

				// verificar
				$(select).val("");
			}
		}

		if (index == 0) {
			equalCandidate = nextNumber;
		} else if (equalCandidate != nextNumber) {
			alLEquals = false;
		}
	});

	if (alLEquals) {
		this.nextNumber = equalCandidate;
		this.optionalNext = {};
	}
	 // verificar
	// if (this.nextNumber == null) {
	// 	// console.log("ESTA NULL", $(selects[selects.length - 1]).val())
	// 	this.nextNumber = -1;
	// }

}

MultipleChoicesInterventionBlock.prototype.hasMultipleRoutes = function() {
	return Object.keys(this.optionalNext).length > 0;
}

MultipleChoicesInterventionBlock.prototype.setNextByOption = function(optionIndex, nextNumber) {
	// verificar
	//console.log('MultipleChoicesInterventionBlock.setNextByOption', this.optionalNext, optionIndex, nextNumber);
	if (this.nextNumber == nextNumber) {
		if (optionIndex in this.optionalNext) {
			delete this.optionalNext[optionIndex]
		}
	} else {

		this.optionalNext[optionIndex] = nextNumber;
	}
}


MultipleChoicesInterventionBlock.prototype.getNextByOption = function(optionIndex) {
	if (optionIndex in this.optionalNext) {
		return this.optionalNext[optionIndex];
	} else {
		return this.nextNumber;
	}
}

MultipleChoicesInterventionBlock.prototype.bindSelectEvents = function() {
	var selects = this.element.find("select.selectBlock");

	var interventionObject = this;

	this.element.on( "change", "select.selectBlock", function(event, ui) {
		// console.log("ooi");
		var alternative = $(event.target).closest(".alternative");
		// console.log(alternative);
		var index =  $(alternative).index();
		var value = this.value;
		// console.log(alternative, index, value);
		// this.val(value);

		interventionObject.setNextByOption(index, value);

		if (this.value == 0) {
			// $(this).css("background-color","#5cb85c");
		} else if (value == "" || this.value == null) {
			$(this).css("background-color","transparent");
		} else if (this.value == -1) {
			// $(this).css("background-color","#f0ad4e");
		} else {
			$(this).css("background-color","transparent");
		}

		interventionObject.notifyStateChange();

		refresh();

	});
}

MultipleChoicesInterventionBlock.prototype.bindAlternativesEvents = function() {

	var interventionObject = this;

	this.element.on("click", ".addAlternative", function(event, io) {
		event.preventDefault();

		var alternativeLength = $(this).closest(".panel-body").find(".alternative").length;

		var newAlternative = $(this).closest(".panel-body").find(".alternative").first().clone();

		newAlternative.find("select.selectBlock").val(interventionObject.nextNumber);
		newAlternative.find('.alternativeCounter').text(alternativeLength+1);
		newAlternative.find("textarea").val('');

		$(this).closest(".panel-body").find(".alternatives").append(newAlternative);

		if (alternativeLength >= 2) {
			$(this).closest(".panel-body").find(".removeAlternative").removeClass("colorHide");
		}

		interventionObject.notifyStateChange();

	});

	this.element.on("click", ".removeAlternative", function(event, io) {
		event.preventDefault();

		var alternativeLength = $(this).closest(".alternatives").find(".alternative").length;
		var alternative = $(event.target).closest(".alternative");
		var index =  $(alternative).index();

		var keys = Object.keys(interventionObject.optionalNext).sort();

		if (keys.length > 0) {
			for (var i = index+1; i < keys.length; i++) {
				interventionObject.optionalNext[keys[i-1]] = interventionObject.optionalNext[keys[i]];
			}
		}



		if (alternativeLength > 2) {

			if (alternativeLength == 3) {
				$(this).closest(".alternatives").find(".removeAlternative").addClass("colorHide");
			}

			$(this).closest(".alternative").remove();
		}

		interventionObject.notifyStateChange();

		refresh();

	});
}

MultipleChoicesInterventionBlock.prototype.informRemotion = function(removedBlock) {
	if (this.nextNumber == removedBlock.number) {
		this.nextNumber = null;
	}

	var keys = Object.keys(this.optionalNext).sort();

	for (var i=0; i < keys.length; i++) {
		if (this.optionalNext[keys[i]] == removedBlock.number) {
			delete this.optionalNext[keys[i]];
		}
	}
}

MultipleChoicesInterventionBlock.prototype.toJson = function() {
	var thisIntervention = this;

	var json = {
		type: this.interventionType,
		orderPosition: this.number,
		first: this.first,
		next: this.nextNumber,
		medias: [],
		options : [],
		conditions : {},
	}

	if (this.mediaUrl != null && this.mediaType != null) {
		json.medias.push(
			{
				'type' : this.mediaType,
				'mediaUrl' : this.mediaUrl
			});
	}

	json['statement'] = $(this.element).find('textarea').val();
	json['obligatory'] = $(this.element).find('.checkObligatory').is(":checked");
	// json['obligatory'] = true;
	json['questionType'] = QUESTION_TYPE_RADIO;

	var alternatives = this.element.find(".alternative");

	$.each(alternatives, function(index, alt) {
		json.options.push($(this).find('textarea').val());
		json.conditions[$(this).find('textarea').val()] = parseInt(thisIntervention.getNextByOption(index));
	});

	return json;
}


MultipleChoicesInterventionBlock.prototype.loadState = function(state) {
	InterventionBlock.prototype.loadState.call(this, state);

	var alternativesLoop = this.element.find(".alternatives");

	for (var i = 0; i < state.options.length-2; i++) {
		var newAlternative = $(this.element).find(".alternative").first().clone();

		newAlternative.find("textarea").val('');
		newAlternative.find(".alternativeCounter").text(i+3);

		$(this.element).find(".alternatives").append(newAlternative);

	}

		var alternatives = this.element.find(".alternative");

	if (alternatives.length > 2) {
		$(this.element).find(".removeAlternative").removeClass("colorHide");
	}

	var thisIntervention = this;

	$.each(alternatives, function(index, alt) {
		var str = state.options[index];
		$(this).find('textarea').val(str);

		if (str in state.conditions) {
			var value = parseInt(state.conditions[str]);
			thisIntervention.setNextByOption(index, value);

			if (value === 0) {
				// $(this).find('select').css("background-color","#5cb85c");
			} else if (value== "" || value === null) {
				$(this).find('select').css("background-color","transparent");
			} else if (value == -1) {
				// $(this).find('select').css("background-color","#f0ad4e");
			} else {
				$(this).find('select').css("background-color","transparent");
			}
		}


	});
}

MultipleChoicesInterventionBlock.prototype.getProblems = function(problems) {

	if ($(this.element).find('textarea').val() == "") {
		problems.push("Intervenção " + this.blockTitle + " " + this.number + ": não possui uma descrição.");
	}


	var alternatives = this.element.find(".alternative");

	var thisIntervention = this;

	$.each(alternatives, function(index, alt) {
		if ($(this).find('textarea').val() == "") {
			problems.push("Intervenção " + thisIntervention.blockTitle + " " + thisIntervention.number + ": opção " + index + " não foi definida.");
		}
		console.log($(this).find('select'), $(this).find('select').val());
		if ($(this).find('select').val() == "" || $(this).find('select').val() == null) {
			problems.push("Intervenção " + thisIntervention.blockTitle + " " + thisIntervention.number + ": não foi definida a próxima intervenção para a opção " + (index+1) + ".");
		}

	});


	return problems;
}


/**********************************************************************************************
                                     MultipleOptionsInterventionBlock
***********************************************************************************************/


var MultipleOptionsInterventionBlock = function (editor, jsonObj) {

	InterventionBlock.call(this, editor, jsonObj);
	this.blockTitle = 'Escolha Múltipla';
	this.icon = '<i class="fa fa-check-circle-o fa-1x" aria-hidden="true"></i>';
	this.statementPlaceHolder = 'Digite a questão';
	this.interventionType = 'question';
};

MultipleOptionsInterventionBlock.prototype = Object.create(InterventionBlock.prototype);
MultipleOptionsInterventionBlock.prototype.constructor = MultipleOptionsInterventionBlock;

MultipleOptionsInterventionBlock.prototype.getInnerHTML = function(intervention) {
	var str = 	'<div class="alternatives"><div class="row interventionSubtitle"><div class="col-xs-12"><h6>Opções</h6></div></div>';

	for (var i = 0; i < 2; i++) {
		var c = i+1;
		str += '<div class="row alternative">\
					<div class="col-xs-1 alternativeCounter">'+
					c
					+'</div>\
					<div class="col-xs-9">\
						<div class="form-group">\
							<textarea class="form-control" placeholder="Opção" rows="1"></textarea>\
						</div>\
					</div>\
					<div class="col-xs-2">\
						<div class="form-group">\
							<button class="btn btn-link removeAlternative colorHide"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>\
						</div>\
					</div>\
				</div>';
	}

	str += '</div>\
			<div class="row">\
				<div class="col-xs-12">\
					<div class="form-group">\
						<button class="btn btn-prev btn-block addAlternative">Nova opção</button>\
					</div>\
				</div>\
			</div>';

	return str;
}

MultipleOptionsInterventionBlock.prototype.bindAlternativesEvents = function() {

	var interventionObject = this;

	this.element.on("click", ".addAlternative", function(event, io) {
		event.preventDefault();

		var alternativeLength = $(this).closest(".panel-body").find(".alternative").length;

		// var counter = $(this).closest(".panel-body").find(".alternativeCounter").clone();
		// counter.text(alternativeLength+1);

		var newAlternative = $(this).closest(".panel-body").find(".alternative").first().clone();
		newAlternative.find('.alternativeCounter').text(alternativeLength+1);
		newAlternative.find("textarea").val('');

		$(this).closest(".panel-body").find(".alternatives").append(newAlternative);

		if (alternativeLength >= 2) {
			$(this).closest(".panel-body").find(".removeAlternative").removeClass("colorHide");
		}

		interventionObject.notifyStateChange();

	});

	this.element.on("click", ".removeAlternative", function(event, io) {
		event.preventDefault();

		var alternativeLength = $(this).closest(".alternatives").find(".alternative").length;


		if (alternativeLength > 2) {

			if (alternativeLength == 3) {
				$(this).closest(".alternatives").find(".removeAlternative").addClass("colorHide");
			}

			$(this).closest(".alternative").remove();
		}

		interventionObject.notifyStateChange();
		refresh();

	});
}

MultipleOptionsInterventionBlock.prototype.toJson = function() {
	var thisIntervention = this;

	var json = {
		type: this.interventionType,
		orderPosition: this.number,
		first: this.first,
		next: this.nextNumber,
		medias: [],
		options : [],
		conditions : {},
	}

	if (this.mediaUrl != null && this.mediaType != null) {
		json.medias.push(
			{
				'type' : this.mediaType,
				'mediaUrl' : this.mediaUrl
			});
	}

	json['statement'] = $(this.element).find('textarea').val();
	json['obligatory'] = $(this.element).find('.checkObligatory').is(":checked");
	json['questionType'] = QUESTION_TYPE_CHECKBOX;

	var alternatives = this.element.find(".alternative");

	$.each(alternatives, function(index, alt) {
		json.options.push($(this).find('textarea').val());
	});

	return json;
}

MultipleOptionsInterventionBlock.prototype.loadState = function(state) {
	InterventionBlock.prototype.loadState.call(this, state);


	var alternativesLoop = this.element.find(".alternatives");

	//$(alternativesLoop).empty();
	var c;
	for (var i = 0; i < state.options.length-2; i++) {
		c = i +3;
		var newAlternative = $(this.element).find(".alternative").first().clone();
		newAlternative.find('.alternativeCounter').text(c);
		newAlternative.find("textarea").val('');

		$(this.element).find(".alternatives").append(newAlternative);

	}

		var alternatives = this.element.find(".alternative");

	if (alternatives.length > 2) {
		$(this.element).find(".removeAlternative").removeClass("colorHide");
	}


	$.each(alternatives, function(index, alt) {
		$(this).find('textarea').val(state.options[index]);
	});
}

MultipleOptionsInterventionBlock.prototype.getProblems = function(problems) {

	InterventionBlock.prototype.getProblems.call(this, problems);

	var alternatives = this.element.find(".alternative");

	var thisIntervention = this;

	$.each(alternatives, function(index, alt) {
		if ($(this).find('textarea').val() == "") {
			problems.push("Intervenção " + thisIntervention.blockTitle + " " + thisIntervention.number + ": alternativa " + index + " não foi definida.");
		}

	});


	return problems;
}



/**********************************************************************************************
                                     TaskInterventionBlock
***********************************************************************************************/


var TaskInterventionBlock = function (editor, jsonObj) {

	InterventionBlock.call(this, editor, jsonObj);
	this.blockTitle = 'Aplicação Externa';
	this.icon = '<i class="fa fa-list-ul fa-1x" aria-hidden="true"></i>';
	this.statementPlaceHolder = 'Digite a descrição da aplicação';
	this.interventionType = 'task';

	// this.bindParametersEvents();

};

TaskInterventionBlock.prototype = Object.create(InterventionBlock.prototype);
TaskInterventionBlock.prototype.constructor = TaskInterventionBlock;

TaskInterventionBlock.prototype.getInnerHTML = function(intervention) {
	str = '<br/><div class="col-xs-12">\
                                <div class="form-group">\
                                		<label>Digite a URL do aplicativo na Google Play (<span class="url-counter">0/50</span>):</label>\
                                        <textarea class="form-control app" placeholder="Digite o texto" rows="2"></textarea>\
                                </div>\
                        </div>';
	str+= '<div class="col-xs-12">\
     <div class="form-group">\
     <div class="parameters"><div class="row interventionSubtitle"><div class="col-xs-12"><h6>Parâmetros</h6></div></div>';

			var strRet = '<div class="row parameter">\
							<div class="col-xs-2 parameterCounter" style="text-align: center;display: cell">'+
							1
							+'</div>\
							<div class="col-xs-8">\
								<div class="form-group">\
									<textarea class="form-control" placeholder="Digite um parâmetro" rows="1"></textarea>\
								</div>\
							</div>\
							<div class="col-xs-2">\
								<div class="form-group">\
									<button class="btn btn-link removeParameter colorHide"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>\
								</div>\
							</div>\
							<div class="col-xs-offset-2 col-xs-8">\
								<div class="form-group">\
									<textarea class="form-control value" placeholder="Valor" rows="1"></textarea>\
								</div>\
							</div>\
					  </div>';
          // <textarea class="form-control parameters" placeholder="Digite os parâmetros da tarefa" rows="2"></textarea>\'


         str += strRet + '</div>\
         <div class="row">\
						<div class="col-xs-12">\
							<div class="form-group">\
								<button class="btn btn-prev btn-block addParameter">Adicionar parâmetro</button>\
							</div>\
						</div>\
					</div>\
                  </div><hr class="dashed">';
;

	return str;

}

TaskInterventionBlock.prototype.toJson = function() {
	var thisIntervention = this;

	var json = {
		type: this.interventionType,
		orderPosition: this.number,
		first: this.first,
		next: this.nextNumber,
		medias: [],
		parameters: null
	}

	if (this.mediaUrl != null && this.mediaType != null) {
		json.medias.push(
			{
				'type' : this.mediaType,
				'mediaUrl' : this.mediaUrl
			});
	}

	json['statement'] = $(this.element).find('textarea.question').val();
	json['obligatory'] = $(this.element).find('.checkObligatory').is(":checked");
	json['appPackage'] = $(this.element).find('textarea.app').val();
	// json['parameters'] = $(this.element).find('textarea.parameters').val();

	var parameters = this.element.find(".parameter");
	var p = {};
	$.each(parameters, function(index, alt) {
		// var p = {};
		p[$(this).find('textarea').val().replace('"', '').replace("'", "")] = $(this).find('textarea.value').val().replace('"', '').replace("'", "");
		// console.log(p);
		// json.parameters.push(p);

	});
	json.parameters = p;
	return json;
}

TaskInterventionBlock.prototype.bindParametersEvents = function() {

	var interventionObject = this;

	this.element.on("change keyup paste", ".app", function(event, ui) {
		$(this).parent().find('.url-counter').text(event.currentTarget.textLength+"/50");
	});


	this.element.on("click", ".addParameter", function(event, io) {
		event.preventDefault();

		var parameterLength = $(this).closest(".panel-body").find(".parameter").length;

		var newParameter = $(this).closest(".panel-body").find(".parameter").first().clone();

		newParameter.find(".parameterCounter").text(parameterLength+1);
		newParameter.find("textarea").val('');

		newParameter.find("textarea.value").val('');

		// newAlternative.find("select.selectBlock").val(interventionObject.nextNumber);

		$(this).closest(".panel-body").find(".parameters").append(newParameter);

		if (parameterLength >= 1) {
			$(this).closest(".panel-body").find(".removeParameter").removeClass("colorHide");
		}

		interventionObject.notifyStateChange();

	});

	this.element.on("click", ".removeParameter", function(event, io) {
		event.preventDefault();

		var parameterLength = $(this).closest(".parameters").find(".parameter").length;
		var parameter = $(event.target).closest(".parameter");
		var index =  $(parameter).index();

		// var keys = Object.keys(interventionObject.optionalNext).sort();

		// if (keys.length > 0) {
		// 	for (var i = index+1; i < keys.length; i++) {
		// 		interventionObject.optionalNext[keys[i-1]] = interventionObject.optionalNext[keys[i]];
		// 	}
		// }



		if (parameterLength > 1) {

			if (parameterLength == 2) {
				$(this).closest(".parameters").find(".removeParameter").addClass("colorHide");
			}

			$(this).closest(".parameter").remove();
		}

		interventionObject.notifyStateChange();

		refresh();

	});
}

TaskInterventionBlock.prototype.loadState = function(state) {
	InterventionBlock.prototype.loadState.call(this, state);

	$(this.element).find('textarea.app').val(state.appPackage);
	// console.log(state);
	$(this.element).find('.url-counter').text(state.appPackage.length+"/50")

	var parametersLoop = this.element.find(".parameters");


	//$(alternativesLoop).empty();
	var c;
	var keys = Object.keys(state.parameters);
	for (var i = 0; i < keys.length -1 ; i++) {
		c = i+2;
		var newParameter = $(this.element).find(".parameter").first().clone();
		newParameter.find('.parameterCounter').text(c);
		newParameter.find("textarea").val('');
		newParameter.find("textarea.value").val('');

		$(this.element).find(".parameters").append(newParameter);

	}

		var parameters = this.element.find(".parameter");

	if (parameters.length > 1) {
		$(this.element).find(".removeParameter").removeClass("colorHide");
	}

	var p = this.element;


	$.each(parameters, function(index, alt) {
		// console.log(state.parameters[index]);
		// $.each(state.parameters[index], function(key, value){
			$(this).find('textarea').val(Object.keys(state.parameters)[index]);
			$(this).find('textarea.value').val(Object.values(state.parameters)[index]);
		// })
	});


	// $(this.element).find('textarea.parameters').val(state.parameters);

}

TaskInterventionBlock.prototype.getProblems = function(problems) {

	InterventionBlock.prototype.getProblems.call(this, problems);

	if ($(this.element).find('textarea.app').val() == "") {
			problems.push("Intervenção " + this.blockTitle + " " + this.number + ": não foi definida a url da aplicação externa.");
	}
	// if ($(this.element).find('textarea.parameters').val() == "") {
 //                        problems.push("Intervenção " + this.blockTitle + " " + this.number + ": não foram definidos os parâmetros.");
 //        }

	return problems;
}
