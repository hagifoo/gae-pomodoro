const Backbone = require('backbone');
const _ = require('underscore');
const Moment = require('moment');
const Firebase = require('../infra/firebase');
const API = require('../infra/api');
const User = require('./user');
const Timer = require('./timer');
const Pomodoro = require('./pomodoro');
const Team = require('./team');

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
    addTeam() {
        var promise = new Promise((resolve, reject) => {
            let data = {
                name: 'new team',
                users: {
                    [this._user.id]: {
                        join: true
                    }
                }
            };
            let team = Firebase.addTeam(data);
            Firebase.addUserTeam(this._user, team.key)
                .then(() => {
                    resolve(team.key);
                });
        });

        return promise;
    }
    getTeams() {
        var promise = new Promise((resolve, reject) => {
            if(this._teams) {
                resolve(this._teams);
            } else {
                Firebase.listenTeams(this._user, (teamId, teamJson) => {
                    this.updateTeams(teamId, teamJson);
                    resolve(this._teams);
                });
            }
        });

        return promise;
    }
    updateTeams(teamId, teamJson) {
        let t = this.teamObjectToTeam(teamId, teamJson);
        if(!this._teams) {
            this._teams = new (Backbone.Collection.extend({
                model: Team
            }))(t);
        } else {
            this._teams.add(t);
        }
    }
    teamObjectToTeam(teamId, teamJson) {
        let j = _.extend(teamJson, {id: teamId});
        return new Team(j);
    }
}

module.exports = new Repository();
