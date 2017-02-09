const _ = require('underscore');
const Backbone = require('backbone');
require('backbone.marionette');
const Moment = require('moment');
const ItemViewTemplate = require('../template/pomodoro-item-view-template.hbs');
const ListViewTemplate = require('../template/pomodoro-list-view-template.hbs');

const PomodoroItemView = Backbone.Marionette.View.extend({
    template: ItemViewTemplate,
    events: {
        'click .btn.good': 'feelGood',
        'click .btn.bad': 'feelBad'
    },
    modelEvents: {
        'change:feeling': 'render'
    },

    feelGood: function() {
        this.model.updateUserFeeling('good');
    },

    feelBad: function() {
        this.model.updateUserFeeling('bad');
    },

    serializeData: function() {
        let j = this.model.toJSON();
        let time = this.model.get('time');
        let startAt = Moment.unix(this.model.get('startAt'));
        let endAt = Moment(startAt);
        endAt.add(time, 's');

        j.startAt = startAt.format('HH:mm');
        j.endAt = endAt.format('HH:mm');
        j.timeMin = Math.floor(time / 60);
        j.setFeeling = j.feeling != 'good' && j.feeling != 'bad';
        j.feelingColor = this.getFeelingColor();

        return j;
    },

    getFeelingColor: function() {
        let f = this.model.get('feeling');
        if(f == 'good') {
            return 'teal lighten-2';
        }
        else if(f == 'bad') {
            return 'red lighten-2';
        }
        else {
            return 'grey';
        }
    }
});

module.exports = Backbone.Marionette.CompositeView.extend({
    childView: PomodoroItemView,
    emptyView: Backbone.Marionette.View.extend({
        template: _.template('<span class="grey-text">No pomodoros today.</span>')
    }),
    childViewContainer: '.pomodoro-list',
    template: ListViewTemplate,
    serializeData: function() {
        let j = this.model.toJSON();
        j.today = Moment().format('MMM D');
        return j;
    }
});
