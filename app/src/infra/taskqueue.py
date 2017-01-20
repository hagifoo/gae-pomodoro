from google.appengine.api import taskqueue


class TimerTaskqueue(object):
    NAME_PREFIX = 'timer'
    PATH = '/api/task/timer'

    def __init__(self, id_):
        self._id = id_

    def get_timer_start_task_name(self, start_at):
        return '{}start_{}_{}'.format(
            self.NAME_PREFIX, self._id, start_at)

    def get_timer_stop_task_name(self, start_at):
        return '{}stop_{}_{}'.format(
            self.NAME_PREFIX, self._id, start_at)

    def get_timer_end_task_name(self, start_at):
        return '{}end_{}_{}'.format(
            self.NAME_PREFIX, self._id, start_at)

    def add_timer_end_task(self, start_at, eta):
        taskqueue.add(
            url=self.PATH + '/end',
            target='default',
            name=self.get_timer_end_task_name(start_at),
            params={'id': self._id},
            queue_name='timer',
            eta=eta
        )

    def add_timer_start_task(self, start_at, eta):
        taskqueue.add(
            url=self.PATH + '/start',
            target='default',
            name=self.get_timer_start_task_name(start_at),
            params={'id': self._id, 'start_at': start_at},
            queue_name='timer',
            eta=eta
        )

    def add_timer_stop_task(self, start_at, eta):
        taskqueue.add(
            url=self.PATH + '/stop',
            target='default',
            name=self.get_timer_stop_task_name(start_at),
            params={'id': self._id, 'start_at': start_at},
            queue_name='timer',
            eta=eta
        )

    def delete_timer_end_task(self, start_at):
        q = taskqueue.Queue('timer')
        q.delete_tasks(taskqueue.Task(
            name=self.get_timer_end_task_name(start_at),
        ))


class UserTimerTaskqueue(TimerTaskqueue):
    NAME_PREFIX = 'usertimer'
    PATH = '/api/task/user/timer'


class TeamTimerTaskqueue(TimerTaskqueue):
    NAME_PREFIX = 'teamtimer'
    PATH = '/api/task/team/timer'
