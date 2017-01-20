"""
This module provides user timer handling
"""

from application.handler import JsonHandler, signin_user_only
from domain import UserTimer as Timer


class Handler(JsonHandler):
    def get(self):
        if self.user:
            return self.user.to_json()
        else:
            return {'id': None}


class TimerStartHandler(JsonHandler):
    @signin_user_only
    def get(self):
        timer = Timer.fetch(self.user.id)
        return timer.start()


class TimerStartTaskHandler(JsonHandler):
    def post(self):
        user_id = self.request.get('id')
        start_at = int(self.request.get('start_at'), 0)
        if not user_id or not start_at:
            return

        timer = Timer.fetch(user_id)
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
    def get(self):
        timer = Timer.fetch(self.user.id)
        return timer.stop()


class TimerStopTaskHandler(JsonHandler):
    def post(self):
        user_id = self.request.get('id')
        if not user_id:
            return

        timer = Timer.fetch(user_id)
        return timer.stop()


class TimerEndTaskHandler(JsonHandler):
    def post(self):
        user_id = self.request.get('id')
        if not user_id:
            return

        timer = Timer.fetch(user_id)
        if not timer:
            return

        r = timer.add_pomodoro()

        if timer.is_continuous:
            timer.restart_after_break()
        else:
            timer.stop_after_break()

        return r

