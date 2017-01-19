const User = require('domain/user');
const Firebase = require('infra/firebase');

module.exports = User.extend({
    defaults: {
        name: ''
    },

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
    }
});