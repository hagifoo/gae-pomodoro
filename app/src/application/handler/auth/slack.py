# coding: utf-8

from Crypto.Hash import SHA256
from requests_oauthlib import OAuth2Session
import json
from webapp2_extras import sessions

from application.handler import BaseHandler, signin_user_only
from domain.repository import TeamRepository, UserRepository
import error
import secret
import infra.slack

# OAuth endpoints given in the Google API documentation
AUTHORIZATION_BASE_URL = 'https://slack.com/oauth/authorize'
TOKEN_URL = 'https://slack.com/api/oauth.access'
AUTH_SCOPE = [
    'identify',
    'channels:read',
    'team:read',
    'users:read',
    'chat:write:bot'
]


def generate_state(session_id, team_id):
    s = SHA256.new()
    s.update(session_id)
    digest = s.hexdigest()
    return digest + '_' + team_id


def check_state(session_id, state):
    digest, team_id = state.split('_', 1)
    s = SHA256.new()
    s.update(session_id)
    if s.hexdigest() != digest:
        raise error.ForbiddenException()

    return team_id


class UserSignInHandler(BaseHandler):
    @signin_user_only
    def get(self):
        state = generate_state(self.session_id, '')

        provider = OAuth2Session(
            secret.SLACK_CLIENT_ID,
            scope=[','.join(AUTH_SCOPE)],
            redirect_uri=secret.SLACK_USER_REDIRECT_URI)

        authorization_url, state = provider.authorization_url(
            AUTHORIZATION_BASE_URL,
            state=state,
            access_type='offline',
            approval_prompt='force')

        self.redirect(str(authorization_url))


class UserCallbackHandler(BaseHandler):
    def get(self):
        code = self.request.params.get('code', 'none')
        state = self.request.params.get('state')
        check_state(self.session_id, state)

        provider = OAuth2Session(
            secret.SLACK_CLIENT_ID,
            scope=[','.join(AUTH_SCOPE)],
            redirect_uri=secret.SLACK_USER_REDIRECT_URI)
        token = provider.fetch_token(
            TOKEN_URL,
            client_secret=secret.SLACK_CLIENT_SECRET,
            code=code)

        token = token['access_token']
        api = infra.slack.API(token)
        slack_team = api.get_team_info()['team']

        repository = UserRepository()
        user = repository.get(self.user.id)
        user.slack.update(token, slack_team['name'], slack_team['domain'])
        self.redirect('/#')


class TeamSignInHandler(BaseHandler):
    @signin_user_only
    def get(self, team_id):
        state = generate_state(self.session_id, team_id)

        provider = OAuth2Session(
            secret.SLACK_CLIENT_ID,
            scope=[','.join(AUTH_SCOPE)],
            redirect_uri=secret.SLACK_TEAM_REDIRECT_URI)

        authorization_url, state = provider.authorization_url(
            AUTHORIZATION_BASE_URL,
            state=state,
            access_type='offline',
            approval_prompt='force')

        self.redirect(str(authorization_url))


class TeamCallbackHandler(BaseHandler):
    def get(self):
        code = self.request.params.get('code', 'none')
        state = self.request.params.get('state')
        team_id = check_state(self.session_id, state)

        team = TeamRepository.get(team_id)
        if not team:
            raise error.NotFoundException('No such team: {}'.format(team_id))

        provider = OAuth2Session(
            secret.SLACK_CLIENT_ID,
            scope=[','.join(AUTH_SCOPE)],
            redirect_uri=secret.SLACK_TEAM_REDIRECT_URI)
        token = provider.fetch_token(
            TOKEN_URL,
            client_secret=secret.SLACK_CLIENT_SECRET,
            code=code)

        token = token['access_token']
        api = infra.slack.API(token)
        slack_team = api.get_team_info()['team']
        team.slack.update(token, slack_team['name'], slack_team['domain'])
        self.redirect('/#teams/{}'.format(team.id))
