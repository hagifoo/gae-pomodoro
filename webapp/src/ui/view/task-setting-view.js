const Backbone = require('backbone');
require('backbone.marionette');
require('backbone.stickit');
const Template = require('ui/template/task-setting-view-template.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    bindings: {
        '#task': {
            observe: 'task',
            set: function(attr, value) {
                return this.model.update({task: value});
            }
        }
    },

    onDomRefresh: function() {
        this.stickit();
        Materialize.updateTextFields();
    }
});
