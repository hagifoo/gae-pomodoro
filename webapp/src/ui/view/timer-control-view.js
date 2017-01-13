var Backbone = require('backbone');
require('backbone.marionette');
var Moment = require('moment');
var Template = require('../template/timer-control-view-template.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    ui: {
        startButton: '.timer-start-button',
        stopButton: '.timer-stop-button'
    },
    events: {
        'click @ui.startButton': 'startTimer',
        'click @ui.stopButton': 'stopTimer'
    },
    modelEvents: {
        'change': 'render'
    },

    serializeData: function() {
        return {
            onPomodoro: this.model.onPomodoro()
        }
    },

    startTimer: function() {
        this.model.start();
    },

    stopTimer: function() {
        this.model.stop();
    }
});
