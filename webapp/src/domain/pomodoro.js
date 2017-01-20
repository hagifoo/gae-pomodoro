const Backbone = require('backbone');
const Firebase = require('infra/firebase');

module.exports = Backbone.Model.extend({
    defaults: {
        startAt: null,
        time: 0
    },

    update: function(data) {
        this.get('owner').updatePomodoro(this.id, data);
    },

    updateUserFeeling: function(feel) {
        const userId = this.get('owner').id;
        let path = `/userPomodoros/${userId}/${this.id}/`;
        Firebase.update(path, {feeling: feel});

        const teamId = this.get('team');
        if(teamId) {
            let path = `/teamPomodoros/${teamId}/${this.id}/attendee/${userId}`;
            Firebase.update(path, {feeling: feel});
        }
    },

    updateTeamFeeling: function(userId, feel) {
        let path = `/teamPomodoros/${this.get('owner').id}/${this.id}/attendee/${userId}`;
        Firebase.update(path, {feeling: feel});

        path = `/userPomodoros/${userId}/${this.id}/`;
        Firebase.update(path, {feeling: feel});
    },

    isAttend: function(userId) {
        return userId in this.get('attendee');
    },

    getFeeling: function(userId) {
        return this.get('attendee')[userId].feeling;
    }
});
