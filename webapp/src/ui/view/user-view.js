const Backbone = require('backbone');
require('backbone.marionette');
const PomodoroListView = require('ui/view/pomodoro-list-view');
const TimerView = require('ui/view/timer-view');
const TimerControlView = require('ui/view/timer-control-view');
const TimerSettingView = require('ui/view/timer-setting-view');
const Template = require('ui/template/user-view-template.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    regions: {
        pomodoro: '#pomodoros',
        timerCircle: '#timer .circle',
        timerControl: '#timer .control',
        timerSetting: '#timer-setting',
    },
    onRender: function() {
        this.model.getTodayPomodoros()
            .then(pomodoros => {
                this.showChildView('pomodoro', new PomodoroListView({
                    collection: pomodoros,
                    model: this.model
                }));
            });

        this.model.getTimer()
            .then(timer => {
                this.showChildView('timerCircle', new TimerView({
                    model: timer,
                    width: 400,
                    height: 400,
                    selector: '#timer .circle'
                }));
                this.showChildView('timerControl', new TimerControlView({model: timer}));
                this.showChildView('timerSetting', new TimerSettingView({model: timer}));
            });
    }
});