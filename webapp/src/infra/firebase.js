const API = require('./api');
const firebase = require('firebase');
const _ = require('underscore');
const Loader = require('./loader');

class Firebase {
    initialize(config) {
        Loader.start();
        firebase.initializeApp(config);

        var promise = new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged(user => {
                if (!user) {
                    API.getFirebaseToken()
                        .then(data => {
                            this.signInWithCustomToken(data.token)
                                .then(() => {
                                    Loader.end();
                                    resolve();
                                });
                        });
                } else {
                    Loader.end();
                    resolve();
                }
            });
        });

        return promise;
    }

    signOut(config) {
        firebase.initializeApp(config);
        return firebase.auth().signOut();
    }
    signInWithCustomToken(token) {
        return firebase.auth().signInWithCustomToken(token);
    }
    listenTimer(user, callback) {
        Loader.start();
        var ref = firebase.database().ref(`users/${user.id}/timer`);
        ref.on('value', function (snapshot) {
            Loader.end();
            callback(snapshot.val());
        });
    }
    updateTimer(target, user) {
        var updates = {};
        _.each(target, (v, k)=> {
            updates[`users/${user.id}/timer/${k}`] = v;
        });
        firebase.database().ref().update(updates);
    }
    listenPomodoros(user, callback, fromStartAt) {
        Loader.start();
        var ref = firebase.database().ref(`/pomodoros/${user.id}`);
        if(fromStartAt) {
            ref = ref.orderByKey().startAt('' + fromStartAt);
        }
        ref.on('value', function (snapshot) {
            Loader.end();
            callback(snapshot.val());
        });
    }
    updatePomodoros(target, user) {
        var updates = {};
        _.each(target, (v, k)=> {
            updates[`/pomodoros/${user.id}/${k}`] = v;
        });
        firebase.database().ref().update(updates);
    }
    addTeam(data) {
        return firebase.database().ref('/teams').push(data);
    }
    addUserTeam(user, teamKey) {
        return firebase.database().ref(`/userTeams/${user.id}`)
            .update({[teamKey]: true});
    }
    listenTeams(user, callback) {
        Loader.start();
        firebase.database().ref(`/userTeams/${user.id}`)
            .on('child_added', function (snapshot) {
                Loader.start();
                Loader.end();
                let teamId = snapshot.key;
                firebase.database().ref(`/teams/${teamId}`)
                    .on('value', function (snapshot) {
                        Loader.end();
                        callback(teamId, snapshot.val());
                    });
            });
    }
    updateTeam(target, team) {
        var updates = {};
        _.each(target, (v, k)=> {
            updates[`/teams/${team.id}/${k}`] = v;
        });
        firebase.database().ref().update(updates);
    }
};

module.exports = new Firebase();
