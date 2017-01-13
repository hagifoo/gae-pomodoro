var Backbone = require('backbone');
require('backbone.marionette');
var Template = require('../template/pomodoro-item-view-template.hbs');

var PomodoroItemView = Backbone.Marionette.View.extend({
    template: Template
});

module.exports = Backbone.Marionette.CollectionView.extend({
    childView: PomodoroItemView
});
