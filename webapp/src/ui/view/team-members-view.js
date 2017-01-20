const Backbone = require('backbone');
require('backbone.marionette');
const ItemViewTemplate = require('ui/template/member-item-view-template.hbs');
const ListViewTemplate = require('ui/template/member-list-view-template.hbs');

const MemberItemView = Backbone.Marionette.View.extend({
    template: ItemViewTemplate,
    tagName: 'span'
});

module.exports = Backbone.Marionette.CompositeView.extend({
    childView: MemberItemView,
    childViewContainer: '.member-list',
    template: ListViewTemplate
});
