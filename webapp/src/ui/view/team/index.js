const Backbone = require('backbone');
require('backbone.marionette');
const PomodoroListView = require('ui/view/team/pomodoro/list');
const TimerView = require('ui/view/timer/index');
const TimerControlView = require('ui/view/timer/control');
const TimerSettingView = require('ui/view/setting/timer');
const TeamSettingView = require('ui/view/setting/team');
const TaskSettingView = require('ui/view/setting/task');
const SlackSettingView = require('ui/view/setting/slack');
const PomodoroSettingView = require('ui/view/setting/pomodoro');
const Template = require('ui/template/team/index.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    regions: {
        pomodoro: '#pomodoros',
        pomodoroSetting: '#timer .setting',
        timerCircle: '#timer .circle',
        timerControl: '#timer .control',
        timerSetting: '#timer-setting',
        teamSetting: '#team-setting',
        slackSetting: '#slack-setting',
        taskSetting: '#task-setting'
    },
    onRender: function() {
        this.showChildView('teamSetting', new TeamSettingView({model: this.model}));
        this.showChildView('taskSetting', new TaskSettingView({model: this.model}));
        this.showChildView('pomodoroSetting', new PomodoroSettingView({model: this.model}));

        this.model.getTodayPomodoros()
            .then(pomodoros => {
                this.showChildView('pomodoro', new PomodoroListView({
                    model: this.model,
                    collection: pomodoros,
                    user: this.getOption('user')
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