const Backbone = require('backbone');
require('backbone.marionette');
const Template = require('ui/template/loader.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    modelEvents: {
        'change:isLoading': 'render'
    }
});
