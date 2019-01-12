/********************************************************************************************** 
                                     REST FACADE
***********************************************************************************************/

EspimModelObject.REST_SERVICE = 'http://www.espim.com.br:8080/esm-rest-service-0.1.0/';

var RestFacade = function($http, $q) {
	this.$http = $http;
	this.$q = $q;

}
RestFacade.prototype.post = function(uri, espimModelObject) {
	var jsonData = espimModelObject.toJson();
	console.log(jsonData);


	var config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	return this.$http.post(uri, jsonData, config);
};

RestFacade.prototype.save = function(espimModelObject) {
	var uri = espimModelObject.getURI();
	var jsonData = espimModelObject.toJson();
	var config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	return this.$http.patch(uri, jsonData, config);
};

RestFacade.prototype.delete = function(espimModelObject) {
	var uri = espimModelObject.getURI();
	var config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	return this.$http.delete(uri, config);
};

RestFacade.prototype.getByURI = function(uri) {
	var config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};
	return this.$http.get(uri, config);
};

RestFacade.prototype.list = function(uri, page, size) {
	if (!page) {
		pageSize = 1
		size = 1000
	} else if (!size) {
		size = 20;

	}
	var config = {
		headers: {
			'Content-Type': 'application/json'
		},
		params: {
			'page': page,
			'size': size
		}
	};
	return this.$http.get(uri, config);

};


/********************************************************************************************** 
                                     ObserverRestFacade
***********************************************************************************************/
var ObserverRestFacade = function($http, $q) {
	RestFacade.call(this, $http, $q);
}
ObserverRestFacade.prototype = Object.create(RestFacade.prototype);
ObserverRestFacade.prototype.constructor = ObserverRestFacade;

ObserverRestFacade.prototype.getById = function(id) {
	var $q = this.$q;

	var uri = EspimModelObject.REST_SERVICE + Observer.REST_MODEL + '/' + this.id;
	return this.getById(uri).then(
		function(response) {
			return new Observer(response['data']);
		},
		function(response) {
			return $q.reject(response);
		});
};

ObserverRestFacade.prototype.get = function(observer) {
	var $q = this.$q;

	return this.getByURI(observer.getURI()).then(
		function(response) {
			return new Observer(response['data']);
		},
		function(response) {
			return $q.reject(response);
		});

};

ObserverRestFacade.prototype.getByEmail = function(email) {
	var $q = this.$q;

	var uri = EspimModelObject.REST_SERVICE + Observer.REST_MODEL + '/search/findByEmail'
	var config = {
		headers: {
			'Content-Type': 'application/json'
		},
		params: {
			'email': email
		}
	};
	return this.$http.get(uri, config).then(
		function(response) {
			var array = response['data']['_embedded']['observers'];
			if (array.length == 1) {
				return new Observer(array[0]);
			}
			return null;
		},
		function(response) {
			return $q.reject(response);
		});

};

ObserverRestFacade.prototype.listAll = function(page, size) {
	var uri = EspimModelObject.REST_SERVICE + Observer.REST_MODEL
	var $q = this.$q;

	return this.list(uri, page, size).then(
		function(response) {
			var observers = [];
			if (response['data'].hasOwnProperty('_embedded') &&
				response['data']['_embedded'].hasOwnProperty('observers')) {

				$.each(response['data']['_embedded']['observers'], function(index, participantJson) {
					observers.push(new Participant(participantJson));
				});

			}
			return {
				observers: observers,
				page: response['data']['page']
			};
		},
		function(response) {
			return $q.reject(response);
		});

};

ObserverRestFacade.prototype.add = function(observer) {
	var uri = EspimModelObject.REST_SERVICE + Observer.REST_MODEL

	var $q = this.$q;

	return this.post(uri, observer).then(
		function(response) {
			return new Observer(response['data']);
		},
		function(response) {
			return $q.reject(response);
		});
};

ObserverRestFacade.prototype.getContacts = function(observer, page, size) {
	var uri = observer.getURI() + '/contacts'
		//observer.clearContacts();

	var $q = this.$q;

	return this.list(uri, page, size).then(
		function(response) {
			console.log(response);
			var contacts = [];
			if (response['data'].hasOwnProperty('_embedded') &&
				response['data']['_embedded'].hasOwnProperty('participants')) {

				$.each(response['data']['_embedded']['participants'], function(index, participantJson) {
					contacts.push(new Participant(participantJson));
				});

			}
			return {
				contacts: contacts,
				page: {
					number : page,
					totalPages : contacts.length / size,
					totalElements : contacts.length,
				}
			};;
		},
		function(response) {
			return $q.reject(response);
		});
};


ObserverRestFacade.prototype.saveContacts = function(observer) {
	var contactsUri = []
	$.each(observer.contacts, function(index, contact) {
		contactsUri.push(contact.getURI());
	})

	var jsonData = JSON.stringify({
		'contacts': contactsUri
	});
	var uri = observer.getURI();
	var config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	return this.$http.patch(uri, jsonData, config);
};

/********************************************************************************************** 
                                     ParticipantRestFacade
***********************************************************************************************/

var ParticipantRestFacade = function($http, $q) {
	RestFacade.call(this, $http, $q);
}
ParticipantRestFacade.prototype = Object.create(RestFacade.prototype);
ParticipantRestFacade.prototype.constructor = ParticipantRestFacade

ParticipantRestFacade.prototype.getById = function(id) {
	var uri = EspimModelObject.REST_SERVICE + Participant.REST_MODEL + '/' + id;
	var $q = this.$q;

	return this.getByURI(uri).then(
		function(response) {
			return new Participant(response['data'])
		},
		function(response) {
			return $q.reject(response);
		}
	);

};

ParticipantRestFacade.prototype.get = function(participant) {
	return this.getByURI(participant.getURI()).then(
		function(response) {
			return new Participant(response['data'])
		},
		function(response) {
			return $q.reject(response);
		}
	);

};

ParticipantRestFacade.prototype.getByEmail = function(email) {
	var uri = EspimModelObject.REST_SERVICE + Participant.REST_MODEL + '/search/findByEmail'
	var config = {
		headers: {
			'Content-Type': 'application/json'
		},
		params: {
			'email': email
		}
	};
	return this.$http.get(uri, config).then(
		function(response) {
			var array = response['data']['_embedded']['participants'];
			if (array.length == 1) {
				return new Participant(array[0]);
			}
			return null;
		},
		function(response) {
			return $q.reject(response);
		});

};

ParticipantRestFacade.prototype.listAll = function(page, size) {
	var uri = EspimModelObject.REST_SERVICE + Participant.REST_MODEL
	var $q = this.$q;

	return this.list(uri, page, size).then(
		function(response) {
			var participants = [];
			if (response['data'].hasOwnProperty('_embedded') &&
				response['data']['_embedded']) {

				$.each(response['data']['_embedded']['participants'], function(index, participantJson) {
					participants.push(new Participant(participantJson));
				});

			}
			return {
				participants: participants,
				page: response['data']['page']
			};
		},
		function(response) {
			return $q.reject(response);
		});
};

ParticipantRestFacade.prototype.add = function(participant) {
	var uri = EspimModelObject.REST_SERVICE + Participant.REST_MODEL

	var $q = this.$q;

	return this.post(uri, participant).then(
		function(response) {
			return new Participant(response['data']);
		},
		function(response) {
			return $q.reject(response);
		});
};

/********************************************************************************************** 
                                     InterventionRestFacade
***********************************************************************************************/

var InterventionRestFacade = function($http, $q) {
	RestFacade.call(this, $http, $q);
}
InterventionRestFacade.prototype = Object.create(RestFacade.prototype);
InterventionRestFacade.prototype.constructor = InterventionRestFacade;


InterventionRestFacade.prototype.getById = function(id) {
	var uri = EspimModelObject.REST_SERVICE + Intervention.REST_MODEL + '/' + id;
	var $q = this.$q;

	return this.getByURI(uri).then(
		function(response) {
			return Intervention.CreateIntervetion(response['data'])
		},
		function(response) {
			return $q.reject(response);
		}
	);

};

InterventionRestFacade.prototype.get = function(participant) {
	return this.getByURI(participant.getURI()).then(
		function(response) {
			return Intervention.CreateIntervetion(response['data'])
		},
		function(response) {
			return $q.reject(response);
		}
	);

};

InterventionRestFacade.prototype.listAll = function(page, size) {
	var uri = EspimModelObject.REST_SERVICE + Intervention.REST_MODEL
	var $q = this.$q;

	return this.list(uri, page, size).then(
		function(response) {
			var interventions = [];
			if (response['data'].hasOwnProperty('_embedded')) {

				$.each(response['data']['_embedded'], function(index, intervetionArray) {
					$.each(intervetionArray, function(index2, intervetionJson) {
						interventions.push(Intervention.CreateIntervetion(intervetionJson));

					});
				});
			}
			return {
				interventions: interventions,
				page: response['data']['page']
			};
		},
		function(response) {
			return $q.reject(response);
		});
};

InterventionRestFacade.prototype.add = function(intervetion) {
	var uri = EspimModelObject.REST_SERVICE + Intervention.TypeMap[intervetion.type].REST_MODEL;

	var $q = this.$q;

	return this.post(uri, intervetion).then(
		function(response) {
			return Intervention.CreateIntervetion(response['data']);
		},
		function(response) {
			return $q.reject(response);
		});
};

/********************************************************************************************** 
                                     TriggerRestFacade
***********************************************************************************************/

var TriggerRestFacade = function($http, $q) {
	RestFacade.call(this, $http, $q);
}
TriggerRestFacade.prototype = Object.create(RestFacade.prototype);
TriggerRestFacade.prototype.constructor = TriggerRestFacade;

TriggerRestFacade.prototype.getById = function(id) {
	var uri = EspimModelObject.REST_SERVICE + EventTrigger.REST_MODEL + '/' + id;
	var $q = this.$q;

	return this.getByURI(uri).then(
		function(response) {
			return new EventTrigger(response['data'])
		},
		function(response) {
			return $q.reject(response);
		}
	);

};

TriggerRestFacade.prototype.get = function(trigger) {
	return this.getByURI(trigger.getURI()).then(
		function(response) {
			return new EventTrigger(response['data'])
		},
		function(response) {
			return $q.reject(response);
		}
	);

};

TriggerRestFacade.prototype.listAll = function(page, size) {
	var uri = EspimModelObject.REST_SERVICE + EventTrigger.REST_MODEL
	var $q = this.$q;

	return this.list(uri, page, size).then(
		function(response) {
			var triggers = [];
			if (response['data'].hasOwnProperty('_embedded') &&
				response['data']['_embedded']) {

				$.each(response['data']['_embedded']['triggers'], function(index, triggerJson) {
					triggers.push(new EventTrigger(triggerJson));
				});

			}
			return {
				triggers: triggers,
				page: response['data']['page']
			};
		},
		function(response) {
			return $q.reject(response);
		});
};

TriggerRestFacade.prototype.add = function(trigger) {
	var uri = EspimModelObject.REST_SERVICE + EventTrigger.REST_MODEL

	var $q = this.$q;

	return this.post(uri, trigger).then(
		function(response) {
			return new EventTrigger(response['data']);
		},
		function(response) {
			return $q.reject(response);
		});
};


/********************************************************************************************** 
                                     EventRestFacade
***********************************************************************************************/

var EventRestFacade = function($http, $q) {
	RestFacade.call(this, $http, $q);
}
EventRestFacade.prototype = Object.create(RestFacade.prototype);
EventRestFacade.prototype.constructor = EventRestFacade;

EventRestFacade.prototype.getById = function(id) {
	var uri = EspimModelObject.REST_SERVICE + ActiveEvent.REST_MODEL + '/' + id;
	var $q = this.$q;

	return this.getByURI(uri).then(
		function(response) {
			return new ActiveEvent(response['data'])
		},
		function(response) {
			return $q.reject(response);
		}
	);

};

EventRestFacade.prototype.get = function(event) {
	return this.getByURI(event.getURI()).then(
		function(response) {
			return new ActiveEvent(response['data'])
		},
		function(response) {
			return $q.reject(response);
		}
	);

};

EventRestFacade.prototype.listAll = function(page, size) {
	var uri = EspimModelObject.REST_SERVICE + ActiveEvent.REST_MODEL
	var $q = this.$q;

	return this.list(uri, page, size).then(
		function(response) {
			var events = [];
			if (response['data'].hasOwnProperty('_embedded') &&
				response['data']['_embedded']) {

				$.each(response['data']['_embedded']['active-events'], function(index, eventJson) {
					events.push(new ActiveEvent(eventJson));
				});

			}
			return {
				events: events,
				page: response['data']['page']
			};
		},
		function(response) {
			return $q.reject(response);
		});
};

EventRestFacade.prototype.add = function(event) {
	var uri = EspimModelObject.REST_SERVICE + ActiveEvent.REST_MODEL

	console.log(uri);

	var $q = this.$q;

	return this.post(uri, event).then(
		function(response) {
			return new ActiveEvent(response['data']);
		},
		function(response) {
			return $q.reject(response);
		});
};

EventRestFacade.prototype.getTriggers = function(event, page, size) {
	var uri = event.getURI() + '/triggers'

	var $q = this.$q;

	return this.list(uri, page, size).then(
		function(response) {
			var triggers = [];
			if (response['data'].hasOwnProperty('_embedded') &&
				response['data']['_embedded'].hasOwnProperty('triggers')) {

				$.each(response['data']['_embedded']['triggers'], function(index, triggerJson) {
					triggers.push(new EventTrigger(triggerJson));
				});

			}
			return triggers;
		},
		function(response) {
			return $q.reject(response);
		});
};


EventRestFacade.prototype.saveTriggers = function(event) {
	var triggersUri = []
	$.each(event.triggers, function(index, trigger) {
		triggersUri.push(trigger.getURI());
	})

	var jsonData = JSON.stringify({
		'triggers': triggersUri
	});
	console.log(event);

	var uri = event.getURI();
	var config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	return this.$http.patch(uri, jsonData, config);
};

EventRestFacade.prototype.getInterventions = function(event, page, size) {
	var uri = event.getURI() + '/interventions'

	var $q = this.$q;

	return this.list(uri, page, size).then(
		function(response) {
			var interventions = [];
			if (response['data'].hasOwnProperty('_embedded')) {

				$.each(response['data']['_embedded'], function(index, interventionType) {

					$.each(interventionType, function(index2, interventionJson) {
						interventions.push(Intervention.CreateIntervetion(interventionJson));
					});
				});

			}
			return interventions;
		},
		function(response) {
			return $q.reject(response);
		});
};


EventRestFacade.prototype.saveInterventions = function(event) {
	var interventionsUri = []
	$.each(event.interventions, function(index, intervention) {
		interventionsUri.push(intervention.getURI());
	})

	var jsonData = JSON.stringify({
		'interventions': interventionsUri
	});
	var uri = event.getURI();
	var config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	return this.$http.patch(uri, jsonData, config);
};



/********************************************************************************************** 
                                     ProgramRestFacade
***********************************************************************************************/

var ProgramRestFacade = function($http, $q) {
	RestFacade.call(this, $http, $q);
}
ProgramRestFacade.prototype = Object.create(RestFacade.prototype);
ProgramRestFacade.prototype.constructor = ProgramRestFacade;

ProgramRestFacade.prototype.getById = function(id) {
	var uri = EspimModelObject.REST_SERVICE + Program.REST_MODEL + '/' + id;
	var $q = this.$q;

	return this.getByURI(uri).then(
		function(response) {
			return new Program(response['data'])
		},
		function(response) {
			return $q.reject(response);
		}
	);

};

ProgramRestFacade.prototype.get = function(program) {
	return this.getByURI(program.getURI()).then(
		function(response) {
			return new Program(response['data'])
		},
		function(response) {
			return $q.reject(response);
		}
	);

};

ProgramRestFacade.prototype.listAll = function(page, size) {
	var uri = EspimModelObject.REST_SERVICE + Program.REST_MODEL
	var $q = this.$q;

	return this.list(uri, page, size).then(
		function(response) {
			var programs = [];
			if (response['data'].hasOwnProperty('_embedded') &&
				response['data']['_embedded']) {

				$.each(response['data']['_embedded']['programs'], function(index, eventJson) {
					programs.push(new Program(eventJson));
				});

			}
			return {
				programs: programs,
				page: response['data']['page']
			};
		},
		function(response) {
			return $q.reject(response);
		});
};

ProgramRestFacade.prototype.add = function(program) {
	var uri = EspimModelObject.REST_SERVICE + Program.REST_MODEL;

	program.updateDate = moment();

	var $q = this.$q;

	return this.post(uri, program).then(
		function(response) {
			return new Program(response['data']);
		},
		function(response) {
			return $q.reject(response);
		});
};

ProgramRestFacade.prototype.save = function(program) {
	program.updateDate = moment();
	Object.getPrototypeOf(ProgramRestFacade.prototype).save.call(this, program);

};

ProgramRestFacade.prototype.getObservers = function(program, page, size) {
	var uri = program.getURI() + '/observers'

	var $q = this.$q;

	return this.list(uri, page, size).then(
		function(response) {
			var observers = [];
			if (response['data'].hasOwnProperty('_embedded') &&
				response['data']['_embedded'].hasOwnProperty('observers')) {

				$.each(response['data']['_embedded']['observers'], function(index, observerJson) {
					observers.push(new Observer(observerJson));
				});

			}
			return observers;
		},
		function(response) {
			return $q.reject(response);
		});
};


ProgramRestFacade.prototype.saveObservers = function(program) {
	var observersUri = []
	$.each(program.observers, function(index, observers) {
		observersUri.push(observers.getURI());
	})

	var jsonData = JSON.stringify({
		'observers': observersUri
	});
	var uri = program.getURI();
	var config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	return this.$http.patch(uri, jsonData, config);
};

ProgramRestFacade.prototype.getParticipants = function(program, page, size) {
	var uri = program.getURI() + '/participants'

	var $q = this.$q;

	return this.list(uri, page, size).then(
		function(response) {
			var participants = [];
			if (response['data'].hasOwnProperty('_embedded') &&
				response['data']['_embedded'].hasOwnProperty('participants')) {

				$.each(response['data']['_embedded']['participants'], function(index, jsonObj) {
					participants.push(new Participant(jsonObj));
				});

			}
			return participants;
		},
		function(response) {
			return $q.reject(response);
		});
};


ProgramRestFacade.prototype.saveParticipants = function(program) {
	var participantsUri = []
	$.each(program.participants, function(index, obj) {
		participantsUri.push(obj.getURI());
	})

	var jsonData = JSON.stringify({
		'participants': participantsUri
	});
	var uri = program.getURI();
	var config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	return this.$http.patch(uri, jsonData, config);
};

ProgramRestFacade.prototype.getEvents = function(program, page, size) {
	var uri = program.getURI() + '/events'

	var $q = this.$q;

	return this.list(uri, page, size).then(
		function(response) {
			var events = [];
			if (response['data'].hasOwnProperty('_embedded') &&
				response['data']['_embedded'].hasOwnProperty('active-events')) {

				$.each(response['data']['_embedded']['active-events'], function(index, jsonObj) {
					events.push(new ActiveEvent(jsonObj));
				});

			}
			return events;
		},
		function(response) {
			return $q.reject(response);
		});
};


ProgramRestFacade.prototype.saveEvents = function(program) {
	var eventsUri = []
	$.each(program.events, function(index, obj) {
		eventsUri.push(obj.getURI());
	})

	var jsonData = JSON.stringify({
		'events': eventsUri
	});
	var uri = program.getURI();
	var config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	return this.$http.patch(uri, jsonData, config);
};

ProgramRestFacade.prototype.getByObserver = function(observer, page, size) {
	var uri = EspimModelObject.REST_SERVICE + Program.REST_MODEL +
		"/search/findByObserversEmail?email=" + observer.email;

	var $q = this.$q;

	return this.list(uri, page, size).then(
		function(response) {
			var programs = [];
			if (response['data'].hasOwnProperty('_embedded') &&
				response['data']['_embedded'].hasOwnProperty('programs')) {

				$.each(response['data']['_embedded']['programs'], function(index, jsonObj) {
					programs.push(new Program(jsonObj));
				});

			}
			return programs;
		},
		function(response) {
			return $q.reject(response);
		});


}