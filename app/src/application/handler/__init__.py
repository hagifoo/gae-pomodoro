# coding: utf-8

import json
import webapp2
from webapp2_extras import sessions

from domain import User

class BaseHandler(webapp2.RequestHandler):
    def dispatch(self):
        self.session_store = sessions.get_store(request=self.request)
        user = self.session.get('user')
        if user:
            self.user = User.from_json(user)
        else:
            self.user = None

        try:
            webapp2.RequestHandler.dispatch(self)
        finally:
            self.session_store.save_sessions(self.response)

    @webapp2.cached_property
    def session(self):
        return self.session_store.get_session()

# 非ログインユーザは弾く
def signin_user_only(f):
    def wrapper(self, *args, **keywords):
        if not self.user:
            self.redirect('/signin/google')
        else:
            return f(self, *args, **keywords)
    return wrapper


class UserHandler(BaseHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        if self.user:
            self.response.out.write(json.dumps(self.user.to_json()))
        else:
            self.response.out.write(json.dumps({'id': None}))
