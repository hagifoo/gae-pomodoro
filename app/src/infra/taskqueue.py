from google.appengine.api import taskqueue


def get_timer_end_task_name(user_id, start_at):
    return 'timerend_{}_{}'.format(user_id, start_at)

def add_timer_end_task(user_id, start_at, eta):
    taskqueue.add(
        url='/api/user/timer/end',
        target='default',
        name=get_timer_end_task_name(user_id, start_at),
        params={'user_id': user_id},
        eta=eta
    )

def delete_timer_end_task(user_id, start_at):
    q = taskqueue.Queue()
    q.delete_tasks(taskqueue.Task(
        name=get_timer_end_task_name(user_id, start_at),
    ))