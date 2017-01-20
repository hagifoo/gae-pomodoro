const _ = require('underscore');
const User = require('domain/user');
const Firebase = require('infra/firebase');
const API = require('infra/api/team');

module.exports = User.extend({
    defaults: {
        name: ''
    },
    api: API,

    _path: function() {
        return `/teams/${this.id}`;
    },

    _timerPath: function() {
        return `/teams/${this.id}/timer`;
    },

    _pomodorosPath: function() {
        return `/teamPomodoros/${this.id}`;
    },

    _pomodoroPath: function(id) {
        return `/teamPomodoros/${this.id}/${id}`;
    },

    update: function(data) {
        return Firebase.update(this._path(), data);
    },

    getUserIds: function() {
        return _.keys(this.get('users'));
    }
});