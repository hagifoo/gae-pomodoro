var $ = require('jquery');

class API {
    getUser() {
        var promise = new Promise(function(resolve, reject) {
            $.ajax({
                method: 'GET',
                url: '/api/user',
                dataType: 'json'
            }).done(function(data) {
                resolve(data);
            });
        });

        return promise;
    }
    startTimer() {
        var promise = new Promise(function(resolve, reject) {
            $.ajax({
                method: 'GET',
                url: '/api/user/timer/start',
                dataType: 'json'
            }).done(function(data) {
                resolve(data);
            });
        });

        return promise;
    }
    stopTimer() {
        var promise = new Promise(function(resolve, reject) {
            $.ajax({
                method: 'GET',
                url: '/api/user/timer/stop',
                dataType: 'json'
            }).done(function(data) {
                resolve(data);
            });
        });

        return promise;
    }
    getFirebaseToken() {
        var promise = new Promise(function(resolve, reject) {
            $.ajax({
                method: 'GET',
                url: '/api/token/firebase',
                dataType: 'json'
            }).done(function(data) {
                resolve(data);
            });
        });

        return promise;
    }
};

module.exports = new API();
