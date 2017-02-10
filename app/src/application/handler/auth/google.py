# coding: utf-8

from Crypto.Hash import SHA256
import json
from requests_oauthlib import OAuth2Session

from application.handler import BaseHandler
from domain.repository import UserRepository
import error
import secret

# OAuth endpoints given in the Google API documentation
GOOGLE_AUTHORIZATION_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://www.googleapis.com/oauth2/v4/token"
GOOGLE_AUTH_SCOPE = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
]


def generate_state(session_id):
    s = SHA256.new()
    s.update(session_id)
    return s.hexdigest()


def check_state(session_id, state):
    s = SHA256.new()
    s.update(session_id)
    return s.hexdigest() == state


class SignInHandler(BaseHandler):
    def get(self):
        provider = OAuth2Session(
            secret.GOOGLE_CLIENT_ID,
            scope=GOOGLE_AUTH_SCOPE,
            redirect_uri=secret.GOOGLE_REDIRECT_URI)

        authorization_url, state = provider.authorization_url(
            GOOGLE_AUTHORIZATION_BASE_URL,
            # state=generate_state(self.session_id),
            access_type="offline",
            approval_prompt="force")

        self.redirect(str(authorization_url))


class CallbackHandler(BaseHandler):
    def get(self):
        code = self.request.params.get('code', 'none')
        state = self.request.params.get('state')

        # if not check_state(self.session_id, state):
        #     raise error.ForbiddenException('`state` not matches')

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
        repository = UserRepository()
        user = repository.get_by_google_id(j['id'])

        # sing in
        if user is not None:
            pass
        # sing up
        else:
            user = repository.new(
                name=j.get('name'),
                email=j.get('email'),
                image=j.get('picture'),
                google_id=j['id']
            )

        self.session['user'] = user.to_json()
        origin_url = self.session.get('origin_url')
        if origin_url:
            self.session['origin_url'] = None
            self.redirect(str(origin_url))
        else:
            self.redirect('/')
