from datetime import datetime
import time

from infra import firebase
from infra import taskqueue


class Timer(object):
    TASKQUEUE = taskqueue.TimerTaskqueue
    FIREBASE = firebase.TimerFirebase

    def __init__(self, id, start_at, pomodoro_time,
                 break_time, is_continuous):
        self._id = id
        self._start_at = start_at
        self._pomodoro_time = pomodoro_time
        self._break_time = break_time
        self._is_continuous = is_continuous
        self._taskqueue = self.TASKQUEUE(id)
        self._firebase = self.FIREBASE(id)

    def start(self, start_at=None):
        if start_at:
            self._start_at = start_at
        else:
            self._start_at = int(time.mktime(datetime.utcnow().timetuple()))

        self._taskqueue.delete_timer_end_task(self.start_at)
        self._taskqueue.add_timer_end_task(self.start_at, self.pomodoro_end_dt)
        return self._firebase.start(self.start_at)

    def stop(self):
        self._taskqueue.delete_timer_end_task(self.start_at)
        return self._firebase.stop()

    def restart_after_break(self):
        self._taskqueue.add_timer_start_task(self.start_at, self.break_end_dt)

    def stop_after_break(self):
        self._taskqueue.add_timer_stop_task(self.start_at, self.break_end_dt)

    def add_pomodoro(self):
        return self._firebase.add_pomodoro(
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
    def break_end_at(self):
        return self._start_at + self._pomodoro_time + self._break_time

    @property
    def break_end_dt(self):
        return datetime.fromtimestamp(self._start_at + self._pomodoro_time + self._break_time)

    @property
    def pomodoro_time(self):
        return self._pomodoro_time

    @property
    def is_continuous(self):
        return self._is_continuous

    @classmethod
    def fetch(cls, id):
        timer_json = cls.FIREBASE(id).get()
        return cls.from_json(id, timer_json)

    @classmethod
    def from_json(cls, id, j):
        return cls(
            id,
            start_at=int(j.get('startAt', 0)),
            pomodoro_time=int(j.get('pomodoroTime')),
            break_time=int(j.get('breakTime')),
            is_continuous=j.get('isContinuous'),
        )


class UserTimer(Timer):
    TASKQUEUE = taskqueue.UserTimerTaskqueue
    FIREBASE = firebase.UserTimerFirebase


class TeamTimer(Timer):
    TASKQUEUE = taskqueue.TeamTimerTaskqueue
    FIREBASE = firebase.TeamTimerFirebase

    def add_pomodoro(self, team):
        return self._firebase.add_pomodoro(
            self._start_at,
            self._pomodoro_time,
            team
        )

class Team(object):
    def __init__(self, id, name, members, timer):
        self._id = id
        self._name = name
        self._members = members
        self._timer = TeamTimer.from_json(id, timer)

    @property
    def id(self):
        return self._id

    @property
    def timer(self):
        return self._timer

    @property
    def members(self):
        return self._members.keys()

    @property
    def member_ids(self):
        return self._members.keys()

    @classmethod
    def fetch(cls, id):
        team_json = firebase.fetch_team(id)
        if not team_json:
            return None
        else:
            j = team_json
            return cls(
                id=id,
                name=j.get('name'),
                members=j.get('users', {}),
                timer=j.get('timer')
            )


class User(object):
    def __init__(self, id, name, email, image, google_id):
        self._id = id
        self._name = name
        self._email = email
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
            'email': self._email,
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
                email=j.get('email'),
                image=j.get('image'),
                google_id=j['googleId']
            )

    def to_json(self):
        return {
            'id': self.id,
            'name': self._name,
            'email': self._email,
            'image': self._image,
            'googleId': self._google_id
        }


    @classmethod
    def from_json(cls, j):
        return cls(
            id=j.get('id'),
            name=j.get('name'),
            email=j.get('email'),
            image=j.get('image'),
            google_id=j['googleId']
        )
