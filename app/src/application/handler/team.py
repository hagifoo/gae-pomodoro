"""
This module provides team and team timer handling
"""

from application.handler import BaseHandler, JsonHandler, TaskHandler, signin_user_only
from domain.repository import TeamRepository
import infra.firebase as firebase
import error


class InvitationHandler(BaseHandler):
    def get(self, invitation_code):
        team = TeamRepository.get_by_invitation_code(invitation_code)
        if team is None:
            raise error.NotFoundException('Invitation code is invalid.')

        if self.user is None:
            self.session['origin_url'] = self.request.url
            self.redirect('/signin/google')
            return

        firebase.add_team_user(team.id, self.user.id)
        self.redirect('/#teams/{}'.format(team.id))


class SlackChannelsHandler(JsonHandler):
    @signin_user_only
    def get(self, team_id):
        repository = TeamRepository()
        team = repository.get(team_id)
        if team is None:
            raise error.NotFoundException('No such team: {}'.format(team_id))

        return team.slack.get_channels()


class TimerStartHandler(JsonHandler):
    @signin_user_only
    def get(self, team_id):
        repository = TeamRepository()
        team = repository.get(team_id)
        if team is None:
            raise error.NotFoundException('No such team: {}'.format(team_id))

        if not team.is_member(self.user.id):
            raise error.UnauthorizedException('No such member: {}'.format(self.user.id))

        if team.slack.is_notify():
            team.slack.notify_start()

        return team.timer.start()


class TimerStopHandler(JsonHandler):
    @signin_user_only
    def get(self, team_id):
        repository = TeamRepository()
        team = repository.get(team_id)
        if team is None:
            raise error.NotFoundException('No such team: {}'.format(team_id))

        if not team.is_member(self.user.id):
            raise error.UnauthorizedException('No such member: {}'.format(self.user.id))

        if team.slack.is_notify():
            team.slack.notify_stop()

        return team.timer.stop()


class TimerEndTaskHandler(TaskHandler):
    def post(self):
        team_id = self.request.get('id')
        if not team_id:
            raise error.TaskUnrecoverableException(
                error.BadRequestException('`id` parameter is not specified'))

        repository = TeamRepository()
        team = repository.get(team_id)
        if team is None:
            raise error.TaskUnrecoverableException(
                error.NotFoundException('No such team: {}'.format(team_id)))

        repository.add_pomodoro(team)

        team.timer.stop_after_break()

        if team.slack.is_notify():
            team.slack.notify_end()


class TimerStopTaskHandler(TaskHandler):
    def post(self):
        team_id = self.request.get('id')
        if not team_id:
            raise error.TaskUnrecoverableException(
                error.BadRequestException('`id` parameter is not specified'))

        repository = TeamRepository()
        team = repository.get(team_id)
        if team is None:
            raise error.TaskUnrecoverableException(
                error.NotFoundException('No such team: {}'.format(team_id)))

        team.timer.stop()
