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
        'session_max_age': 86400
    }
}

### Main
app = webapp2.WSGIApplication([
    # API
    webapp2.Route(r'/api/user',
                  'application.handler.user.Handler'),
    webapp2.Route(r'/api/token/firebase',
                  'application.handler.token.FirebaseHandler'),
    webapp2.Route(r'/api/user/timer/start',
                  'application.handler.user.TimerStartHandler'),
    webapp2.Route(r'/api/user/timer/stop',
                  'application.handler.user.TimerStopHandler'),
    webapp2.Route(r'/api/team/timer/start/<team_id>',
                  'application.handler.team.TimerStartHandler'),
    webapp2.Route(r'/api/team/timer/stop/<team_id>',
                  'application.handler.team.TimerStopHandler'),

    # Task
    webapp2.Route(r'/api/task/user/timer/start',
                  'application.handler.user.TimerStartTaskHandler'),
    webapp2.Route(r'/api/task/user/timer/stop',
                  'application.handler.user.TimerStopTaskHandler'),
    webapp2.Route(r'/api/task/user/timer/end',
                  'application.handler.user.TimerEndTaskHandler'),
    webapp2.Route(r'/api/task/team/timer/start',
                  'application.handler.team.TimerStartTaskHandler'),
    webapp2.Route(r'/api/task/team/timer/stop',
                  'application.handler.team.TimerStopTaskHandler'),
    webapp2.Route(r'/api/task/team/timer/end',
                  'application.handler.team.TimerEndTaskHandler'),

    # OAuth
    webapp2.Route(r'/signin/google',
                  'application.handler.auth.SignInHandler'),
    webapp2.Route(r'/auth/google',
                  'application.handler.auth.CallbackHandler'),

    # Invitation
    webapp2.Route(r'/invitation/<invitation_code>',
                  'application.handler.team.InvitationHandler'),
], debug=True, config=config)
