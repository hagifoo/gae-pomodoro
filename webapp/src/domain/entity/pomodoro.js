/**
 * Pomodoro の抽象クラス
 *
 *
 */
const Backbone = require('backbone');
const _ = require('underscore');
const Moment = require('moment');
const Firebase = require('infra/firebase');

module.exports = Backbone.Model.extend({
    defaults: {
        owner: null,
        startAt: null,
        time: 0
    },
    _path: function() {
        return `/pomodoros/${this.get('owner').id}/${this.id}`;
    },

    update: function(data) {
        Firebase.update(this._path(), data);
    }
}, {
    getTodays: function(owner, callback) {
        Firebase.listenOrderByKey(this._path(owner), pomodorosJson => {
            callback(_.map(pomodorosJson, _.partial(this._j2p, owner), this));
        }, {startAt: '' + Moment(Moment().format('YYYY-MM-DD')).unix()})
    },

    _path: function(owner) {
        return `/pomodoros/${owner.id}`;
    },

    _j2p: function(owner, data, id) {
        let j = {
            id: id,
            startAt: id
        };
        j = _.extend(j, data);
        j.owner = owner;
        return new this(j);
    },
});
