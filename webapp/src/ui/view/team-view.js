const Backbone = require('backbone');
require('backbone.marionette');
const Repository = require('../../domain/repository');
const PomodoroListView = require('./team-pomodoro-list-view');
const TimerView = require('./timer-view');
const TimerControlView = require('./timer-control-view');
const TimerSettingView = require('./timer-setting-view');
const Template = require('../template/team-view-template.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    regions: {
        pomodoro: '#pomodoros',
        timerCircle: '#timer .circle',
        timerControl: '#timer .control',
        timerSetting: '#timer-setting',
    },
    onRender: function() {
        Repository.getPomodoros()
            .then(pomodoros => {
                this.showChildView('pomodoro', new PomodoroListView({
                    model: this.model,
                    collection: pomodoros
                }));
            });

        Repository.getTeamTimer(this.model)
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