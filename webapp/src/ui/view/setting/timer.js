const Backbone = require('backbone');
require('backbone.marionette');
require('backbone.stickit');
const Template = require('ui/template/setting/timer.hbs');

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
        }
    },
    modelEvents: {
        'change:startAt': 'render'
    },

    serializeData: function() {
        let j = this.model.toJSON();
        j.running = this.model.onPomodoro() || this.model.onBreak();

        return j;
    },

    onDomRefresh: function() {
        Materialize.updateTextFields();
        this.stickit();
    }
});
