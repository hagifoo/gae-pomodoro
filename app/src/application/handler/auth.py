# coding: utf-8

from requests_oauthlib import OAuth2Session
import json

from application.handler import BaseHandler
from domain import User
import secret

# OAuth endpoints given in the Google API documentation
GOOGLE_AUTHORIZATION_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://www.googleapis.com/oauth2/v4/token"
GOOGLE_AUTH_SCOPE = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
]


class SignInHandler(BaseHandler):
    def get(self):
        provider = OAuth2Session(
            secret.GOOGLE_CLIENT_ID,
            scope=GOOGLE_AUTH_SCOPE,
            redirect_uri=secret.GOOGLE_REDIRECT_URI)

        authorization_url, state = provider.authorization_url(
            GOOGLE_AUTHORIZATION_BASE_URL,
            access_type="offline",
            approval_prompt="force")

        self.redirect(str(authorization_url))


class CallbackHandler(BaseHandler):
    def get(self):
        code = self.request.params.get('code', 'none')

        provider = OAuth2Session(
            secret.GOOGLE_CLIENT_ID,
            scope=GOOGLE_AUTH_SCOPE,
            redirect_uri=secret.GOOGLE_REDIRECT_URI)
        provider.fetch_token(
            GOOGLE_TOKEN_URL,
            client_secret=secret.GOOGLE_CLIENT_SECRET,
            code=code)

        r = provider.get('https://www.googleapis.com/oauth2/v1/userinfo')
        j = json.loads(r.content)

        # fetch user by google ID
        user = User.fetch(j['id'])

        # sing in
        if user is not None:
            pass
        # sing up
        else:
            user = User(
                None,
                name=j.get('name'),
                email=j.get('email'),
                image=j.get('picture'),
                google_id=j['id']
            )
            user.add()

        self.session['user'] = user.to_json()
        origin_url = self.session.get('origin_url')
        if origin_url:
            self.session['origin_url'] = None
            self.redirect(str(origin_url))
        else:
            self.redirect('/')
