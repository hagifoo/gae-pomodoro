const Backbone = require('backbone');
require('backbone.marionette');
const Repository = require('../../domain/repository');
const PomodoroListView = require('./pomodoro-list-view');
const TimerView = require('./timer-view');
const TimerControlView = require('./timer-control-view');
const TimerSettingView = require('./timer-setting-view');
const Template = require('../template/user-view-template.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    regions: {
        pomodoro: '#pomodoros',
        timerControl: '#timer .control',
        timerSetting: '#timer-setting',
    },
    onRender: function() {
        Repository.getPomodoros()
            .then(pomodoros => {
                this.showChildView('pomodoro', new PomodoroListView({
                    collection: pomodoros
                }));
            });

        Repository.getTimer()
            .then(timer => {
                const timerView = new TimerView(timer, 400, 400, '#timer .circle');
                timerView.render();

                this.showChildView('timerControl', new TimerControlView({model: timer}));
                this.showChildView('timerSetting', new TimerSettingView({model: timer}));
            });
    }
});