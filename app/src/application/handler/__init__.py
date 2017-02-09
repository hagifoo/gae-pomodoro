# coding: utf-8

import json
import logging
import webapp2
from webapp2_extras import sessions
from google.appengine.api.taskqueue import TombstonedTaskError, TaskAlreadyExistsError, DuplicateTaskNameError

from domain.entity import User
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

    @property
    def session_id(self):
        cookie_name = self.session_store.config['cookie_name']
        return self.request.cookies[cookie_name]


class JsonHandler(BaseHandler):
    def dispatch(self):
        j = super(JsonHandler, self).dispatch()
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'

        if j is not None:
            self.response.out.write(json.dumps(j))


class TaskHandler(BaseHandler):
    """Handle unrecoverable errors."""
    def dispatch(self):
        try:
            super(TaskHandler, self).dispatch()

        # Unrecoverable Exceptions such as Invalid Parameter
        except error.TaskUnrecoverableException as e:
            logging.error(e)

        except (TombstonedTaskError,
                TaskAlreadyExistsError,
                DuplicateTaskNameError) as e:
            logging.error(e)


def signin_user_only(f):
    """Raise UnauthorizedException if session user is None

    Examples:
      class MyHandler(BaseHandler):
        @singin_user_only
        def get(self):
          # following code is executed only if user is signed in.
          ...
    """
    def wrapper(self, *args, **keywords):
        if not self.user:
            raise error.UnauthorizedException('Need sign in')
        else:
            return f(self, *args, **keywords)
    return wrapper
