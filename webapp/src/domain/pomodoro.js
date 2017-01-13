var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
    defaults: {
        startAt: null,
        duration: 0
    }
});
