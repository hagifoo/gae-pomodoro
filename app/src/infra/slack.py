import json
import urllib

from google.appengine.api import urlfetch


class API(object):
    ENDPOINT = 'https://slack.com/api'

    def __init__(self, token):
        self._token = token

    def get(self, method, params=None):
        url = '{}/{}?token={}'.format(self.ENDPOINT, method, self._token)
        if params:
            url = url + '&' + urllib.urlencode(params)

        try:
            r = urlfetch.fetch(url)
            j = json.loads(r.content)
        except:
            import logging
            logging.error(r.content)
            raise

        if not j['ok']:
            raise RuntimeError(json.dumps(j))

        return j

    def get_channels_list(self):
        return self.get('channels.list', {'exclude_archived': 1})

    def get_team_info(self):
        return self.get('team.info')

    def post_message(self, channel, text):
        return self.get('chat.postMessage',
                        {'channel': channel, 'text': text, 'parse': 'full'})