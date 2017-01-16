var FirebaseConfig = require('./config/firebase');
var Firebase = require('./infra/firebase');
var Backbone = require('backbone');
require('backbone.marionette');
var Repository = require('./domain/repository');
var Loader = require('./infra/loader');
var PomodoroListView = require('./ui/view/pomodoro-list-view');
var TimerView = require('./ui/view/timer-view');
var TimerControlView = require('./ui/view/timer-control-view');
var TimerSettingView = require('./ui/view/timer-setting-view');
var SidenavView = require('./ui/view/sidenav-view');
var LoaderView = require('./ui/view/loader-view');


Loader.start();
const loader = new LoaderView({el: '#loader', model: Loader});
loader.render();

var app = new Backbone.Marionette.Application({
    region: 'body',
    onStart: function() {
        var RootView = Backbone.Marionette.View.extend({
            el: '#root',
            regions: {
                pomodoro: '#pomodoros',
                timerControl: '#timer .control',
                timerSetting: '#timer-setting',
                sidenav: '#sidenav',
            }
        });
        var rootView = new RootView();
        this.showView(rootView);

        Repository.getUser()
            .then(user => {
                rootView.showChildView('sidenav', new SidenavView({
                    model: user
                }))
            });

        Repository.getPomodoros()
            .then(pomodoros => {
                rootView.showChildView('pomodoro', new PomodoroListView({
                    collection: pomodoros
                }));
            });

        Repository.getTimer()
            .then(timer => {
                var timerView = new TimerView(timer, 400, 400, '#timer .circle');
                timerView.render();

                rootView.showChildView('timerControl', new TimerControlView({model: timer}));
                rootView.showChildView('timerSetting', new TimerSettingView({model: timer}));
            });
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
