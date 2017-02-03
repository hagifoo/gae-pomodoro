const Backbone = require('backbone');
require('backbone.marionette');
require('backbone.stickit');
const Template = require('ui/template/slack-setting-view-template.hbs');
const ChannelTemplate = require('ui/template/slack-channel-template.hbs');
const API = require('infra/api/team');

const Channels = Backbone.Marionette.View.extend({
    template: ChannelTemplate,
    events: {
        'change #slack-channel-list': 'setChannel'
    },
    onDomRefresh: function() {
        $('select').material_select();
    },
    setChannel: function(evt) {
        const channelId = this.$('select option:selected').val();
        const channelName = this.$('select option:selected').text();
        return this.model.update({
            channelId: channelId,
            channelName: channelName
        });
    }
});

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    events: {
        'click .integrate-slack': 'integrateSlack',
        'click .select-slack-channel': 'getSlackChannels'
    },
    regions: {
        channels: '.slack-channel-list-wrapper'
    },
    bindings: {
        '#slack-team-name': {
            observe: 'name',
            attributes: [{
                name: 'class',
                onGet: function(value) {
                    return value ? 'valid' : 'invalid';
                }
            }]
        },
        '#slack-channel-name': {
            observe: 'channelName',
            attributes: [{
                name: 'class',
                onGet: function(value) {
                    return value ? 'valid' : 'invalid';
                }
            }]
        },
        '.select-slack-channel': {
            attributes: [{
                name: 'class',
                observe: 'name',
                onGet: function(value) {
                    return value ? '' : 'disabled';
                }
            }]
        },
        '#slack-mention': {
            observe: 'mention',
            set: function(attr, value) {
                return this.model.update({mention: value});
            },
            attributes: [{
                name: 'class',
                observe: 'name',
                onGet: function(value) {
                    return value ? '' : 'disabled';
                }
            }]
        }
    },

    onDomRefresh: function() {
        this.stickit();
        Materialize.updateTextFields();
    },

    integrateSlack: function() {
        this.model.integrate();
    },

    getSlackChannels: function() {
        this.model.getChannels()
            .then(channels => {
                this.model.set({channels: channels});
                this.showChildView('channels', new Channels({model: this.model}));
            });
    }
});
