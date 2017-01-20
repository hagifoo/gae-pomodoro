const Backbone = require('backbone');
require('backbone.marionette');
require('backbone.stickit');
const Template = require('ui/template/team-setting-view-template.hbs');

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    events: {
        'click .regen-invitation-link': 'regen'
    },
    bindings: {
        '#teamName': {
            observe: 'name',
            set: function(attr, value) {
                return this.model.update({name: value});
            }
        },
        '#invitationLink': {
            observe: 'invitationLink',
            onGet: function(value) {
                let prot = window.location.protocol;
                let host = window.location.hostname;
                let port = window.location.port;
                if(port != 80) {
                    host = host + ':' + port;
                }
                return  `${prot}//${host}/invitation/${value}`
            }
        }
    },

    onDomRefresh: function() {
        this.stickit();
        Materialize.updateTextFields();
    },

    regen: function() {
        // from http://qiita.com/ryounagaoka/items/4736c225bdd86a74d59c
        // 生成する文字列の長さ
        let l = 64;

        // 生成する文字列に含める文字セット
        let c = 'abcdefghijklmnopqrstuvwxyz0123456789';

        let cl = c.length;
        let r = '';
        for(let i=0; i<l; i++){
            r += c[Math.floor(Math.random()*cl)];
        }

        this.model.update({invitationLink: r});
        Materialize.updateTextFields();
    }
});
