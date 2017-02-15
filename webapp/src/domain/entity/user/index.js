const Backbone = require('backbone');
const _ = require('underscore');
const Firebase = require('infra/firebase');
const API = require('infra/api/user');
const Slack = require('domain/entity/slack');
const Timer = require('domain/entity/timer');
const UserPomodoro = require('domain/entity/user/pomodoro');

module.exports = Backbone.Model.extend({
    defaults: {
        name: '',
        email: ''
    },
    timerClass: Timer,
    api: API,

    _path: function() {
        return `/users/${this.id}`;
    },

    _timerPath: function() {
        return `/users/${this.id}/timer`;
    },

    _slackPath: function() {
        return `/users/${this.id}/slack`;
    },

    update: function(data) {
        return Firebase.update(this._path(), data);
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

    /**
     * @return {Promise} - resolve Slack object
     */
    getSlack: function() {
        return new Promise((resolve, reject) => {
            if(this._slack) {
                resolve(this._slack);
            } else {
                Firebase.listen(this._slackPath(), slackJson => {
                    if(!this._slack) {
                        this._slack = new Slack(slackJson);
                        this._slack.set({owner: this});
                        this._slack.set({api: this.api});
                    } else {
                        this._slack.set(slackJson);
                    }
                    resolve(this._slack);
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
