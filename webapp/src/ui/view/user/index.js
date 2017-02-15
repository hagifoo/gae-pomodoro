const Backbone = require('backbone');
require('backbone.marionette');
const PomodoroListView = require('ui/view/user/pomodoro/list');
const TimerView = require('ui/view/timer/index');
const TimerControlView = require('ui/view/timer/control');
const TimerSettingView = require('ui/view/setting/timer');
const TaskSettingView = require('ui/view/setting/task');
const SlackSettingView = require('ui/view/setting/slack');
const PomodoroSettingView = require('ui/view/setting/pomodoro');
const Template = require('ui/template/user/index.hbs');

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