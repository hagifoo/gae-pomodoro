# coding: utf-8

import json
import webapp2
from webapp2_extras import sessions


class BaseHandler(webapp2.RequestHandler):
    def dispatch(self):
        self.session_store = sessions.get_store(request=self.request)

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
        if not self.session.get('user'):
            self.redirect('/')
        return f(self, *args, **keywords)
    return wrapper


class UserHandler(BaseHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.out.write(json.dumps({
            'id': 111,
            'name': 'hoge'
        }))
