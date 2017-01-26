const Backbone = require('backbone');
require('backbone.marionette');
const PomodoroListView = require('ui/view/team-pomodoro-list-view');
const TimerView = require('ui/view/timer-view');
const TimerControlView = require('ui/view/timer-control-view');
const TimerSettingView = require('ui/view/timer-setting-view');
const TeamSettingView = require('ui/view/team-setting-view');
const SlackSettingView = require('ui/view/slack-setting-view');
const Template = require('ui/template/team-view-template.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    regions: {
        pomodoro: '#pomodoros',
        timerCircle: '#timer .circle',
        timerControl: '#timer .control',
        timerSetting: '#timer-setting',
        teamSetting: '#team-setting',
        slackSetting: '#slack-setting'
    },
    onRender: function() {
        this.showChildView('teamSetting', new TeamSettingView({model: this.model}));

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