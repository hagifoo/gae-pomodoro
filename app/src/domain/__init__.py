from datetime import datetime
import time

from infra import firebase
from infra import taskqueue


class Timer(object):
    def __init__(self, user_id, start_at, pomodoro_time,
                 break_time, is_continuous):
        self._user_id = user_id
        self._start_at = start_at
        self._pomodoro_time = pomodoro_time
        self._break_time = break_time
        self._is_continuous = is_continuous

    def start(self):
        self._start_at = int(time.mktime(datetime.utcnow().timetuple()))
        taskqueue.delete_timer_end_task(self._user_id, self.start_at)
        taskqueue.add_timer_end_task(self._user_id, self.start_at, self.pomodoro_end_dt)
        return firebase.start_timer(self._user_id, self.start_at)

    def stop(self):
        taskqueue.delete_timer_end_task(self._user_id, self.start_at)
        return firebase.stop_timer(self._user_id)

    def add_pomodoro(self):
        return firebase.add_pomodoro(
            self._user_id,
            self._start_at,
            self._pomodoro_time,
        )

    @property
    def start_at(self):
        return self._start_at

    @property
    def pomodoro_end_dt(self):
        return datetime.fromtimestamp(self._start_at + self._pomodoro_time)

    @property
    def pomodoro_time(self):
        return self._pomodoro_time

    @classmethod
    def fetch(cls, user_id):
        timer_json = firebase.get_timer(user_id)
        return Timer(
            user_id,
            start_at=timer_json.get('startAt'),
            pomodoro_time=timer_json.get('pomodoroTime'),
            break_time=timer_json.get('breakTime'),
            is_continuous=timer_json.get('isContinuous'),
        )


class User(object):
    def __init__(self, id, name, image, google_id):
        self._id = id
        self._name = name
        self._image = image
        self._google_id = google_id

    @property
    def id(self):
        return self._id

    def add(self):
        if self.id is not None:
            raise RuntimeError('id is not None')

        r = firebase.add_user({
            'name': self._name,
            'image': self._image,
            'googleId': self._google_id,
            'timer': {
                'startAt': 0,
                'pomodoroTime': 1500,
                'breakTime': 300,
                'isContinuous': False
            }
        })

        self._id = r['name']

    @classmethod
    def fetch(cls, google_id):
        user_json = firebase.get_user_by_google_id(google_id)
        if not user_json:
            return None
        else:
            id_ = user_json.keys()[0]
            j = user_json[id_]
            return User(
                id=id_,
                name=j.get('name'),
                image=j.get('image'),
                google_id=j['googleId']
            )

    def to_json(self):
        return {
            'id': self.id,
            'name': self._name,
            'image': self._image,
            'googleId': self._google_id
        }


    @classmethod
    def from_json(cls, j):
        return cls(
            id=j.get('id'),
            name=j.get('name'),
            image=j.get('image'),
            google_id=j['googleId']
        )

