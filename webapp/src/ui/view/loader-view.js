var Backbone = require('backbone');
require('backbone.marionette');
var Template = require('../template/loader-view-template.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    modelEvents: {
        'change:isLoading': 'render'
    }
});
