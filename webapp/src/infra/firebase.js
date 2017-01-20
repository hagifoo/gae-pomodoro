const firebase = require('firebase');
const _ = require('underscore');
const API = require('infra/api/user');
const Loader = require('infra/loader');

class Firebase {
    initialize(config) {
        Loader.start();
        firebase.initializeApp(config);

        return new Promise((resolve, reject) => {
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
    }

    signOut(config) {
        firebase.initializeApp(config);
        return firebase.auth().signOut();
    }

    signInWithCustomToken(token) {
        return firebase.auth().signInWithCustomToken(token);
    }

    listen(path, callback, options) {
        Loader.start();
        let ref = firebase.database().ref(path);
        ref.on('value', function (snapshot) {
                Loader.end();
                callback(snapshot.val());
            });
    }

    listenOrderByKey(path, callback, options) {
        Loader.start();
        let ref = firebase.database().ref(path).orderByKey();
        if(options.startAt) {
            ref = ref.startAt(options.startAt);
        }
        ref.on('value', function (snapshot) {
            Loader.end();
            callback(snapshot.val());
        });
    }

    update(path, data) {
        let updates = {};
        _.each(data, (v, k)=> {
            updates[`${path}/${k}`] = v;
        });
        firebase.database().ref().update(updates);
    }

    push(path, data) {
        return firebase.database().ref(path).push(data);
    }
}

module.exports = new Firebase();
