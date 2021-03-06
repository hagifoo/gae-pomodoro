const Backbone = require('backbone');
require('backbone.marionette');
const Repository = require('domain/repository/team');
const Router = require('application/router');
const TeamItemViewTemplate = require('ui/template/sidenav/team-item.hbs');
const Template = require('ui/template/sidenav/index.hbs');

const TeamItemView = Backbone.Marionette.View.extend({
    template: TeamItemViewTemplate,
    tagName: 'li',
    modelEvents: {
        'change': 'render'
    }
});

const TeamListView = Backbone.Marionette.CollectionView.extend({
    childView: TeamItemView
});

module.exports = Backbone.Marionette.View.extend({
    template: Template,
    ui: {
        addTeamButton: '.btn.add-team'
    },
    events: {
        'click @ui.addTeamButton': 'addTeam',
        'click .teams': 'closeSidenav',
        'click .userView': 'closeSidenav'
    },
    regions: {
        teams: '.teams'
    },

    onRender: function() {
        Repository.getTeamsByUserId(this.model.id)
            .then(teams => {
                this.showChildView('teams', new TeamListView({collection: teams}));
            });
    },

    onDomRefresh: function() {
        this.$('.sidenav-button').sideNav();
    },

    addTeam: function() {
        Repository.addTeam(this.model)
            .then(teamId => {
                this.closeSidenav();
                Router.navigate(`teams/${teamId}`, {trigger: true});
            });
    },

    closeSidenav: function() {
        this.$('.sidenav-button').sideNav('hide');
    }
});
