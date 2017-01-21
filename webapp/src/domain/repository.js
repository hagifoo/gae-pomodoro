const Backbone = require('backbone');
const _ = require('underscore');
const Firebase = require('infra/firebase');
const API = require('infra/api/user');
const User = require('domain/user');
const Team = require('domain/team');

class Repository {
    constructor() {
        this._user = null;
        this._teams = null;
    }

    _userPath(userId) {
        return `/users/${userId}`;
    }

    _userTeamPath(userId) {
        return `/userTeams/${userId}`;
    }

    _teamPath(teamId) {
        return `/teams/${teamId}`;
    }

    _teamsPath() {
        return `/teams`;
    }

    getUser() {
        return new Promise((resolve, reject) => {
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
    }

    addTeam(user) {
        return new Promise((resolve, reject) => {
            let data = {
                name: 'new team',
                users: {
                    [user.id]: {
                        join: true
                    }
                }
            };
            let team = Firebase.push(this._teamsPath(), data);
            Firebase.update(this._userTeamPath(user.id), {[team.key]: true});
            resolve(team.key);
        });
    }

    getUserTeams(user) {
        return new Promise((resolve, reject) => {
            if(this._teams) {
                resolve(this._teams);
            } else {
                Firebase.listen(this._userTeamPath(user.id), teamJson => {
                    _.each(teamJson, (v, id) => {
                        this.getTeam(id)
                            .then(team => {
                                resolve(this._teams);
                            })
                    });
                });
            }
        });
    }

    getTeam(teamId) {
         return new Promise((resolve, reject) => {
            if(this._teams && this._teams.get(teamId)) {
                resolve(this._teams.get(teamId));
            } else {
                Firebase.listen(this._teamPath(teamId), teamJson => {
                    let t = this._j2t(teamId, teamJson);
                    if(!this._teams) {
                        this._teams = new (Backbone.Collection.extend({
                            model: Team
                        }))(t);
                    } else {
                        this._teams.add(t, {merge: true});
                    }
                    resolve(t);
                });
            }
        });
    }

    _j2t(id, data) {
        let j = _.extend(data, {id: id});
        return new Team(j);
    }

    getMembers(team) {
        return new Promise((resolve, reject) => {
            if(team._members) {
                resolve(team._members);
            } else {
                _.each(team.getUserIds(), userId => {
                    Firebase.listen(this._userPath(userId), userJson => {
                        let u = this._j2u(userId, userJson);
                        if(!team._members) {
                            team._members = new (Backbone.Collection.extend({
                                model: User
                            }))(u);
                        } else {
                            team._members.add(u, {merge: true});
                        }
                        resolve(team._members);
                    });
                });
            }
        });
    }

    _j2u(id, data) {
        let j = _.extend(data, {id: id});
        return new User(j);
    }
}

module.exports = new Repository();
