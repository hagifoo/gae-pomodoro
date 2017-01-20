"""
This module provides token handling
"""

import json

from application.handler import BaseHandler, signin_user_only
import infra.firebase as firebase


class InvitationHandler(BaseHandler):
    @signin_user_only
    def get(self, invitation_code):
        team = firebase.fetch_team_by_invitation_code(invitation_code)
        if team is None:
            return

        team_id = team.keys()[0]
        firebase.add_team_user(team_id, self.user.id)
        self.redirect('/#teams/{}'.format(team_id))
