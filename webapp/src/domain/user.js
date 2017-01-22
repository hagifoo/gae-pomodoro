const Backbone = require('backbone');
const _ = require('underscore');
const Firebase = require('infra/firebase');
const API = require('infra/api/user');
const Timer = require('domain/timer');
const UserPomodoro = require('domain/user-pomodoro');

module.exports = Backbone.Model.extend({
    defaults: {
        name: '',
        email: ''
    },
    timerClass: Timer,
    api: API,

    _timerPath: function() {
        return `/users/${this.id}/timer`;
    },

    /**
     * @return {Promise} - resolve Timer object
     */
    getTimer: function() {
        return new Promise((resolve, reject) => {
            if(this._timer) {
                resolve(this._timer);
            } else {
                Firebase.listen(this._timerPath(), timerJson => {
                    if(!this._timer) {
                        this._timer = new this.timerClass(timerJson);
                        this._timer.set({user: this});
                        this._timer.set({api: this.api});
                    } else {
                        this._timer.set(timerJson);
                    }
                    resolve(this._timer);
                })
            }
        });
    },

    updateTimer(data) {
        Firebase.update(this._timerPath(), data);
    },

    getTodayPomodoros() {
        return new Promise((resolve, reject) => {
            if(this._pomodoros) {
                resolve(this._pomodoros);
            } else {
                UserPomodoro.getTodays(this, pomodoros => {
                    if(!this._pomodoros) {
                        this._pomodoros = new (Backbone.Collection.extend({
                            model: UserPomodoro
                        }))(pomodoros);
                    } else {
                        this._pomodoros.set(pomodoros);
                    }

                    resolve(this._pomodoros);
                });
            }
        });
    },

    updatePomodoro(pomodoroId, data) {
        this._pomodoros.get(pomodoroId).update(data);
    }
});
