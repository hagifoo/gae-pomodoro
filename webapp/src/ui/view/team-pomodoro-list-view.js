const _ = require('underscore');
const Backbone = require('backbone');
require('backbone.marionette');
const Moment = require('moment');
const FeelingViewTemplate = require('ui/template/team-pomodoro-feeling-view-template.hbs');
const ItemViewTemplate = require('ui/template/team-pomodoro-item-view-template.hbs');
const ListViewTemplate = require('ui/template/team-pomodoro-list-view-template.hbs');

const FeelingView = Backbone.Marionette.View.extend({
    template: FeelingViewTemplate,
    tagName: 'span',
    serializeData: function() {
        let j = this.model.toJSON();
        j.feelingColor = this.getFeelingColor();

        return j;
    },
    getFeelingColor: function() {
        let f = this.getOption('pomodoro').getFeeling(this.model.id);
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

const FeelingListView = Backbone.Marionette.CollectionView.extend({
    childView: FeelingView,
    childViewOptions: function() {
        return {
            pomodoro: this.getOption('pomodoro')
        }
    },
    filter: function(child, index, collection) {
        return this.getOption('pomodoro').isAttend(child.id);
    }
});

const PomodoroItemView = Backbone.Marionette.View.extend({
    template: ItemViewTemplate,
    events: {
        'click .btn.good': 'feelGood',
        'click .btn.bad': 'feelBad'
    },
    modelEvents: {
        'change:attendee': 'render'
    },
    regions: {
        feelings: '.user-feelings'
    },
    childViewOptions: function() {
        return {
            user: this.getOption('user')
        }
    },

    feelGood: function() {
        this.model.updateTeamFeeling(this.getOption('user').id, 'good');
    },

    feelBad: function() {
        this.model.updateTeamFeeling(this.getOption('user').id, 'bad');
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
        j.setFeeling = this.model.getFeeling(this.getOption('user').id) == 'none';

        return j;
    },

    onRender: function() {
         this.getOption('team').getMembers()
             .then(members => {
                 this.showChildView('feelings', new FeelingListView({
                     collection: members,
                     pomodoro: this.model
                 }))
             });
    }

});

module.exports = Backbone.Marionette.CompositeView.extend({
    childView: PomodoroItemView,
    emptyView: Backbone.Marionette.View.extend({
        template: _.template('<span class="grey-text">No pomodoros today.</span>')
    }),
    childViewContainer: '.pomodoro-list',
    template: ListViewTemplate,
    modelEvents: {
        'change:name': 'render'
    },
    childViewOptions: function() {
        return {
            team: this.model,
            user: this.getOption('user')
        }
    },
    serializeData: function() {
        let j = this.model.toJSON();
        j.today = Moment().format('MMM D');
        return j;
    }
});
