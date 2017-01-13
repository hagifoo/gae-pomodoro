var API = require('./infra/api');
var FirebaseConfig = require('./config/firebase');
var Firebase = require('./infra/firebase');
var Backbone = require('backbone');
require('backbone.marionette');
var Pomodoro = require('./domain/pomodoro');
var PomodoroListView = require('./ui/view/pomodoro-list-view');
var TimerView = require('./ui/view/timer-view');

var App = Backbone.Marionette.Application.extend({
    region: '#pomo',

    onStart: function() {
        this.showView(new PomodoroListView({
            collection: new Backbone.Collection([
                new Pomodoro(),
                new Pomodoro()
            ])
        }));

        firebase.fetchTimer({id: 111})
            .then(timer => {
                var timerView = new TimerView(timer, 400, 400, '#timer');
                timerView.render();
            });
    }
});

var app = new App();
var firebase = new Firebase(FirebaseConfig);

API.getUser()
    .then(user => {
        return firebase.initialize();
    })
    .then(() => {
        app.start();
    });

