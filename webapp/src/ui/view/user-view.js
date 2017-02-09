const Backbone = require('backbone');
require('backbone.marionette');
const PomodoroListView = require('ui/view/pomodoro-list-view');
const TimerView = require('ui/view/timer-view');
const TimerControlView = require('ui/view/timer-control-view');
const TimerSettingView = require('ui/view/timer-setting-view');
const TaskSettingView = require('ui/view/task-setting-view');
const SlackSettingView = require('ui/view/slack-setting-view');
const PomodoroSettingView = require('ui/view/pomodoro-setting-view');
const Template = require('ui/template/user-view-template.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    regions: {
        pomodoro: '#pomodoros',
        pomodoroSetting: '#timer .setting',
        timerCircle: '#timer .circle',
        timerControl: '#timer .control',
        timerSetting: '#timer-setting',
        slackSetting: '#slack-setting',
        taskSetting: '#task-setting'
    },
    onRender: function() {
        this.showChildView('taskSetting', new TaskSettingView({model: this.model}));
        this.showChildView('pomodoroSetting', new PomodoroSettingView({model: this.model}));

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

        this.model.getSlack()
            .then(slack => {
                this.showChildView('slackSetting', new SlackSettingView({model: slack}));
            });
    },

    onDomRefresh: function() {
        $('.collapsible').collapsible();
    }
});