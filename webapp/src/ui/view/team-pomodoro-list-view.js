const Backbone = require('backbone');
require('backbone.marionette');
const Moment = require('moment');
const ItemViewTemplate = require('../template/team-pomodoro-item-view-template.hbs');
const ListViewTemplate = require('../template/team-pomodoro-list-view-template.hbs');

const PomodoroItemView = Backbone.Marionette.View.extend({
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
    },
    serializeData: function() {
        let j = this.model.toJSON();
        j.today = Moment().format('MMM D');
        return j;
    }
});
