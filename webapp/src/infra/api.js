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
