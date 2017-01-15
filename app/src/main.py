#!/usr/bin/env python
import logging
from os.path import join, dirname
import sys

import webapp2

# add local modules
sys.path.insert(0, join(dirname(__file__)))

logging.getLogger().setLevel(logging.DEBUG)
config = {
    'webapp2_extras.sessions': {
        'secret_key': 'abcdefg',
        'session_max_age': 3600
    }
}

### Main
app = webapp2.WSGIApplication([
    webapp2.Route(r'/api/user',
                  'application.handler.UserHandler'),
    webapp2.Route(r'/api/token/firebase',
                  'application.handler.token.FirebaseHandler'),
    webapp2.Route(r'/api/user/timer/start',
                  'application.handler.timer.TimerStartHandler'),
    webapp2.Route(r'/api/user/timer/stop',
                  'application.handler.timer.TimerStopHandler'),
    webapp2.Route(r'/api/users/<user_id>/timer/end',
                  'application.handler.timer.TimerEndHandler'),
    webapp2.Route(r'/signin/google',
                  'application.handler.auth.SignInHandler'),
    webapp2.Route(r'/auth/google',
                  'application.handler.auth.CallbackHandler'),
], debug=True, config=config)
