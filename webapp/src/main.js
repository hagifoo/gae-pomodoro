var FirebaseConfig = require('./config/firebase');
var Firebase = require('./infra/firebase');
var Backbone = require('backbone');
require('backbone.marionette');
var Router = require('./application/router');
var Repository = require('./domain/repository');
var Loader = require('./infra/loader');
var SidenavView = require('./ui/view/sidenav-view');
var LoaderView = require('./ui/view/loader-view');
var UserView = require('./ui/view/user-view');
var TeamView = require('./ui/view/team-view');


Loader.start();
const loader = new LoaderView({el: '#loader', model: Loader});
loader.render();

var app = new Backbone.Marionette.Application({
    region: 'body',
    onStart: function() {
        var RootView = Backbone.Marionette.View.extend({
            el: '#root',
            regions: {
                app: '#app',
                sidenav: '#sidenav',
            }
        });
        var rootView = new RootView();
        this.showView(rootView);

        Repository.getUser()
            .then(user => {
                rootView.showChildView('sidenav', new SidenavView({
                    model: user
                }));
            });

        Router.on('user', () => {
            rootView.showChildView('app', new UserView());
        });

        Router.on('team', (teamId) => {
            Repository.getTeams()
                .then(teams => {
                    rootView.showChildView('app', new TeamView({model: teams.get(teamId)}));
                });
        });

        Backbone.history.start();
    }
});

Repository.getUser()
    .then(user => {
        // signin
        if(user.id) {
            return Firebase.initialize(FirebaseConfig);
        } else {
            Firebase.signOut(FirebaseConfig)
                .then(() => {
                    location.href = '/signin/google';
                });
        }
    })
    .then(() => {
        app.start()
    });

Loader.end();
