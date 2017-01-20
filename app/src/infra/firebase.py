# encoding: utf-8
import base64
import datetime
import json
import jws
import python_jwt as jwt

from google.appengine.api import app_identity
from google.appengine.api import urlfetch

from oauth2client.client import GoogleCredentials

FIREBASE_SCOPES = [
    'https://www.googleapis.com/auth/firebase.database',
    'https://www.googleapis.com/auth/userinfo.email']

FIREBASE_URL = 'https://{}.firebaseio.com'.format(app_identity.get_application_id())

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


def get_access_token():
    return GoogleCredentials\
        .get_application_default()\
        .create_scoped(FIREBASE_SCOPES)\
        .get_access_token()


def add_user(data):
    path = '/users.json'
    token = get_access_token()[0]
    url = '{}{}?access_token={}'.format(
        FIREBASE_URL, path, token)
    return json.loads(
        urlfetch.fetch(
            url, method='POST', payload=json.dumps(data)
        ).content)


def get_user_by_google_id(google_id):
    path = '/users.json'
    token = get_access_token()[0]
    url = '{}{}?access_token={}&orderBy="googleId"&equalTo="{}"'.format(
        FIREBASE_URL, path, token, google_id)
    return json.loads(urlfetch.fetch(url).content)


class TimerFirebase(object):
    PATH = '/users'
    POMODORO_PATH = '/userPomodoros'

    def __init__(self, id_):
        self._id = id_

    def get(self):
        path = self.PATH + '/{}/timer.json'.format(self._id)
        token = get_access_token()[0]
        url = '{}{}?access_token={}'.format(FIREBASE_URL, path, token)
        return json.loads(urlfetch.fetch(url).content)


    def start(self, start_at):
        path = self.PATH + '/{}/timer.json'.format(self._id)
        token = get_access_token()[0]
        url = '{}{}?access_token={}'.format(FIREBASE_URL, path, token)
        data = {
            'startAt': start_at
        }

        return json.loads(
            urlfetch.fetch(url, payload=json.dumps(data), method='PATCH')
        .content)


    def stop(self):
        path = self.PATH + '/{}/timer.json'.format(self._id)
        token = get_access_token()[0]
        url = '{}{}?access_token={}'.format(FIREBASE_URL, path, token)
        data = {
            'startAt': 0
        }

        return json.loads(
            urlfetch.fetch(url, payload=json.dumps(data), method='PATCH')
                .content)


    def add_pomodoro(self, start_at, time):
        path =  self.POMODORO_PATH + '/{}/{}.json'.format(self._id, start_at)
        token = get_access_token()[0]
        url = '{}{}?access_token={}'.format(FIREBASE_URL, path, token)
        data = {
            'time': time,
            'feeling': 'none'
        }

        return json.loads(
            urlfetch.fetch(
                url, payload=json.dumps(data), method='PUT'
            ).content)


class UserTimerFirebase(TimerFirebase):
    PATH = '/users'
    POMODORO_PATH = '/userPomodoros'


class TeamTimerFirebase(TimerFirebase):
    PATH = '/teams'
    POMODORO_PATH = '/teamPomodoros'

    def add_pomodoro(self, start_at, time, team):
        path =  self.POMODORO_PATH + '/{}/{}.json'.format(self._id, start_at)
        token = get_access_token()[0]
        url = '{}{}?access_token={}'.format(FIREBASE_URL, path, token)
        data = {
            'time': time,
            'attendee': {id: {'feeling': 'none'} for id in team.member_ids}
        }

        urlfetch.fetch(
            url, payload=json.dumps(data), method='PUT'
        )

        for user_id in team.member_ids:
            path =  '/userPomodoros/{}/{}.json'.format(user_id, start_at)
            token = get_access_token()[0]
            url = '{}{}?access_token={}'.format(FIREBASE_URL, path, token)
            data = {
                'time': time,
                'team': team.id,
                'feeling': 'none'
            }
            urlfetch.fetch(
                url, payload=json.dumps(data), method='PUT'
            )



def fetch_team(id):
    path = '/teams/{}.json'.format(id)
    token = get_access_token()[0]
    url = '{}{}?access_token={}'.format(
        FIREBASE_URL, path, token)

    return json.loads(
        urlfetch.fetch(
            url
        ).content)


def fetch_team_by_invitation_code(invitation_code):
    path = '/teams.json'
    token = get_access_token()[0]
    url = '{}{}?access_token={}&orderBy="invitationLink"&equalTo="{}"'.format(
        FIREBASE_URL, path, token, invitation_code)

    return json.loads(
        urlfetch.fetch(
            url
        ).content)


def add_team_user(team_id, user_id):
    path = '/teams/{}/users.json'.format(team_id)
    token = get_access_token()[0]
    url = '{}{}?access_token={}'.format(FIREBASE_URL, path, token)
    data = {}
    data[user_id] = {'join': True}

    urlfetch.fetch(url, payload=json.dumps(data), method='PATCH')

    path = '/userTeams/{}.json'.format(user_id)
    token = get_access_token()[0]
    url = '{}{}?access_token={}'.format(FIREBASE_URL, path, token)
    data = {}
    data[team_id] = True

    urlfetch.fetch(url, payload=json.dumps(data), method='PATCH')
