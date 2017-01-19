const Backbone = require('backbone');
require('backbone.marionette');
require('backbone.stickit');
const Template = require('ui/template/team-setting-view-template.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    bindings: {
        '#teamName': {
            observe: 'name',
            set: function(attr, value) {
                return this.model.update({name: value});
            }
        }
    },

    onDomRefresh: function() {
        Materialize.updateTextFields();
        this.stickit();
    }
});
