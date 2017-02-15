# encoding: utf-8
import base64
import datetime
import json
import jws
import os
import python_jwt as jwt

from google.appengine.api import app_identity
from google.appengine.api import urlfetch

from oauth2client.client import GoogleCredentials

FIREBASE_SCOPES = [
    'https://www.googleapis.com/auth/firebase.database',
    'https://www.googleapis.com/auth/userinfo.email']


def firebase_url():
    return 'https://{}.firebaseio.com'.format(app_identity.get_application_id())


def create_custom_token(uid, is_premium_account):
    service_account_email = app_identity.get_service_account_name()
    payload = {
        'iss': service_account_email,
        'sub': service_account_email,
        'aud': 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
        'uid': uid,
        'claims': {
            'premium_account': is_premium_account
        }
    }
    exp = datetime.timedelta(minutes=60)

    token = jwt.generate_jwt(payload, None, 'RS256', exp)
    header, body, secret = token.split('.')

    # 返ってくるヘッダーは 'alg': 'none' になっているので RS256 に変更
    header = jws.utils.encode({
        'typ': 'JWT',
        'alg': 'RS256'
    }).decode('utf-8')

    # app_identity.sign_blob を使ってサインを作成
    sign = base64.urlsafe_b64encode(app_identity.sign_blob(str(header + '.' + body))[1]).strip('=')

    return header + '.' + body + '.' + sign


TOKEN = None

def get_access_token():
    if os.environ.get('TEST'):
        return 'testtoken'
    global TOKEN
    if TOKEN:
        return TOKEN
    TOKEN = GoogleCredentials\
        .get_application_default()\
        .create_scoped(FIREBASE_SCOPES)\
        .get_access_token()
    return TOKEN


def add_user(data):
    path = '/users.json'
    token = get_access_token()[0]
    url = '{}{}?access_token={}'.format(
        firebase_url(), path, token)
    return json.loads(
        urlfetch.fetch(
            url, method='POST', payload=json.dumps(data)
        ).content)


def get_user_by_google_id(google_id):
    path = '/users.json'
    token = get_access_token()[0]
    url = '{}{}?access_token={}&orderBy="googleId"&equalTo="{}"'.format(
        firebase_url(), path, token, google_id)
    return json.loads(urlfetch.fetch(url).content)


def fetch_user(id):
    path = '/users/{}.json'.format(id)
    token = get_access_token()[0]
    url = '{}{}?access_token={}'.format(
        firebase_url(), path, token)

    return json.loads(
        urlfetch.fetch(
            url
        ).content)


class TimerFirebase(object):
    PATH = '/users'
    POMODORO_PATH = '/userPomodoros'

    def __init__(self, id_):
        self._id = id_

    def get(self):
        path = self.PATH + '/{}/timer.json'.format(self._id)
        token = get_access_token()[0]
        url = '{}{}?access_token={}'.format(firebase_url(), path, token)
        return json.loads(urlfetch.fetch(url).content)


    def start(self, start_at):
        path = self.PATH + '/{}/timer.json'.format(self._id)
        token = get_access_token()[0]
        url = '{}{}?access_token={}'.format(firebase_url(), path, token)
        data = {
            'startAt': start_at
        }

        return json.loads(
            urlfetch.fetch(url, payload=json.dumps(data), method='PATCH')
        .content)


    def stop(self):
        path = self.PATH + '/{}/timer.json'.format(self._id)
        token = get_access_token()[0]
        url = '{}{}?access_token={}'.format(firebase_url(), path, token)
        data = {
            'startAt': 0
        }

        return json.loads(
            urlfetch.fetch(url, payload=json.dumps(data), method='PATCH')
                .content)



class UserTimerFirebase(TimerFirebase):
    PATH = '/users'
    POMODORO_PATH = '/userPomodoros'


class TeamTimerFirebase(TimerFirebase):
    PATH = '/teams'
    POMODORO_PATH = '/teamPomodoros'


def add_user_pomodoro(start_at, time, user):
    path = '/userPomodoros/{}/{}.json'.format(user.id, start_at)
    token = get_access_token()[0]
    url = '{}{}?access_token={}'.format(firebase_url(), path, token)
    data = {
        'time': time,
        'feeling': 'none',
        'scope': user.scope
    }

    return json.loads(
        urlfetch.fetch(
            url, payload=json.dumps(data), method='PUT'
        ).content)


def add_team_pomodoro(start_at, time, team):
    path = '/teamPomodoros/{}/{}.json'.format(team.id, start_at)
    token = get_access_token()[0]
    url = '{}{}?access_token={}'.format(firebase_url(), path, token)
    data = {
        'time': time,
        'attendee': {id: {'feeling': 'none'} for id in team.member_ids},
        'scope': team.scope
    }

    urlfetch.fetch(
        url, payload=json.dumps(data), method='PUT'
    )

    for user_id in team.member_ids:
        path =  '/userPomodoros/{}/{}.json'.format(user_id, start_at)
        token = get_access_token()[0]
        url = '{}{}?access_token={}'.format(firebase_url(), path, token)
        data = {
            'time': time,
            'team': team.id,
            'feeling': 'none',
            'scope': team.scope
        }
        urlfetch.fetch(
            url, payload=json.dumps(data), method='PUT'
        )


def fetch_team(id):
    """Returns team json or None if no team is found.

       (Firebase REST API returns "null" if no contents found.)

        Returned json does not include team id as following.
        ```
        {
          'name': ...,
          'users': {},
          'slack': {},
          'timer': {}
        }
        ```
    """
    path = '/teams/{}.json'.format(id)
    token = get_access_token()[0]
    url = '{}{}?access_token={}'.format(
        firebase_url(), path, token)

    r = urlfetch.fetch(url)

    return json.loads(r.content)


def fetch_team_by_invitation_code(invitation_code):
    path = '/teams.json'
    token = get_access_token()[0]
    url = '{}{}?access_token={}&orderBy="invitationLink"&equalTo="{}"'.format(
        firebase_url(), path, token, invitation_code)

    return json.loads(
        urlfetch.fetch(
            url
        ).content)


def add_team_user(team_id, user_id):
    path = '/teams/{}/users.json'.format(team_id)
    token = get_access_token()[0]
    url = '{}{}?access_token={}'.format(firebase_url(), path, token)
    data = {}
    data[user_id] = {'join': True}

    urlfetch.fetch(url, payload=json.dumps(data), method='PATCH')

    path = '/userTeams/{}.json'.format(user_id)
    token = get_access_token()[0]
    url = '{}{}?access_token={}'.format(firebase_url(), path, token)
    data = {}
    data[team_id] = True

    urlfetch.fetch(url, payload=json.dumps(data), method='PATCH')


def update_team_slack(team_id, name, domain):
    path = '/teams/{}/slack.json'.format(team_id)
    token = get_access_token()[0]
    url = '{}{}?access_token={}'.format(firebase_url(), path, token)
    data = {
        'name': name,
        'domain': domain
    }

    urlfetch.fetch(url, payload=json.dumps(data), method='PATCH')


def update_team_slack_token(team_id, slack_token):
    path = '/teamSecrets/{}/slack.json'.format(team_id)
    token = get_access_token()[0]
    url = '{}{}?access_token={}'.format(firebase_url(), path, token)
    data = {
        'token': slack_token
    }

    urlfetch.fetch(url, payload=json.dumps(data), method='PATCH')


def get_team_slack_token(team_id):
    path = '/teamSecrets/{}/slack.json'.format(team_id)
    token = get_access_token()[0]
    url = '{}{}?access_token={}'.format(firebase_url(), path, token)

    return json.loads(
        urlfetch.fetch(
            url
        ).content)['token']


class Slack(object):
    def __init__(self, id_):
        self._id = id_

    def _path(self):
        return '/owner/{}/slack.json'.format(self._id)

    def _secret_path(self):
        return '/ownerSecrets/{}/slack.json'.format(self._id)

    def update(self, name, domain):
        path = self._path()
        token = get_access_token()[0]
        url = '{}{}?access_token={}'.format(firebase_url(), path, token)
        data = {
            'name': name,
            'domain': domain
        }

        urlfetch.fetch(url, payload=json.dumps(data), method='PATCH')

    def update_token(self, slack_token):
        path = self._secret_path()
        token = get_access_token()[0]
        url = '{}{}?access_token={}'.format(firebase_url(), path, token)
        data = {
            'token': slack_token
        }

        urlfetch.fetch(url, payload=json.dumps(data), method='PATCH')

    def get_token(self):
        path = self._secret_path()
        token = get_access_token()[0]
        url = '{}{}?access_token={}'.format(firebase_url(), path, token)

        return json.loads(
            urlfetch.fetch(
                url
            ).content)['token']


class TeamSlack(Slack):
    def _path(self):
        return '/teams/{}/slack.json'.format(self._id)

    def _secret_path(self):
        return '/teamSecrets/{}/slack.json'.format(self._id)


class UserSlack(Slack):
    def _path(self):
        return '/users/{}/slack.json'.format(self._id)

    def _secret_path(self):
        return '/userSecrets/{}/slack.json'.format(self._id)
