"""
This module provides token handling
"""

import json

from application.handler import BaseHandler, signin_user_only
import infra.firebase as firebase


class FirebaseHandler(BaseHandler):
    @signin_user_only
    def get(self):
        token = {
            'token': firebase.create_custom_token(111, False)
        }
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.out.write(json.dumps(token))
