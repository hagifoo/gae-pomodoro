"""
This module provides token handling
"""

from application.handler import JsonHandler, signin_user_only
import infra.firebase as firebase


class FirebaseHandler(JsonHandler):
    @signin_user_only
    def get(self):
        return {
            'token': firebase.create_custom_token(self.user.id, False)
        }
