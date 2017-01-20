const Backbone = require('backbone');
const _ = require('underscore');
const Moment = require('moment');
const Firebase = require('infra/firebase');
const API = require('infra/api/user');
const Timer = require('domain/timer');
const Pomodoro = require('domain/pomodoro');

module.exports = Backbone.Model.extend({
    defaults: {
        name: '',
        email: ''
    },
    timerClass: Timer,
    pomodoroClass: Pomodoro,
    api: API,

    _timerPath: function() {
        return `/users/${this.id}/timer`;
    },

    _pomodorosPath: function() {
        return `/userPomodoros/${this.id}`;
    },

    _pomodoroPath: function(id) {
        return `/userPomodoros/${this.id}/${id}`;
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
                Firebase.listenOrderByKey(this._pomodorosPath(), pomodorosJson => {
                    let ps = _.map(pomodorosJson, this._j2p);
                    if(!this._pomodoros) {
                        this._pomodoros = new (Backbone.Collection.extend({
                            model: this.pomodoroClass
                        }))(ps);
                    } else {
                        this._pomodoros.set(ps);
                    }

                    resolve(this._pomodoros);
                }, {startAt: '' + Moment(Moment().format('YYYY-MM-DD')).unix()})
            }
        });
    },

    _j2p(data, id) {
        let j = {
            id: id,
            startAt: id
        };
        j = _.extend(j, data);
        return new Pomodoro(j);
    },

    updatePomodoro(pomodoroId, data) {
        Firebase.update(this._pomodoroPath(pomodoroId), data);
    }
});
