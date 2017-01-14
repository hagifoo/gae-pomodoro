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

    getTotalTime: function() {
        return this.get('pomodoroTime') + this.get('breakTime');
    },

    onPomodoro: function(now = Moment()) {
        let startAt = this.get('startAt');

        if(!startAt || startAt > now.unix()) {
            return false;
        }

        if(now.unix() - startAt < this.get('pomodoroTime')) {
            return true;
        }

        if(this.get('isContinuous')) {
            if((now.unix() - startAt) % (this.getTotalTime()) < this.get('pomodoroTime')) {
                return true;
            }
        }

        return false;
    },

    remainingPomodoroTime: function(now = Moment()) {
        if(!this.onPomodoro(now)) {
            return 0;
        }

        if(this.get('isContinuous')) {
            return this.get('pomodoroTime') - (now.unix() - this.get('startAt')) % this.getTotalTime();
        }
        return this.get('pomodoroTime') + this.get('startAt') - now.unix();
    },

    onBreak: function(now = Moment()) {
        if(this.onPomodoro(now)) {
            return false;
        }

        let startAt = this.get('startAt');

        if(!startAt || startAt > now.unix()) {
            return false;
        }

        if(now.unix() - startAt < this.get('pomodoroTime') + this.get('breakTime')) {
            return true;
        }
        if(this.get('isContinuous')) {
            return true;
        }

        return false;
    },

    remainingBreakTime: function(now = Moment()) {
        if(!this.onBreak(now)) {
            return 0;
        }

        if(this.get('isContinuous')) {
            return this.get('pomodoroTime') + this.get('breakTime') - (now.unix() - this.get('startAt')) % this.getTotalTime();
        }
        return this.get('pomodoroTime') + this.get('breakTime') + this.get('startAt') - now.unix();
    }
});
