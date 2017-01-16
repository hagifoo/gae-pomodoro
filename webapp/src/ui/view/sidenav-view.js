var Backbone = require('backbone');
require('backbone.marionette');
var Template = require('../template/sidenav-view-template.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,

    onDomRefresh: function() {
        this.$('.sidenav-button').sideNav();
    }
});
