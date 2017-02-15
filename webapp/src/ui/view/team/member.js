const Backbone = require('backbone');
require('backbone.marionette');
const ItemViewTemplate = require('ui/template/team/member-item.hbs');

const MemberItemView = Backbone.Marionette.View.extend({
    template: ItemViewTemplate,
    tagName: 'span',
    onDomRefresh: function() {
        this.$('.tooltipped').tooltip({delay: 50});
    }
});

module.exports = Backbone.Marionette.CollectionView.extend({
    childView: MemberItemView
});
