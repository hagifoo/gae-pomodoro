const Backbone = require('backbone');
const _ = require('underscore');
const Firebase = require('infra/firebase');
const API = require('infra/api/team');
const Timer = require('domain/timer');
const TeamPomodoro = require('domain/team-pomodoro');
const UserRepository = require('domain/user-repository');

module.exports = Backbone.Model.extend({
    defaults: {
        name: ''
    },
    timerClass: Timer,
    api: API,

    _path: function() {
        return `/teams/${this.id}`;
    },


    _memberPath: function() {
        return `/teams/${this.id}/users`;
    },

    _timerPath: function() {
        return `/teams/${this.id}/timer`;
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

    updateTimer(data) {
        Firebase.update(this._timerPath(), data);
    },

    getTodayPomodoros() {
        return new Promise((resolve, reject) => {
            if(this._pomodoros) {
                resolve(this._pomodoros);
            } else {
                TeamPomodoro.getTodays(this, pomodoros => {
                    if(!this._pomodoros) {
                        this._pomodoros = new (Backbone.Collection.extend({
                            model: TeamPomodoro
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
    },

    getMembers: function() {
        return new Promise((resolve, reject) => {
            if(this._members) {
                resolve(this._members);
            } else {
                Firebase.listen(this._memberPath(), memberIds => {
                    _.each(memberIds, (v, userId) => {
                        if(this._members && this._members.get(userId)) {
                            resolve(this._members);
                            return;
                        }

                        UserRepository.getUserById(userId)
                            .then(user => {
                                if(!this._members) {
                                    this._members = new Backbone.Collection(user);
                                } else {
                                    this._members.add(user, {merge: true});
                                }
                                resolve(this._members);
                            });
                    }, this);
                });
            }
        });
    }
});