var Backbone = require('backbone');
require('backbone.marionette');
var Moment = require('moment');
var ItemViewTemplate = require('../template/team-pomodoro-item-view-template.hbs');
var ListViewTemplate = require('../template/team-pomodoro-list-view-template.hbs');

var PomodoroItemView = Backbone.Marionette.View.extend({
    template: ItemViewTemplate,

    serializeData: function() {
        let time = this.model.get('time');
        let startAt = Moment.unix(this.model.get('startAt'));
        let endAt = Moment(startAt);
        endAt.add(time, 's');
        return {
            startAt: startAt.format('HH:mm'),
            endAt: endAt.format('HH:mm'),
            timeMin: Math.floor(time / 60)
        };
    }
});

module.exports = Backbone.Marionette.CompositeView.extend({
    childView: PomodoroItemView,
    childViewContainer: '.pomodoro-list',
    template: ListViewTemplate,
    modelEvents: {
        'change:name': 'render'
    }
});
