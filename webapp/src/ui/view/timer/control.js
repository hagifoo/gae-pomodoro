const Backbone = require('backbone');
require('backbone.marionette');
const Template = require('ui/template/timer/control.hbs');

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
