from infra import slack


class Slack(object):
    def __init__(self, owner, firebase, name=None, domain=None,
                 channel_id=None, mention=''):
        self._owner = owner
        self._name = name
        self._domain = domain
        self._channel_id = channel_id
        self._token = None
        self._mention = mention
        self._firebase = firebase

    @property
    def owner(self):
        return self._owner

    @property
    def channel_id(self):
        return self._channel_id

    def update(self, token, name, domain):
        self._firebase.update(name, domain)
        self._firebase.update_token(token)

    @property
    def token(self):
        if not self._token:
            self._token = self._firebase.get_token()
        return self._token

    def is_notify(self):
        return self._channel_id is not None

    def get_channels(self):
        channels = slack.API(self.token).get_channels_list()
        return [{'name': c['name'], 'id': c['id']} for c in channels['channels']]

    def notify_start(self):
        text = u'''{}'s pomodoro started! {} min. {}'''.format(
            self.owner.name,
            self.owner.timer.pomodoro_time / 60,
            self._mention)
        slack.API(self.token).post_message(self.channel_id, text)

    def notify_stop(self):
        text = u'''{}'s pomodoro stopped!'''.format(
            self.owner.name)
        slack.API(self.token).post_message(self.channel_id, text)

    def notify_end(self):
        text = u'''{}'s pomodoro completed! {} min break. {}'''.format(
            self.owner.name, self.owner.timer.break_time / 60, self._mention)
        slack.API(self.token).post_message(self.channel_id, text)

