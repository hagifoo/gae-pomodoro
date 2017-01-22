const FirebaseConfig = require('config/firebase');
const Firebase = require('infra/firebase');
const Backbone = require('backbone');
require('backbone.marionette');
const Router = require('application/router');
const UserRepository = require('domain/user-repository');
const TeamRepository = require('domain/team-repository');
const Loader = require('infra/loader');
const SidenavView = require('ui/view/sidenav-view');
const LoaderView = require('ui/view/loader-view');
const UserView = require('ui/view/user-view');
const TeamView = require('ui/view/team-view');


Loader.start();
const loader = new LoaderView({el: '#loader', model: Loader});
loader.render();

const app = new Backbone.Marionette.Application({
    region: 'body',
    onStart: function() {
        const RootView = Backbone.Marionette.View.extend({
            el: '#root',
            regions: {
                app: '#app',
                sidenav: '#sidenav',
            }
        });
        const rootView = new RootView();
        this.showView(rootView);

        UserRepository.getLoginUser()
            .then(user => {
                rootView.showChildView('sidenav', new SidenavView({
                    model: user
                }));
            });

        Router.on('user', () => {
            UserRepository.getLoginUser()
                .then(user => {
                    rootView.showChildView('app', new UserView({model: user}));
                });
        });

        Router.on('team', (teamId) => {
            UserRepository.getLoginUser()
                .then(user => {
                    TeamRepository.getTeam(teamId)
                        .then(team => {
                            rootView.showChildView('app',
                                new TeamView({
                                    model: team,
                                    user: user
                                }));
                        });
                });
        });

        Backbone.history.start();
    }
});

UserRepository.getLoginUser()
    .then(user => {
        return Firebase.initialize(FirebaseConfig, user);
    })
    .then(() => {
        app.start()
    });

Loader.end();
