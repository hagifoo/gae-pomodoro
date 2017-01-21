const $ = require('jquery');
const Loader = require('infra/loader');

class API {
    ajax(url, method) {
        Loader.start();
        const promise = new Promise(function(resolve, reject) {
            $.ajax({
                method: method,
                url: url,
                dataType: 'json',
                statusCode: {
                    401: function() {
                        location.href = '/signin/google';
                    }
                }
            }).done(function(data) {
                resolve(data);
            });
        });
        promise.then(() => {
            Loader.end();
        });

        return promise;
    }
    startTimer(id) {
        return this.ajax(`/api/team/timer/start/${id}`, 'GET');
    }
    stopTimer(id) {
        return this.ajax(`/api/team/timer/stop/${id}`, 'GET');
    }
}

module.exports = new API();
