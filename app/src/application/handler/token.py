"""
This module provides token handling
"""

import json

from google.appengine.ext import webapp

import infra.firebase as firebase


class FirebaseHandler(webapp.RequestHandler):
    def get(self):
        token = {
            'token': firebase.create_custom_token(111, False)
        }
        self.response.headers['Content-Type'] = 'application/json; charset=utf-8'
        self.response.out.write(json.dumps(token))
