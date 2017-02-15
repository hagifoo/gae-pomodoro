/**
 * User が保持する Pomodoro クラス
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
        return `/userPomodoros/${this.get('owner').id}/${this.id}`;
    },

    updateUserFeeling: function(feel) {
        Firebase.update(this._path(), {feeling: feel});

        const teamId = this.get('team');
        if(teamId) {
            let path = `/teamPomodoros/${teamId}/${this.id}/attendee/${this.get('owner').id}`;
            Firebase.update(path, {feeling: feel});
        }
    },

}, {
    _path: function(owner) {
        return `/userPomodoros/${owner.id}`;
    }
});
