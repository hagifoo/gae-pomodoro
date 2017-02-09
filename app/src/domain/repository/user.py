from domain.entity import User, Timer, Slack
from infra import firebase, taskqueue


class UserRepository(object):
    def __init__(self):
        self._users = {}

    def get(self, id_):
        user_json = firebase.fetch_user(id_)
        if not user_json:
            return None
        else:
            j = user_json
            j['id'] = id_
            return self._build(j)

    def get_by_google_id(self, google_id):
        user_json = firebase.get_user_by_google_id(google_id)
        if not user_json:
            return None
        else:
            id_ = user_json.keys()[0]
            j = user_json[id_]
            j['id'] = id_
            return self._build(j)

    def new(self, name, image, email, google_id):
        r = firebase.add_user({
            'name': name,
            'image': image,
            'email': email,
            'googleId': google_id,
            'timer': {
                'startAt': 0,
                'pomodoroTime': 1500,
                'breakTime': 300
            }
        })

        import logging
        logging.error(r)

    #TODO: this method should be removed from this class
    def add_pomodoro(self, user):
        return firebase.add_user_pomodoro(
            user.timer.start_at,
            user.timer.pomodoro_time,
            user
        )

    def _build(self, j):
        u = User(
            id=j.get('id'),
            name=j.get('name'),
            email=j.get('email'),
            image=j.get('image'),
            google_id=j['googleId']
        )

        t = self._build_timer(u, j.get('timer', {}))
        u.set_timer(t)

        s = self._build_slack(u, j.get('slack', {}))
        u.set_slack(s)

        self._users[u.id] = u
        return u

    def _build_timer(self, user, j):
        return Timer(
            owner=user,
            start_at=int(j.get('startAt', 0)),
            pomodoro_time=int(j.get('pomodoroTime', 1500)),
            break_time=int(j.get('breakTime', 300)),
            taskqueue=taskqueue.UserTimerTaskqueue(user.id),
            firebase=firebase.UserTimerFirebase(user.id)
        )

    def _build_slack(self, user, j):
        return Slack(
            owner=user,
            firebase=firebase.UserSlack(user.id),
            name=j.get('name'),
            domain=j.get('domain'),
            channel_id=j.get('channelId'),
            mention=j.get('mention')
        )
