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
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.out.write(json.dumps(r))
