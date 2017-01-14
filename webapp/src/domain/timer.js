var Backbone = require('backbone');
var Moment = require('moment');
var Firebase = require('../infra/firebase');

module.exports = Backbone.Model.extend({
    defaults: {
        startAt: null,  // unix time without msec
        pomodoroTime: 1500, // sec
        breakTime: 300,  // sec
        isContinuous: false,
        restPomodoros: -1
    },

    start: function () {
        Firebase.updateTimer({startAt: Moment().unix()});
    },

    stop: function () {
        Firebase.updateTimer({startAt: 0});
    },

    setPomodoroTime: function (time) {
        Firebase.updateTimer({pomodoroTime: time});
    },

    setBreakTime: function (time) {
        Firebase.updateTimer({breakTime: time});
    },

    setContinuous: function (isContinuous) {
        Firebase.updateTimer({isContinuous: isContinuous});
    },

    onPomodoro: function(now = Moment()) {
        let startAt = this.get('startAt');

        if(!startAt || startAt > now.unix()) {
            return false;
        }

        if(now.unix() - startAt < this.get('pomodoroTime')) {
            return true;
        }

        return false;
    },

    remainingPomodoroTime: function(now = Moment()) {
        if(!this.onPomodoro(now)) {
            return 0;
        }

        return this.get('pomodoroTime') + this.get('startAt') - now.unix();
    }
});
