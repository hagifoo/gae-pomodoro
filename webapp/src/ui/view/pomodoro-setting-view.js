const _ = require('underscore');
const Backbone = require('backbone');
require('backbone.marionette');
require('backbone.stickit');
const Template = require('ui/template/pomodoro-setting-view-template.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    bindings: {
        '#scope': {
            observe: 'task',
            selectOptions: {
                collection: function () {
                    const task = this.model.get('task');
                    if(!task) {
                        return {};
                    }
                    return _.map(task.split('\n'),
                        t => {
                            return {label: t, value: t};
                        });
                },
                defaultOption: {label: '', value: ''}
            },
            onGet: function() {
                return this.model.get('scope');
            },
            set: function(attr, value) {
                return this.model.update({scope: value});
            }
        }
    },
    modelEvents: {
        'change:task': 'render'
    },

    onDomRefresh: function() {
        this.stickit();
        $('select').material_select();
    }
});
