var Backbone = require('backbone');
var Firebase = require('../infra/firebase');
var API = require('../infra/api');
var User = require('./user');
var Timer = require('./timer');
var Pomodoro = require('./pomodoro');

class Repository {
    constructor() {
        this._user = null;
        this._timer = null;
        this._pomodoros = new Backbone.Collection();
    }
    getUser() {
        var promise = new Promise((resolve, reject) => {
            if(this._user) {
                resolve(this._user);
            } else {
                API.getUser()
                    .then(user => {
                        this._user = new User(user);
                        resolve(this._user);
                    });
            }
        });

        return promise;
    }
    getTimer() {
        var promise = new Promise((resolve, reject) => {
            if(this._timer) {
                resolve(this._timer);
            } else {
                Firebase.listenTimer(this._user, timer => {
                    this.updateTimer(timer);
                    resolve(this._timer);
                })
            }
        });

        return promise;
    }
    updateTimer(timer) {
        if(!this._timer) {
            this._timer = new Timer(timer);
        } else {
            this._timer.set(timer);
        }
    }
}

module.exports = new Repository();
