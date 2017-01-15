from google.appengine.api import taskqueue


def get_timer_end_task_name(user_id, start_at):
    return 'timerend_{}_{}'.format(user_id, start_at)

def add_timer_end_task(user_id, start_at, eta):
    taskqueue.add(
        url='/api/users/{}/timer/end'.format(user_id),
        target='default',
        name=get_timer_end_task_name(user_id, start_at),
        eta=eta
    )

def delete_timer_end_task(user_id, start_at):
    q = taskqueue.Queue('default')
    q.delete_tasks(taskqueue.Task(
        name=get_timer_end_task_name(user_id, start_at),
    ))