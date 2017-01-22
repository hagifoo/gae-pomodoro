const Backbone = require('backbone');
const _ = require('underscore');
const Firebase = require('infra/firebase');
const Team = require('domain/team');

class Repository {
    constructor() {
        this._teams = null;
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

    getTeamsByUserId(userId) {
        return new Promise((resolve, reject) => {
            if(this._teams) {
                resolve(this._teams);
            } else {
                Firebase.listen(this._userTeamPath(userId), teamJson => {
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
}

module.exports = new Repository();
