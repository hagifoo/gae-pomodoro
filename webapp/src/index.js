const FirebaseConfig = require('config/firebase');
const Firebase = require('infra/firebase');
const Backbone = require('backbone');
require('backbone.marionette');
const Router = require('application/router');
const UserRepository = require('domain/repository/user');
const TeamRepository = require('domain/repository/team');
const Loader = require('infra/loader');
const SidenavView = require('ui/view/sidenav/index');
const LoaderView = require('ui/view/loader');
const UserView = require('ui/view/user/index');
const TitleView = require('ui/view/title');
const TeamMembersView = require('ui/view/team/member');
const TeamView = require('ui/view/team/index');


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
                title: '#title',
                sidenav: '#sidenav',
                members: '#members'
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
                    rootView.showChildView('title', new TitleView({model: user}));
                    rootView.getRegion('members').empty();
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

                            rootView.showChildView('title', new TitleView({model: team}));

                            team.getMembers()
                                .then(members => {
                                    rootView.showChildView('members', new TeamMembersView({
                                        collection: members,
                                        model: team}));
                                });
                        });
                });
        });

        Backbone.history.start();
    }
});

UserRepository.checkLogin()
    .then(user => {
        return Firebase.initialize(FirebaseConfig, user);
    })
    .then(() => {
        app.start()
    });

Loader.end();
