const Backbone = require('backbone');
const _ = require('underscore');
const Firebase = require('infra/firebase');
const API = require('infra/api/user');
const User = require('domain/user');

class Repository {
    constructor() {
        this._loginUser = null;
        this._users = null;
    }

    _userPath(userId) {
        return `/users/${userId}`;
    }

    getLoginUser() {
        return new Promise((resolve, reject) => {
            if(this._loginUser) {
                resolve(this._loginUser);
            } else {
                API.getUser()
                    .then(user => {
                        this._loginUser = new User(user);
                        resolve(this._loginUser);
                    });
            }
        });
    }

    getUserById(userId) {
        return new Promise((resolve, reject) => {
            if(this._users && this._users.get(userId)) {
                resolve(this._users.get(userId));
                return;
            }

            Firebase.listen(this._userPath(userId), userJson => {
                if(!userJson) {
                    resolve(null);
                    return;
                }

                let u = this._j2u(userId, userJson);
                if(!this._users) {
                    this._users = new (Backbone.Collection.extend({
                        model: User
                    }))(u);
                } else {
                    this._users.add(u, {merge: true});
                }

                resolve(u);
            });
        });
    }

    _j2u(id, data) {
        let j = _.extend(data, {id: id});
        return new User(j);
    }
}

module.exports = new Repository();
