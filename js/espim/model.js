/**********************************************************************************************
                                     ESPIM MODEL OBJECT
***********************************************************************************************/

var EspimModelObject = function() {
	this.id = null;
}

EspimModelObject.REST_SERVICE = 'http://www.espim.com.br/ws-0.1/';
//EspimModelObject.REST_SERVICE = 'http://172.26.170.192:8000/';




EspimModelObject.prototype.parseIdFromURI = function(uri) {
	return parseInt(uri.substring(uri.lastIndexOf('/')+1));
};


EspimModelObject.prototype.toJson = function(verbose=false) {
	return JSON.stringify(this.toJsonInternal(verbose));
};

/**********************************************************************************************
                                     Observer
***********************************************************************************************/
var Observer = function (jsonObj) {
	EspimModelObject.call(this);
	//Data;
	this.progams = null;
	this.email = null;
	this.role = null;
	this.contacts = [];

	if (jsonObj) {
		this.name = jsonObj['name'];
		this.email = jsonObj['email'];
		this.role = jsonObj['role'];
		this.id = jsonObj['id'];

		var thisObserver = this;

		$.each(jsonObj['contacts'], function(index, participantJson) {
			thisObserver.contacts.push(new Participant(participantJson));
		});


	}
};

Observer.prototype = Object.create(EspimModelObject.prototype);
Observer.prototype.constructor = Observer;

Observer.REST_MODEL = 'observers/';

Observer.prototype.toJsonInternal = function(verbose=false) {
	var json = {
		name: this.name,
		email: this.email,
		role: this.role,
		contacts: [],
	}

	if (verbose == true) {
		$.each(this.contacts, function(index, contact) {
			json['contacts'].push(contact.toJson());
		});
	} else {
		$.each(this.contacts, function(index, contact) {
			json['contacts'].push(contact.id);
		});
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return json;
}


Observer.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + Observer.REST_MODEL + this.id + "/";
}

Observer.prototype.addContact = function(contact) {
	this.contacts.push(contact);
}

Observer.prototype.clearContacts = function(contact) {
	this.contacts.length = 0;
}

/**********************************************************************************************
                                     Participant
***********************************************************************************************/

var Participant = function (jsonObj) {
	EspimModelObject.call(this);
	//Data;
	this.name = null;
	this.email = null;

	if (jsonObj) {
		this.name = jsonObj['name'];
		this.email = jsonObj['email'];
		this.id = jsonObj['id'];
	}
};
Participant.prototype = Object.create(EspimModelObject.prototype);
Participant.prototype.constructor = Participant;

Participant.REST_MODEL = 'participants/';

Participant.prototype.toJsonInternal = function(verbose=false) {
	var json = {
		name: this.name,
		email: this.email,
		observerResponsible: this.observerResponsible
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return json;
}

Participant.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + Participant.REST_MODEL + this.id + '/';
}


/**********************************************************************************************
                                     EventTrigger
***********************************************************************************************/
var EventTrigger = function (jsonObj) {
	EspimModelObject.call(this);
	//Data;
	this.triggerType = "time";
	this.triggerCondition = null;
	this.priority = "NC";
	this.timeOut = 1800000;

	if (jsonObj) {
		this.triggerType = jsonObj['triggerType'];
		this.triggerCondition = jsonObj['triggerCondition'];
		this.priority = jsonObj['priority'];
		this.timeOut = jsonObj['timeOut'];
		if (jsonObj['id'] != null){
			this.id = jsonObj['id'];
		}
	}
};
EventTrigger.prototype = Object.create(EspimModelObject.prototype);
EventTrigger.prototype.constructor = EventTrigger;
EventTrigger.REST_MODEL = 'triggers/';

EventTrigger.prototype.toJsonInternal = function(verbose=false) {
	var json = {
		triggerType: this.triggerType,
		triggerCondition: this.triggerCondition,
		priority : this.priority,
		timeOut: this.timeOut
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return json;
}

EventTrigger.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + EventTrigger.REST_MODEL  + this.id + '/';
}

EventTrigger.prototype.toReadableString = function() {
	var ret = "";
	if (this.triggerType === 'manual'){
		ret = "Disparo manual";
}else{
var cron = parseCronString(this.triggerCondition);
	if (cron.type == 'daily') {
		ret += "Todos os dias"
	} else if ((cron.type == "weekly") || (cron.type == "custom")) {
		var isFirstDay = true;
		var tail = null;
		for (var i = 0; i < cron.days.length; i++) {
			if (cron.days[i]) {
				if (isFirstDay) {
					isFirstDay = false;
					ret += daysByIndex[i];
				} else if (tail != null) {
					ret += ", " + tail;
					tail = daysByIndex[i];
				} else {
					tail = daysByIndex[i];
				}
			}
		}

		if (tail != null) {
			ret += " e " + tail;
		}
	}

	if (this.priority == "NC") {
		ret += " uma notificação curta "
	} else if (this.priority == "AL") {
		ret += " um alarme "
	} else if (this.priority == "NL") {
		ret += " uma notificação longa "
	}

	ret += " às ";
	ret += cron.h < 10 ? "0" + cron.h : cron.h;
	ret +=  ":";
	ret += cron.m < 10 ? "0" + cron.m : cron.m
}
	return ret;
}


/**********************************************************************************************
                                     Intervention
***********************************************************************************************/
var Intervention = function (jsonObj) {
	EspimModelObject.call(this);

	this.type = null;
	this.statement = null;
	this.orderPosition = null;
	this.first = null;
	this.next = null;
	this.obligatory = null;
	this.medias = [];

	if (jsonObj) {
		this.type = jsonObj['type'];
		if (jsonObj.hasOwnProperty('statment')) {
			this.statement = jsonObj['statment'];
		} else if (jsonObj.hasOwnProperty('statement')) {
			this.statement = jsonObj['statement'];
		}
		this.orderPosition = jsonObj['orderPosition'];
		this.first = jsonObj['first'];
		this.next = jsonObj['next'];
		this.obligatory = jsonObj['obligatory'];
		this.id = jsonObj['id'];
		this.medias = jsonObj['medias'];
	}
};


Intervention.prototype = Object.create(EspimModelObject.prototype);
Intervention.prototype.constructor = Intervention;
Intervention.REST_MODEL = 'interventions/';

Intervention.prototype.toJsonInternal = function(verbose=false) {
	var json = {
		type: this.type,
		statement: this.statement,
		orderPosition: this.orderPosition,
		first: this.first,
		next: this.next,
		obligatory: this.obligatory,
		medias : this.medias
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return json;
}

Intervention.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + Intervention.REST_MODEL + this.id + '/';
}

Intervention.prototype.addMedia = function(type, mediaUrl) {
	this.medias.push({type: type, mediaUrl: mediaUrl});
}

/**********************************************************************************************
                                     EmptyIntervention
***********************************************************************************************/
var EmptyIntervention = function (jsonObj) {
	Intervention.call(this, jsonObj);
	this.type = 'empty';
};

EmptyIntervention.prototype = Object.create(Intervention.prototype);
EmptyIntervention.prototype.constructor = EmptyIntervention;
EmptyIntervention.REST_MODEL = 'empty-interventions/';

EmptyIntervention.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + EmptyIntervention.REST_MODEL + this.id + '/';
}

EmptyIntervention.prototype.friendlyOutput = function() {
	var n = this.statement.length;
	var comp = '';
	if (n > 30){
		n = 30;
		comp = ' ...'
	}
	return 'Mensagem - ' + this.statement.slice(0, n) + comp;
}

/**********************************************************************************************
                                     QuestionIntervention
***********************************************************************************************/
var QuestionIntervention = function (jsonObj) {
	Intervention.call(this, jsonObj);
	this.questionType = null;
	this.options = [];
	this.conditions = {};
	this.complexConditions = [];
	this.type = 'question';

	if (jsonObj) {
		this.questionType = jsonObj['questionType'];
		this.options = jsonObj['options'];
		this.conditions = jsonObj['conditions'];
	}
};

QuestionIntervention.prototype = Object.create(Intervention.prototype);
QuestionIntervention.prototype.constructor = QuestionIntervention;
QuestionIntervention.REST_MODEL = 'question-interventions/';

QuestionIntervention.prototype.toJsonInternal = function() {
	var json = {
		type: this.type,
		statement: this.statement,
		orderPosition: this.orderPosition,
		first: this.first,
		next: this.next,
		obligatory: this.obligatory,
		questionType: this.questionType,
		options: this.options,
		conditions: this.conditions,
		medias : this.medias,
		complexConditions : this.complexConditions
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return json;
}

QuestionIntervention.friendlyOutputMap = ['Questão Aberta', 'Escolha Única', 'Escolha Múltipla', 'Likert', 'Difencial Semântico'];

QuestionIntervention.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + QuestionIntervention.REST_MODEL + this.id + '/';
}

QuestionIntervention.prototype.friendlyOutput = function() {
	var n = this.statement.length;
	var comp = '';
	if (n > 30){
		n = 30;
		comp = ' ...'
	}
	return QuestionIntervention.friendlyOutputMap[this.questionType] + ' - ' + this.statement.slice(0, n) + comp;
}


/**********************************************************************************************
                                     TaskIntervention
***********************************************************************************************/
var TaskIntervention = function (jsonObj) {
	Intervention.call(this, jsonObj);
	this.appPackage = null;
	this.parameters = '';
	this.type = 'task';

	if (jsonObj) {
		this.appPackage = jsonObj['appPackage'];
		this.parameters = jsonObj['parameters'];
	}
};

TaskIntervention.prototype = Object.create(Intervention.prototype);
TaskIntervention.prototype.constructor = TaskIntervention;
TaskIntervention.REST_MODEL = 'task-interventions/';

TaskIntervention.prototype.toJsonInternal = function() {
	var json = {
		type: this.type,
		statement: this.statement,
		orderPosition: this.orderPosition,
		first: this.first,
		next: this.next,
		obligatory: this.obligatory,
		appPackage : this.appPackage,
		parameters: this.parameters,
		medias : this.medias
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return json;
}

TaskIntervention.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + TaskIntervention.REST_MODEL + this.id + '/';
}


TaskIntervention.prototype.friendlyOutput = function() {
	var n = this.statement.length;
	var comp = '';
	if (n > 30){
		n = 30;
		comp = ' ...'
	}
	return 'Tarefa - ' + this.statement.slice(0, n) + comp;
}

/**********************************************************************************************
                                     MediaIntervention
***********************************************************************************************/
var MediaIntervention = function (jsonObj) {
	Intervention.call(this, jsonObj);
	this.mediaType = null;
	this.type = 'media';

	if (jsonObj) {
		this.mediaType = jsonObj['mediaType'];
	}
};

MediaIntervention.prototype = Object.create(Intervention.prototype);
MediaIntervention.prototype.constructor = MediaIntervention;
MediaIntervention.REST_MODEL = 'media-interventions/';

MediaIntervention.prototype.toJsonInternal = function() {
	var json = {
		type: this.type,
		statement: this.statement,
		orderPosition: this.orderPosition,
		first: this.first,
		next: this.next,
		obligatory: this.obligatory,
		mediaType : this.mediaType,
		medias : this.medias
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return json;
}

MediaIntervention.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + MediaIntervention.REST_MODEL + this.id + '/';
}

MediaIntervention.prototype.friendlyOutput = function() {
	var n = this.statement.length;
	var comp = '';
	if (n > 30){
		n = 30;
		comp = ' ...'
	}
	return 'Mídia Recebida - ' + this.statement.slice(0, n) + comp;
}

Intervention.TypeMap = {
	'empty' : EmptyIntervention,
	'question' : QuestionIntervention,
	'task' : TaskIntervention,
	'media' : MediaIntervention,
	'media-intervention' : MediaIntervention,
	'presentation' : MediaPresentation,
	'media-presentation' : MediaPresentation,
}

Intervention.CreateIntervetion = function(json) {
	var intervetionClass = Intervention.TypeMap[json.type];

	if (json.type == 'empty') {
		return new EmptyIntervention(json);
	} else if (json.type == 'question') {
		return new QuestionIntervention(json);
	} else if (json.type == 'task') {
		return new TaskIntervention(json);
	} else if (json.type == 'media' || json.type == 'media-intervention') {
		return new MediaIntervention(json);
	} else if (json.type == 'presentation' || json.type == 'media-presentation') {
		return new MediaPresentation(json);
	} else {
		return new Intervention(json);
	}
}

Intervention.prototype.friendlyOutput = function() {
	var n = this.statement.length;
	var comp = '';
	if (n > 30){
		n = 30;
		comp = ' ...'
	}
	return 'Intervenção - ' + this.statement.slice(0, n) + comp;
}

/**********************************************************************************************
                                     MediaPresentation
***********************************************************************************************/
var MediaPresentation = function (jsonObj) {
	Intervention.call(this, jsonObj);
	this.mediaType = null;
	this.url = null;
	this.type = 'presentation-media';

	if (jsonObj) {
		this.id= jsonObj['id'];
		this.mediaType = jsonObj['mediaType'];
		this.url = jsonObj['url'];
	}
};

MediaPresentation.prototype = Object.create(Intervention.prototype);
MediaPresentation.prototype.constructor = MediaPresentation;
MediaPresentation.REST_MODEL = 'media-interventions/';

MediaPresentation.prototype.toJsonInternal = function() {
	var json = {
		type: this.type,
		statement: this.statement,
		orderPosition: this.orderPosition,
		first: this.first,
		next: this.next,
		obligatory: this.obligatory,
		mediaType : this.mediaType,

	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return json;
}

MediaPresentation.prototype.friendlyOutput = function() {
	var n = this.statement.length;
	var comp = '';
	if (n > 30){
		n = 30;
		comp = ' ...'
	}
	return 'Mídia Enviada - ' + this.statement.slice(0, n) + comp;
}


MediaPresentation.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + MediaPresentation.REST_MODEL + '/' + this.id;
}


/**********************************************************************************************
                                     ComplexCondition
***********************************************************************************************/
var ComplexCondition = function (jsonObj) {
	EspimModelObject.call(this);
	//Data;
	this.value = null;
	this.type = null;
	this.condition = null;
	this.next = null;

	if (jsonObj) {
		this.value = jsonObj['value'];
		this.type = jsonObj['type'];
		this.condition = jsonObj['condition'];
		this.next = jsonObj['next'];

		this.id = jsonObj['id'];
	}
};
ComplexCondition.prototype = Object.create(EspimModelObject.prototype);
ComplexCondition.prototype.constructor = ComplexCondition;
ComplexCondition.REST_MODEL = 'complex-conditions/';

ComplexCondition.prototype.toJsonInternal = function() {
	var json = {
		value: this.value,
		condition: this.condition,
		next: this.next,
		type: this.type,
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return json;
}

ComplexCondition.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + ComplexCondition.REST_MODEL + this.id + '/';
}

/**********************************************************************************************
                                     ActiveEvent
***********************************************************************************************/
var ActiveEvent = function (jsonObj) {
	EspimModelObject.call(this);
	//Data;
	this.type = 'active';
	this.title = null;
	this.description = "";
	this.group = "";
	this.triggers = [];
	this.interventions = [];

	if (jsonObj) {
		this.type = jsonObj['type'];
		this.title = jsonObj['title'];
		this.description = jsonObj['description'];
		this.group = jsonObj['group'];
		thisEvent = this;

		$.each(jsonObj.triggers, function(index, trigger) {
			thisEvent.triggers.push(new EventTrigger(trigger));
		});

		$.each(jsonObj.interventions, function(index, intervention) {
			thisEvent.interventions.push(Intervention.CreateIntervetion(intervention));
		});

		if(jsonObj["id"] != null){
			this.id = jsonObj['id'];
		}
	}
};
ActiveEvent.prototype = Object.create(EspimModelObject.prototype);
ActiveEvent.prototype.constructor = ActiveEvent;
ActiveEvent.REST_MODEL = 'active-events/';

ActiveEvent.prototype.toJsonInternal = function(verbose=false) {
	var json = {
		type: this.type,
		title: this.title,
		description: this.description,
		group : this.group,
		triggers : [],
		interventions : [],
		sensors : [],
	}

	if (verbose) {
		$.each(this.triggers, function(index, trigger) {
			json['triggers'].push(trigger.toJsonInternal(verbose));
		});

		$.each(this.interventions, function(index, intervention) {
			json['interventions'].push(intervention.toJsonInternal(verbose));
		});

	} else {
		$.each(this.triggers, function(index, trigger) {
			json['triggers'].push(trigger.id);
		});

		$.each(this.interventions, function(index, intervention) {
			json['interventions'].push(intervention.id);
		});
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return json;
}

ActiveEvent.prototype.addTrigger = function(trigger) {
	this.triggers.push(trigger);
}

ActiveEvent.prototype.clearTriggers = function() {
	this.triggers.length = 0;
}

ActiveEvent.prototype.addIntervention= function(intervention) {
	this.interventions.push(intervention);
}

ActiveEvent.prototype.clearInterventions = function() {
	this.interventions.length = 0;
}

ActiveEvent.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + ActiveEvent.REST_MODEL + this.id + '/';
}

/**********************************************************************************************
                                     Program
***********************************************************************************************/
var Program = function (jsonObj) {
	EspimModelObject.call(this);
	//Data;
	this.title = null;
	this.description = "";
	this.starts = "";
	this.ends = "";
	this.updateDate = "";
	this.observers = [];
	this.participants = [];
	this.events = [];

	if (jsonObj) {
		//console.log('program constructor', jsonObj);
		this.title = jsonObj['title'];
		this.description = jsonObj['description'];

		this.starts = UTCStringtoMoment(jsonObj['starts']);
		this.ends = UTCStringtoMoment(jsonObj['ends']);
		this.updateDate = UTCStringtoMoment(jsonObj['updateDate']);

		this.id = jsonObj['id'];

		var thisprogram = this;

		$.each(jsonObj['observers'], function(index, observerJson) {
			thisprogram.observers.push(new Observer(observerJson));
		});

		$.each(jsonObj['participants'], function(index, participantJson) {
			thisprogram.participants.push(new Participant(participantJson));
		});

		$.each(jsonObj['events'], function(index, eventJson) {
			thisprogram.events.push(new ActiveEvent(eventJson));
		});
	}
};

Program.prototype = Object.create(EspimModelObject.prototype);
Program.prototype.constructor = Program;
Program.REST_MODEL = 'programs/';

Program.prototype.toJsonInternal = function(verbose=true) {


	console.log("oiii");
	console.log(this.starts);
	console.log(this.updateDate);
	var json = {
		type: this.type,
		title: this.title,
		description: this.description,
		starts: momentToUTCString(this.starts),
		ends: momentToUTCString(this.ends),
		updateDate: momentToUTCString(this.updateDate),
		observers: [],
		participants: [],
		events : []
		//updateDate: momentToUTCString(this.updateDate),
	}

	//Ensure that starts and ends are not null fields, replacing null to ""
	json.starts = (json.starts ? json.starts : "");
	json.ends = (json.ends ? json.ends : "");

	console.log(this);


	$.each(this.observers, function(index, observer) {
		json.observers.push(observer.id);
	});

	$.each(this.participants, function(index, participant) {
		json.participants.push(participant.id);
	});

	$.each(this.events, function(index, event) {
		json.events.push(event.id);
	});

	if (this.id != null) {
		json['id'] = this.id;
	}

	return json;
}

Program.prototype.toString = function() {
	var str = this.title;

	if (this.description != "") {
		str += ' - ' + this.description;
	}

	return str;

}

Program.prototype.addObserver = function(observer) {
	this.observers.push(observer);
}

Program.prototype.clearObservers = function() {
	this.observers.length = 0;
}

Program.prototype.addParticipant = function(participant) {
	this.participants.push(participant);
}

Program.prototype.clearParticipants = function() {
	this.participants.length = 0;
}

Program.prototype.addEvent = function(event) {
	this.events.push(event);
}

Program.prototype.clearEvents = function() {
	this.events.length = 0;
}

Program.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + Program.REST_MODEL + this.id + '/';
}
