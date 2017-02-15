from expects import expect, equal
import json
import mock
from os.path import dirname
import re
import urlparse
import webtest

from google.appengine.ext import testbed

import main
from helper import gen_user_cookie


def stub_response(host_regex, path_regex, data):
    host_regex = re.compile(host_regex)
    path_regex = re.compile(path_regex)

    def matcher(url):
        (protocol, host, path, query, fragment) = urlparse.urlsplit(url)
        return host_regex.match(host) and path_regex.match(path)

    def fetcher(*l, **args):
        return l[-1].set_content(json.dumps(data))

    return matcher, fetcher


def request_checker(host_regex, path_regex, mock, data):
    host_regex = re.compile(host_regex)
    path_regex = re.compile(path_regex)

    def matcher(url):
        (protocol, host, path, query, fragment) = urlparse.urlsplit(url)
        return host_regex.match(host) and path_regex.match(path)

    def fetcher(*l, **args):
        mock(*l)
        return l[-1].set_content(json.dumps(data))

    return matcher, fetcher


# /users/{id}
USER_DATA = {
    'name': 'user name',
    'image': 'https://hogehoge.png',
    'googleId': 12345,
    'timer': {
        'startAt': 0,
        'pomodoroTime': 1500,
        'breakTime': 300
    },
    'scope': 'myscope',
    'slack': {
        'name': 'team name',
        'domain': 'team-domain',
        'channelId': '123',
        'mention': '@hoge'
    }
}

# /userSecrets/{id}
USER_SECRET_DATA = {
    'slack': {
        'token': '12345'
    }
}

with description('User Scenarios'):
    with context('User already signed up'):
        with before.all:
            self.testapp = webtest.TestApp(main.app)
            self.testbed = testbed.Testbed()
            self.testbed.activate()
            self.testbed.init_app_identity_stub()
            self.testbed.init_taskqueue_stub()
            self.testbed.init_taskqueue_stub(
                root_path=dirname(dirname(dirname(__file__))))

        with after.all:
            self.testbed.deactivate()

        with context('/user/api'):
            with it('returns user info'):
                self.testapp.get('/api/user', headers=gen_user_cookie())

        with context('Slack is integrated'):
            with context('/api/user/timer/start'):
                with it('should be started and slack notification is sent'):
                    """
                    1. fetch User data (/users/{id}.json)
                    2. update Timer startAt (/users/{id}/timer.json)
                    3. fetch Slack token (/userSecrets/{id}/slack.json)
                    4. send Slack Notification
                    """
                    timer_mock = mock.Mock()
                    slack_mock = mock.Mock()
                    self.testbed.init_urlfetch_stub(urlmatchers=[
                        request_checker(r'.*\.firebaseio\.com', '/users/.*/timer.json', timer_mock, {'ok': True}),
                        request_checker(r'slack\.com', '.*', slack_mock, {'ok': True}),
                        stub_response(r'.*\.firebaseio\.com', '/users/.*', USER_DATA),
                        stub_response(r'.*\.firebaseio\.com', '/userSecrets/.*/slack\.json', USER_SECRET_DATA['slack'])
                    ])

                    self.testapp.get('/api/user/timer/start', headers=gen_user_cookie())

                    expect(timer_mock.call_count).to(equal(1))
                    expect(slack_mock.call_count).to(equal(1))

            with context('/api/task/user/timer/end'):
                with it('should be end timer and add pomodoro and send slack notification is sent'):
                    """
                    1. fetch User data (/users/{id}.json)
                    2. add Pomodoro data (/userPomodoros/{id}/{startAt}.json)
                    3. fetch Slack token (/userSecrets/{id}/slack.json)
                    4. send Slack Notification
                    """
                    slack_mock = mock.Mock()
                    pomodoro_mock = mock.Mock()

                    self.testbed.init_urlfetch_stub(urlmatchers=[
                        request_checker(r'slack\.com', '.*', slack_mock, {'ok': True}),
                        request_checker(r'.*\.firebaseio\.com', '/userPomodoros/.*\.json', pomodoro_mock, 'null'),
                        stub_response(r'.*\.firebaseio\.com', '/users/.*', USER_DATA),
                        stub_response(r'.*\.firebaseio\.com', '/userSecrets/.*/slack\.json', USER_SECRET_DATA['slack'])
                    ])

                    self.testapp.post('/api/task/user/timer/end', {'id': 'hoge'}, headers=gen_user_cookie())

                    expect(pomodoro_mock.call_count).to(equal(1))
                    pomodoro = json.loads(pomodoro_mock.call_args[0][-2].payload())
                    expect(pomodoro.get('scope')).to(equal('myscope'))
                    expect(slack_mock.call_count).to(equal(1))
