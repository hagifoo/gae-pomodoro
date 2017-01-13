var API = require('./api');
var firebase = require('firebase');

class Firebase {
    constructor(config) {
        this._config = config;
    }

    initialize() {
        firebase.initializeApp(this._config);

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
    fetchTimer(user) {
        var ref = firebase.database().ref(`users/${user.id}/timer`);
        var promise = new Promise((resolve, reject) => {
            ref.on('value', function (snapshot) {
                resolve(snapshot.val());
            });
        });

        return promise;
    }
};

module.exports = Firebase;
