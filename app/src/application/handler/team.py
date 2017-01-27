"""
This module provides token handling
"""

from application.handler import BaseHandler, JsonHandler, signin_user_only
from domain import Team
import infra.firebase as firebase
import error


class InvitationHandler(BaseHandler):
    def get(self, invitation_code):
        team = firebase.fetch_team_by_invitation_code(invitation_code)
        if team is None:
            raise error.NotFoundException('Invitation code is invalid.')

        team_id = team.keys()[0]
        if self.user is None:
            self.session['origin_url'] = self.request.url
            self.redirect('/signin/google')
            return

        firebase.add_team_user(team_id, self.user.id)
        self.redirect('/#teams/{}'.format(team_id))


class SlackChannelsHandler(JsonHandler):
    @signin_user_only
    def get(self, team_id):
        team = Team.fetch(team_id)
        return team.slack.get_channels()


class TimerStartHandler(JsonHandler):
    @signin_user_only
    def get(self, team_id):
        team = Team.fetch(team_id)
        # if not timer.is_member(self.user.id):
        #     raise RuntimeError()

        if team.slack.is_notify():
            team.slack.notify_start()
        return team.timer.start()


class TimerStartTaskHandler(JsonHandler):
    def post(self):
        team_id = self.request.get('id')
        start_at = int(self.request.get('start_at'), 0)
        if not team_id or not start_at:
            return

        team = Team.fetch(team_id)
        if not team:
            return

        timer = team.timer
        if not timer:
            return

        if timer.start_at == 0 or timer.start_at != start_at:
            return

        if timer.is_continuous:
            if team.slack.is_notify():
                team.slack.notify_start()

            return timer.start(start_at=timer.break_end_at)
        else:
            return {}


class TimerStopHandler(JsonHandler):
    @signin_user_only
    def get(self, team_id):
        team = Team.fetch(team_id)
        # if not timer.is_member(self.user.id):
        #     raise RuntimeError()

        if team.slack.is_notify():
            team.slack.notify_stop()
        return team.timer.stop()


class TimerStopTaskHandler(JsonHandler):
    def post(self):
        team_id = self.request.get('id')
        if not team_id:
            return

        team = Team.fetch(team_id)
        return team.timer.stop()


class TimerEndTaskHandler(JsonHandler):
    def post(self):
        team_id = self.request.get('id')
        if not team_id:
            return

        team = Team.fetch(team_id)
        if not team:
            return

        timer = team.timer
        if not timer:
            return

        r = timer.add_pomodoro(team)

        if timer.is_continuous:
            timer.restart_after_break()
        else:
            timer.stop_after_break()

        if team.slack.is_notify():
            team.slack.notify_end()

        return r
