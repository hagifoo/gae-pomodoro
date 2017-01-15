var API = require('./api');
var firebase = require('firebase');
var _ = require('underscore');

class Firebase {
    initialize(config) {
        firebase.initializeApp(config);

        var promise = new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged(user => {
                if (!user) {
                    API.getFirebaseToken()
                        .then(data => {
                            this.signInWithCustomToken(data.token)
                                .then(() => resolve());
                        });
                } else {
                    resolve();
                }
            });
        });

        return promise;
    }

    singOut() {
        return firebase.auth().signOut();
    }
    signInWithCustomToken(token) {
        return firebase.auth().signInWithCustomToken(token);
    }
    addUser(user) {
        firebase.database().ref(`users/${user.id}`).
        set({
            name: user.name
        });
    }
    listenTimer(user, callback) {
        var ref = firebase.database().ref(`users/${user.id}/timer`);
        ref.on('value', function (snapshot) {
            callback(snapshot.val());
        });
    }
    updateTimer(target, user = {id: 111}) {
        var updates = {};
        _.each(target, (v, k)=> {
            updates[`users/${user.id}/timer/${k}`] = v;
        });
        firebase.database().ref().update(updates);
    }
    listenPomodoros(user, callback, fromStartAt) {
        var ref = firebase.database().ref(`users/${user.id}/pomodoros`);
        if(fromStartAt) {
            ref = ref.orderByKey().startAt('' + fromStartAt);
        }
        ref.on('value', function (snapshot) {
            callback(snapshot.val());
        });
    }
    updatePomodoros(target, user = {id: 111}) {
        var updates = {};
        _.each(target, (v, k)=> {
            updates[`users/${user.id}/pomodoros/${k}`] = v;
        });
        firebase.database().ref().update(updates);
    }
};

module.exports = new Firebase();
