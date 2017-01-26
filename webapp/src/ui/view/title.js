const Backbone = require('backbone');
require('backbone.marionette');
const Template = require('ui/template/title.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template
});
