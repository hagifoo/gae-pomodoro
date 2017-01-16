"""
This module provides user timer handling
"""

import json

from application.handler import BaseHandler, signin_user_only
from domain import Timer


class TimerStartHandler(BaseHandler):
    @signin_user_only
    def get(self):
        timer = Timer.fetch(111)
        r = timer.start()
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.out.write(json.dumps(r))


class TimerStopHandler(BaseHandler):
    @signin_user_only
    def get(self):
        timer = Timer.fetch(111)
        r = timer.stop()
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.out.write(json.dumps(r))


class TimerEndHandler(BaseHandler):
    @signin_user_only
    def post(self, user_id):
        timer = Timer.fetch(user_id)
        r = timer.add_pomodoro()
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.out.write(json.dumps(r))
