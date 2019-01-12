/********************************************************************************************** 
                                     ESPIM MODEL OBJECT
***********************************************************************************************/

var EspimModelObject = function() {
	this.id = null;
}

EspimModelObject.REST_SERVICE = 'http://esm-rest-service.herokuapp.com/';

//EspimModelObject.REST_SERVICE = 'http://www.espim.com.br:8080/esm-rest-service-0.1.0/';

//EspimModelObject.REST_SERVICE =  'http://localhost:8080/esm-rest-service-0.1.0/';

EspimModelObject.prototype.parseIdFromJson = function(jsonObj) {
	var retornValue = null;
	try {
		retornValue = this.parseIdFromURI(jsonObj['_links']['self']['href']);
	} catch(err) {
		console.log('Error trying to extract id from:', jsonObj);
	}
	return retornValue;
};

EspimModelObject.prototype.parseIdFromURI = function(uri) {
	return parseInt(uri.substring(uri.lastIndexOf('/')+1));
};


/********************************************************************************************** 
                                     Observer
***********************************************************************************************/
var Observer = function (jsonObj) {
	EspimModelObject.call(this);
	//Data;
	this.name = null;
	this.email = null;
	this.role = null;
	this.contacts = [];

	if (jsonObj) {
		this.name = jsonObj['name'];
		this.email = jsonObj['email'];
		this.role = jsonObj['role'];
		this.id = this.parseIdFromJson(jsonObj)
	}
};

Observer.prototype = Object.create(EspimModelObject.prototype);
Observer.prototype.constructor = Observer;

Observer.REST_MODEL = 'observers';

Observer.prototype.toJson = function() {
	var json = {
		name: this.name,
		email: this.email,
		role: this.role,
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return JSON.stringify(json);
}


Observer.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + Observer.REST_MODEL + '/' + this.id;
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
		this.id = this.parseIdFromJson(jsonObj)
	}
};
Participant.prototype = Object.create(EspimModelObject.prototype);
Participant.prototype.constructor = Participant;

Participant.REST_MODEL = 'participants';

Participant.prototype.toJson = function() {
	var json = {
		name: this.name,
		email: this.email,
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return JSON.stringify(json);
}

Participant.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + Participant.REST_MODEL + '/' + this.id;
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
		this.id = this.parseIdFromJson(jsonObj);
		this.medias = jsonObj['medias'];
	}
};


Intervention.prototype = Object.create(EspimModelObject.prototype);
Intervention.prototype.constructor = Intervention;
Intervention.REST_MODEL = 'interventions';

Intervention.prototype.toJson = function() {
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

	return JSON.stringify(json);
}

Intervention.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + Intervention.REST_MODEL + '/' + this.id;
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
EmptyIntervention.REST_MODEL = 'empty-interventions';

EmptyIntervention.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + EmptyIntervention.REST_MODEL + '/' + this.id;
}

EmptyIntervention.prototype.friendlyOutput = function() {
	return '(Mensagem) - ' + this.statement;
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
QuestionIntervention.REST_MODEL = 'question-interventions';

QuestionIntervention.prototype.toJson = function() {
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
		medias : this.medias
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return JSON.stringify(json);
}

QuestionIntervention.friendlyOutputMap = ['Questão Aberta', 'Multipla Escolha', 'Multiplas Opções', 'Likert', 'Difencial Semântico'];

QuestionIntervention.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + QuestionIntervention.REST_MODEL + '/' + this.id;
}

QuestionIntervention.prototype.friendlyOutput = function() {
	return '(' + QuestionIntervention.friendlyOutputMap[this.questionType] + ') - ' + this.statement;
}


/********************************************************************************************** 
                                     TaskIntervention
***********************************************************************************************/
var TaskIntervention = function (jsonObj) {
	Intervention.call(this, jsonObj);
	this.appPackage = null;
	this.type = 'task';

	if (jsonObj) {
		this.appPackage = jsonObj['appPackage'];
	}
};

TaskIntervention.prototype = Object.create(Intervention.prototype);
TaskIntervention.prototype.constructor = TaskIntervention;
TaskIntervention.REST_MODEL = 'task-interventions';

TaskIntervention.prototype.toJson = function() {
	var json = {
		type: this.type,
		statement: this.statement,
		orderPosition: this.orderPosition,
		first: this.first,
		next: this.next,
		obligatory: this.obligatory,
		appPackage : this.appPackage,
		medias : this.medias
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return JSON.stringify(json);
}

TaskIntervention.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + TaskIntervention.REST_MODEL + '/' + this.id;
}


TaskIntervention.prototype.friendlyOutput = function() {
	return '(Tarefa) - ' + this.statement;
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
MediaIntervention.REST_MODEL = 'media-interventions';

MediaIntervention.prototype.toJson = function() {
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

	return JSON.stringify(json);
}

MediaIntervention.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + MediaIntervention.REST_MODEL + '/' + this.id;
}

MediaIntervention.prototype.friendlyOutput = function() {
	return '(Mídia Recebida) - ' + this.statement;
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
	return '(Intervenção) - ' + this.statement;
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
		this.mediaType = jsonObj['mediaType'];
		this.url = jsonObj['mediaType'];
	}
};

MediaPresentation.prototype = Object.create(Intervention.prototype);
MediaPresentation.prototype.constructor = MediaPresentation;
MediaPresentation.REST_MODEL = 'media-interventions';

MediaPresentation.prototype.toJson = function() {
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

	return JSON.stringify(json);
}

MediaPresentation.prototype.friendlyOutput = function() {
	return '(Mídia Enviada) - ' + this.statement;
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

		this.id = this.parseIdFromJson(jsonObj)
	}
};
ComplexCondition.prototype = Object.create(EspimModelObject.prototype);
ComplexCondition.prototype.constructor = ComplexCondition;
ComplexCondition.REST_MODEL = 'complex-conditions';

ComplexCondition.prototype.toJson = function() {
	var json = {
		value: this.value,
		condition: this.condition,
		next: this.next,
		type: this.type,
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return JSON.stringify(json);
}

ComplexCondition.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + ComplexCondition.REST_MODEL + '/' + this.id;
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

	if (jsonObj) {
		this.triggerType = jsonObj['triggerType'];
		this.triggerCondition = jsonObj['triggerCondition'];
		this.priority = jsonObj['priority'];

		this.id = this.parseIdFromJson(jsonObj)
	}
};
EventTrigger.prototype = Object.create(EspimModelObject.prototype);
EventTrigger.prototype.constructor = EventTrigger;
EventTrigger.REST_MODEL = 'triggers';

EventTrigger.prototype.toJson = function() {
	var json = {
		triggerType: this.triggerType,
		triggerCondition: this.triggerCondition,
		priority : this.priority	
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return JSON.stringify(json);
}

EventTrigger.prototype.getURI = function() {
	return EspimModelObject.REST_SERVICE + EventTrigger.REST_MODEL + '/' + this.id;
}

EventTrigger.prototype.toReadableString = function() {
	var cron = parseCronString(this.triggerCondition);

	var ret = "";

	if (cron.type == 'daily') {
		ret += "Todos os dias"
	} else if (cron.type == "weekly") {
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

	return ret;
}

/********************************************************************************************** 
                                     ActiveEvent
***********************************************************************************************/
var ActiveEvent = function (jsonObj) {
	EspimModelObject.call(this);
	//Data;
	this.type = 'active';
	this.title = null;
	this.description = null;
	this.triggers = [];
	this.interventions = [];

	if (jsonObj) {
		this.type = jsonObj['type'];
		this.title = jsonObj['title'];
		this.description = jsonObj['description'];

		this.id = this.parseIdFromJson(jsonObj)
	}
};
ActiveEvent.prototype = Object.create(EspimModelObject.prototype);
ActiveEvent.prototype.constructor = ActiveEvent;
ActiveEvent.REST_MODEL = 'active-events';

ActiveEvent.prototype.toJson = function() {
	var json = {
		type: this.type,
		title: this.title,
		description: this.description,
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return JSON.stringify(json);
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
	return EspimModelObject.REST_SERVICE + ActiveEvent.REST_MODEL + '/' + this.id;
}

/********************************************************************************************** 
                                     Program
***********************************************************************************************/
var Program = function (jsonObj) {
	EspimModelObject.call(this);
	//Data;
	this.title = null;
	this.description = null;
	this.starts = null;
	this.ends = null;
	this.updateDate = null;
	this.observers = [];
	this.participants = [];
	this.events = [];

	if (jsonObj) {
		//console.log('program constructor', jsonObj);
		this.title = jsonObj['title'];
		this.description = jsonObj['description'];
		this.starts = UTCStringtoMoment(jsonObj['starts']);
		this.ends = UTCStringtoMoment(jsonObj['ends']);
		//this.updateDate = UTCStringtoMoment(jsonObj['updateDate']);

		this.id = this.parseIdFromJson(jsonObj)
	}
};

Program.prototype = Object.create(EspimModelObject.prototype);
Program.prototype.constructor = Program;
Program.REST_MODEL = 'programs';

Program.prototype.toJson = function() {
	var json = {
		type: this.type,
		title: this.title,
		description: this.description,
		starts: momentToUTCString(this.starts),
		ends: momentToUTCString(this.ends),
		//updateDate: momentToUTCString(this.updateDate),
	}

	if (this.id != null) {
		json['id'] = this.id;
	}

	return JSON.stringify(json);
}

Program.prototype.toString = function() {
	var str = this.title;

	if (this.description != null) {
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
	return EspimModelObject.REST_SERVICE + Program.REST_MODEL + '/' + this.id;
}