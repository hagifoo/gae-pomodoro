"""
This module provides user and user timer handling
"""

from application.handler import JsonHandler, TaskHandler, signin_user_only
from domain.repository import UserRepository
import error


class Handler(JsonHandler):
    @signin_user_only
    def get(self):
        return self.user.to_json()


class SlackChannelsHandler(JsonHandler):
    @signin_user_only
    def get(self):
        repository = UserRepository()
        user = repository.get(self.user.id)
        return user.slack.get_channels()


class TimerStartHandler(JsonHandler):
    @signin_user_only
    def get(self):
        repository = UserRepository()
        user = repository.get(self.user.id)

        if user.slack.is_notify():
            user.slack.notify_start()

        return user.timer.start()


class TimerStopHandler(JsonHandler):
    @signin_user_only
    def get(self):
        repository = UserRepository()
        user = repository.get(self.user.id)

        if user.slack.is_notify():
            user.slack.notify_stop()

        return user.timer.stop()


class TimerEndTaskHandler(TaskHandler):
    def post(self):
        user_id = self.request.get('id')
        if not user_id:
            raise error.TaskUnrecoverableException(
                error.BadRequestException('`id` parameter is not specified'))

        repository = UserRepository()
        user = repository.get(user_id)
        if user is None:
            raise error.TaskUnrecoverableException(
                error.NotFoundException('No such user: {}'.format(user_id)))

        repository.add_pomodoro(user)
        user.timer.stop_after_break()

        if user.slack.is_notify():
            user.slack.notify_end()


class TimerStopTaskHandler(TaskHandler):
    def post(self):
        user_id = self.request.get('id')
        if not user_id:
            raise error.TaskUnrecoverableException(
                error.BadRequestException('`id` parameter is not specified'))

        repository = UserRepository()
        user = repository.get(user_id)
        if user is None:
            raise error.TaskUnrecoverableException(
                error.NotFoundException('No such user: {}'.format(user_id)))

        user.timer.stop()


