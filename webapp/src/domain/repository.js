var Backbone = require('backbone');
var _ = require('underscore');
var Moment = require('moment');
var Firebase = require('../infra/firebase');
var API = require('../infra/api');
var User = require('./user');
var Timer = require('./timer');
var Pomodoro = require('./pomodoro');

class Repository {
    constructor() {
        this._user = null;
        this._timer = null;
        this._pomodoros = null;
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
            this._timer.set({user: this._user});
        } else {
            this._timer.set(timer);
        }
    }
    getPomodoros() {
        var promise = new Promise((resolve, reject) => {
            if(this._pomodoros) {
                resolve(this._pomodoros);
            } else {
                Firebase.listenPomodoros(this._user, pomodoros => {
                    this.updatePomodoros(pomodoros);
                    resolve(this._pomodoros);
                }, Moment(Moment().format('YYYY-MM-DD')).unix())
            }
        });

        return promise;
    }
    updatePomodoros(pomodoros) {
        let ps = this.pomodoroObjectToPomodoro(pomodoros);
        if(!this._pomodoros) {
            this._pomodoros = new (Backbone.Collection.extend({
                model: Pomodoro
            }))(ps);
        } else {
            this._pomodoros.set(ps);
        }
    }
    pomodoroObjectToPomodoro(pomodoros) {
        var pomodoroList = [];
        return _.map(pomodoros, (v, id) => {
            let j = {
                id: id,
                startAt: id
            };
            j = _.extend(j, v);
            return new Pomodoro(j);
        });
    }
}

module.exports = new Repository();
