var FirebaseConfig = require('./config/firebase');
var Firebase = require('./infra/firebase');
var Backbone = require('backbone');
require('backbone.marionette');
var Repository = require('./domain/repository');
var Pomodoro = require('./domain/pomodoro');
var PomodoroListView = require('./ui/view/pomodoro-list-view');
var TimerView = require('./ui/view/timer-view');
var TimerControlView = require('./ui/view/timer-control-view');


var app = new Backbone.Marionette.Application({
    region: 'body',
    onStart: function() {
        var RootView = Backbone.Marionette.View.extend({
            el: '#root',
            regions: {
                pomodoro: '#pomodoros',
                timerControl: '#timer .control'
            }
        });
        var rootView = new RootView();
        this.showView(rootView);
        rootView.showChildView('pomodoro', new PomodoroListView({
            collection: new Backbone.Collection([
                new Pomodoro(),
                new Pomodoro()
            ])
        }));

        Repository.getTimer()
            .then(timer => {
                var timerView = new TimerView(timer, 400, 400, '#timer .circle');
                timerView.render();

                rootView.showChildView('timerControl', new TimerControlView({model: timer}));
            });
    }
});

Repository.getUser()
    .then(user => {
        // signin
        if(user) {
            return Firebase.initialize(FirebaseConfig);
        } else {

        }
    })
    .then(() => {
        app.start();
    });

