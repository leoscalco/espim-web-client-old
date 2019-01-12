var API_KEY = 'AIzaSyBq3yWOu9pJkYSxHFNL9mKZIP4IWelpw9Ate';
var CLIEND_ID = '288369558415-uogknhr1lk4qvd95l52r90gnsnkdgr0h.apps.googleusercontent.com';
var ESPIM_USER_ID = "ESPIM_USER_NEW"


var EspimUser = function() {
  this.name = null;
  this.role = null;
  this.email = null;
  this.icon = null;
  this.registred = false;
  this.id = null;
};

var ControlAccessManager = function($http, $q) {
  console.log('ControlAcessManager - Constructor');

  this.$http = $http;
  this.$q = $q;
  this.localStorage = window.localStorage;
  this.user = localStorage.getItem(ESPIM_USER_ID);
  // this.message = "";
  if (this.user != null) {
    try {
        this.user = JSON.parse(this.user);
    }
    catch(err) {
      console.log("Error translating user: ", this.user);
      this.user = null;
    }
  }
  this.scopes = 'profile email';
  this.auth2; // The Sign-In object.
  this.loginCallBack = null;
}

ControlAccessManager.prototype.setLoginCallBack = function(callback) {
    this.loginCallBack = callback;
};


ControlAccessManager.prototype.hasUser = function() {
  console.log('ControlAcessManager.hasUser()');
  return this.user != null;
};


ControlAccessManager.prototype.isUserLogged = function() {
  console.log('ControlAcessManager.isUserLogged()');
  return (this.user != null && this.user.registred);
};

ControlAccessManager.prototype.initAuth = function() {
    console.log('ControlAcessManager.initAuth()');
    console.log()
    gapi.client.setApiKey(API_KEY);
    gapi.load('auth2', function() {
        gapi.auth2.init({
          client_id: CLIEND_ID,
          scope: this.scopes
        }).then($.proxy(function () {
          console.log('what is this', this);
          this.auth2 = gapi.auth2.getAuthInstance();
          this.auth2.isSignedIn.listen(this.updateSigninStatus);
        }), this);
    });
  };

ControlAccessManager.prototype.renderButton = function() {
    console.log('ControlAcessManager.renderButton()');

    var signinButton = $('my-signin2');
    gapi.signin2.render('my-signin2', {
        'scope': 'profile email',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onfailure': $.proxy(function(err) {
            console.log(err);
        }, this),
        'onsuccess' : $.proxy(function(algo) {
          this.onSignIn();
        }, this)
      });

  };

ControlAccessManager.prototype.onSignIn = function(isSignedIn){
    console.log("ControlAcessManager.onSignIn()");
    var user;

    this.auth2 = gapi.auth2.getAuthInstance();
    var profile =  this.auth2.currentUser.get().getBasicProfile();
    user = new EspimUser();

    user.name = profile.getName();
    user.email = profile.getEmail();
    user.icon = profile.getImageUrl();

    console.log(user.email);

    var rest = new ObserverRestFacade(this.$http, this.$q);

    var thisCa = this;

    rest.getByEmail(user.email).then(
      function(observer) {
        console.log(observer);
        thisCa.saveUserOnLocalStorage(user, observer);

        thisCa.loginCallBack(user, observer);

      }, function(error) {
        console.log('error login:', error);
        if (error.status = 404) {

          thisCa.saveUserOnLocalStorage(user, null);

          thisCa.loginCallBack(user, null);

        } else {
          console.log('error login:', error);
        }
      });
  };

ControlAccessManager.prototype.saveUserOnLocalStorage = function(user, observer) {
    if (observer) {
      user.name = observer.name;
      user.role = observer.role;
      console.log('observer id:', observer.id)
      user.id = observer.id;
      user.registred = true;
    }

    this.localStorage.setItem(ESPIM_USER_ID, JSON.stringify(user));

  };

ControlAccessManager.prototype.getLoggedObserver = function() {

    if (this.observer == null) {
      this.observer = new Observer();
      this.observer.id = this.user.id;
      this.observer.role = this.user.role;
      this.observer.name = this.user.name;
      this.observer.email = this.user.email;
    }

    return this.observer;
  };

ControlAccessManager.prototype.signIn = function() {
    auth2.signIn();
};

ControlAccessManager.prototype.login = function(observer) {
    this.saveUserOnLocalStorage(this.user, observer)
};

ControlAccessManager.prototype.logout = function() {
    console.log('ControlAcessManager.logout()');
    gapi.client.setApiKey(API_KEY);
    gapi.load('auth2', function() {
        gapi.auth2.init({
          client_id: CLIEND_ID,
          scope: this.scopes
        }).then($.proxy(function () {
          this.localStorage.removeItem(ESPIM_USER_ID);
          console.log (this.localStorage[ESPIM_USER_ID]);

          this.auth2 = gapi.auth2.getAuthInstance();

          this.auth2.signOut();

          this.auth2.disconnect();


          this.user = null;
          window.location.replace("index.html");
        }, this));
    });
};
