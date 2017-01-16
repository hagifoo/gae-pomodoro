const Backbone = require('backbone');

module.exports = new (Backbone.Model.extend({
    defaults: {
        isLoading: true,
        num: 0
    },

    start: function() {
        let num = this.get('num');
        this.set('isLoading', true);
        this.set('num', num + 1);
    },

    end: function() {
        let num = this.get('num');
        if(num == 0) {
            return;
        }
        this.set('num', num - 1);
        if(num == 1) {
            this.set('isLoading', false);
        }
    }
}))();