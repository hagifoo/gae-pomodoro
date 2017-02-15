/**
 * Team が保持する Pomodoro クラス
 *
 *
 */
const Firebase = require('infra/firebase');
const Pomodoro = require('domain/entity/pomodoro');

module.exports = Pomodoro.extend({
    defaults: {
        owner: null,
        startAt: null,
        time: 0
    },
    _path: function() {
        return `/teamPomodoros/${this.get('owner').id}/${this.id}`;
    },

    updateTeamFeeling: function(userId, feel) {
        let path = `${this._path()}/attendee/${userId}`;
        Firebase.update(path, {feeling: feel});

        path = `/userPomodoros/${userId}/${this.id}/`;
        Firebase.update(path, {feeling: feel});
    },

    isAttend: function(userId) {
        return userId in this.get('attendee');
    },

    getFeeling: function(userId) {
        const user = this.get('attendee')[userId];
        if(!user){
            return null;
        }
        return user.feeling;
    }
}, {
    _path: function(owner) {
        return `/teamPomodoros/${owner.id}`;
    }
});
