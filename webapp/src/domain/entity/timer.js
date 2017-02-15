const Backbone = require('backbone');
const Moment = require('moment');

module.exports = Backbone.Model.extend({
    defaults: {
        user: null,
        startAt: null,  // unix time without msec
        pomodoroTime: 1500, // sec
        breakTime: 300  // sec
    },

    start: function () {
        this.get('api').startTimer(this.get('user').id);
    },

    stop: function () {
        this.get('api').stopTimer(this.get('user').id);
    },

    setPomodoroTime: function (time) {
        this.get('user').updateTimer({pomodoroTime: time});
    },

    setBreakTime: function (time) {
        this.get('user').updateTimer({breakTime: time});
    },

    getTotalTime: function() {
        return this.get('pomodoroTime') + this.get('breakTime');
    },

    onPomodoro: function(now = Moment()) {
        let startAt = this.get('startAt');

        if(!startAt || startAt > now.unix()) {
            return false;
        }

        return now.unix() - startAt < this.get('pomodoroTime');
    },

    remainingPomodoroTime: function(now = Moment()) {
        if(!this.onPomodoro(now)) {
            return 0;
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

        return now.unix() - startAt <
            this.get('pomodoroTime') + this.get('breakTime');
    },

    remainingBreakTime: function(now = Moment()) {
        if(!this.onBreak(now)) {
            return 0;
        }

        return this.get('pomodoroTime') + this.get('breakTime')
            + this.get('startAt') - now.unix();
    }
});
