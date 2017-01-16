"""
This module provides user timer handling
"""

import json

from application.handler import BaseHandler, signin_user_only
from domain import Timer


class TimerStartHandler(BaseHandler):
    @signin_user_only
    def get(self):
        timer = Timer.fetch(self.user.id)
        r = timer.start()
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.out.write(json.dumps(r))

    def post(self):
        user_id = self.request.get('user_id')
        start_at = self.request.get('start_at')
        if not user_id or not start_at:
            return

        timer = Timer.fetch(user_id)
        if not timer:
            return

        if timer.start_at == 0 or timer.start != start_at:
            return

        r = {}
        if timer.is_continuous:
            r = timer.start()

        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.out.write(json.dumps(r))


class TimerStopHandler(BaseHandler):
    @signin_user_only
    def get(self):
        timer = Timer.fetch(self.user.id)
        r = timer.stop()
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.out.write(json.dumps(r))


class TimerEndHandler(BaseHandler):
    def post(self):
        user_id = self.request.get('user_id')
        if not user_id:
            return

        timer = Timer.fetch(user_id)
        if not timer:
            return

        r = timer.add_pomodoro()

        if timer.is_continuous:
            timer.set_next()

        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.out.write(json.dumps(r))
