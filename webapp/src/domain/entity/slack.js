const Backbone = require('backbone');
const Firebase = require('infra/firebase');

module.exports = Backbone.Model.extend({
    defaults: {
        owner: null,
        api: null,  // Team Pomodoro API to use
        name: null,  // slack team name
        domain: null,  // slack team domain
        channelName: null, // selected channel name
        channelId: null,  // selected channel ID
        notify: false,
        userMention: false,
        members: null
    },

    _path: function() {
        return this.get('owner')._path() + '/slack';
    },

    update: function(data) {
        return Firebase.update(this._path(), data);
    },

    integrate: function() {
        this.get('api').integrateSlack(this.get('owner').id);
    },

    getChannels: function() {
        return this.get('api').getSlackChannels(this.get('owner').id);
    }
});
