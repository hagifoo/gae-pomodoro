from datetime import datetime
import time


class Timer(object):
    """Timer represents pomodoro timer which can start and stop."""
    def __init__(self, owner, start_at, pomodoro_time,
                 break_time, taskqueue, firebase):
        """
        Attributes:
            owner (User/Team):
                who own this timer.

            start_at (long):
                time when timer started in unix timestamp.
                None or 0 means timer is not started.

            pomodoro_time (long):
                pomodoro time in seconds.

            break_time (long):
                break time in seconds.

            taskqueue (taskqueue.Timer):
                taskqueue handling object

            firebase (firebase.Timer):
                firebase handling object
        """
        self._owner = owner
        self._start_at = start_at
        self._pomodoro_time = pomodoro_time
        self._break_time = break_time
        self._taskqueue = taskqueue
        self._firebase = firebase

    def start(self, start_at=None):
        """Start timer.

        Attributes:
            start_at (long):
                time when timer started.
                if not specified, current utc time is used instead.
        """
        if start_at:
            self._start_at = start_at
        else:
            self._start_at = int(time.mktime(datetime.utcnow().timetuple()))

        self._taskqueue.delete_timer_end_task(self.start_at)
        self._taskqueue.add_timer_end_task(self.start_at, self.pomodoro_end_dt)
        return self._firebase.start(self.start_at)

    def stop(self):
        """Stop timer."""
        self._taskqueue.delete_timer_end_task(self.start_at)
        return self._firebase.stop()

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
        """Return pomodoro end time in datetime.datetime."""
        return datetime.fromtimestamp(self._start_at + self._pomodoro_time)

    @property
    def break_end_at(self):
        return self._start_at + self._pomodoro_time + self._break_time

    @property
    def break_end_dt(self):
        """Return break end time in datetime.datetime."""
        return datetime.fromtimestamp(self._start_at + self._pomodoro_time + self._break_time)

    @property
    def pomodoro_time(self):
        return self._pomodoro_time

    @property
    def break_time(self):
        return self._break_time
