# coding: utf-8

import json
import webapp2
from webapp2_extras import sessions

from domain import User
import error

class BaseHandler(webapp2.RequestHandler):
    def dispatch(self):
        self.session_store = sessions.get_store(request=self.request)
        user = self.session.get('user')
        if user:
            self.user = User.from_json(user)
        else:
            self.user = None

        try:
            return webapp2.RequestHandler.dispatch(self)
        except webapp2.HTTPException as e:
            self.response.set_status(e.code)
            if e.message:
                self.response.write(e.message)
        finally:
            self.session_store.save_sessions(self.response)

    @webapp2.cached_property
    def session(self):
        return self.session_store.get_session()


class JsonHandler(BaseHandler):
    def dispatch(self):
        j = super(JsonHandler, self).dispatch()
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'

        if j is not None:
            self.response.out.write(json.dumps(j))


# 非ログインユーザは弾く
def signin_user_only(f):
    def wrapper(self, *args, **keywords):
        if not self.user:
            raise error.UnauthorizedException('Need sign in')
        else:
            return f(self, *args, **keywords)
    return wrapper
