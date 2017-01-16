from google.appengine.api import taskqueue


def get_timer_start_task_name(user_id, start_at):
    return 'timerstart_{}_{}'.format(user_id, start_at)

def get_timer_end_task_name(user_id, start_at):
    return 'timerend_{}_{}'.format(user_id, start_at)

def add_timer_end_task(user_id, start_at, eta):
    taskqueue.add(
        url='/api/user/timer/end',
        target='default',
        name=get_timer_end_task_name(user_id, start_at),
        params={'user_id': user_id},
        queue_name='timer',
        eta=eta
    )

def add_timer_start_task(user_id, start_at, eta):
    taskqueue.add(
        url='/api/user/timer/start',
        target='default',
        name=get_timer_start_task_name(user_id, start_at),
        params={'user_id': user_id, 'start_at': start_at},
        queue_name='timer',
        eta=eta
    )

def delete_timer_end_task(user_id, start_at):
    q = taskqueue.Queue('timer')
    q.delete_tasks(taskqueue.Task(
        name=get_timer_end_task_name(user_id, start_at),
    ))