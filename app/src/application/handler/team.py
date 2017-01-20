"""
This module provides token handling
"""

from application.handler import BaseHandler, JsonHandler, signin_user_only
from domain import TeamTimer as Timer, Team
import infra.firebase as firebase


class InvitationHandler(BaseHandler):
    @signin_user_only
    def get(self, invitation_code):
        team = firebase.fetch_team_by_invitation_code(invitation_code)
        if team is None:
            return

        team_id = team.keys()[0]
        firebase.add_team_user(team_id, self.user.id)
        self.redirect('/#teams/{}'.format(team_id))


class TimerStartHandler(JsonHandler):
    @signin_user_only
    def get(self, team_id):
        team = Team.fetch(team_id)
        # if not timer.is_member(self.user.id):
        #     raise RuntimeError()

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
            return timer.start(start_at=timer.break_end_at)
        else:
            return {}


class TimerStopHandler(JsonHandler):
    @signin_user_only
    def get(self, team_id):
        team = Team.fetch(team_id)
        # if not timer.is_member(self.user.id):
        #     raise RuntimeError()

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

        return r
