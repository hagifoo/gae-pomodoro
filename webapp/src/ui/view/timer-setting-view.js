var Backbone = require('backbone');
require('backbone.marionette');
require('backbone.stickit');
var Moment = require('moment');
var Template = require('../template/timer-setting-view-template.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    ui: {
    },
    events: {
        'click @ui.pomodoroTime': 'updatePomodoroTime',
        'click @ui.breakTime': 'updateBreakTime'
    },
    bindings: {
        '#pomodoroTime': {
            observe: 'pomodoroTime',
            onGet: function (value) {
                return Math.floor(value / 60);
            },
            set: function(attr, value) {
                return this.model.setPomodoroTime(+value * 60);
            }
        },
        '#breakTime': {
            observe: 'breakTime',
            onGet: function (value) {
                return Math.floor(value / 60);
            },
            set: function(attr, value) {
                return this.model.setBreakTime(+value * 60);
            }
        },
        '#isContinuous': {
            observe: 'isContinuous',
            set: function(attr, value) {
                return this.model.setContinuous(value);
            }
        }
    },

    onDomRefresh: function() {
        Materialize.updateTextFields();
        this.stickit();
    }
});
