const Backbone = require('backbone');

module.exports = new (Backbone.Router.extend({
    routes: {
        '': 'user',
        'teams/:teamId': 'team'
    },

    user: function() {
        this.trigger('user');
    },

    team: function(teamId) {
        this.trigger('team', teamId);
    }
}))();