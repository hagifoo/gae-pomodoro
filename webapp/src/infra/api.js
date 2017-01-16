const $ = require('jquery');
const Loader = require('./loader');

class API {
    ajax(url, method) {
        Loader.start();
        const promise = new Promise(function(resolve, reject) {
            $.ajax({
                method: method,
                url: url,
                dataType: 'json'
            }).done(function(data) {
                resolve(data);
            });
        });
        promise.then(() => {
            Loader.end();
        });

        return promise;
    }
    getUser() {
        return this.ajax('/api/user', 'GET');
    }
    startTimer() {
        return this.ajax('/api/user/timer/start', 'GET');
    }
    stopTimer() {
        return this.ajax('/api/user/timer/stop', 'GET');
    }
    getFirebaseToken() {
        return this.ajax('/api/token/firebase', 'GET');
    }
}

module.exports = new API();
