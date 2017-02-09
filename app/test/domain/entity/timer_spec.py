from datetime import datetime, timedelta
from expects import *
import mock

from domain.entity import User, Timer


def build_timer(start_at=0):
    user = User(
        id='id',
        name='name',
        email='email',
        image='image',
        google_id='googleId',
    )

    timer = Timer(
        owner=user,
        start_at=start_at,
        pomodoro_time=1500,
        break_time=300,
        taskqueue=mock.Mock(),
        firebase=mock.Mock()
    )

    return timer


with description('Timer'):
    with context('#__init__'):
        with it('instantiate Timer'):
            timer = build_timer()
            expect(timer.pomodoro_time).to(equal(1500))

    with context('#pomodoro_end_dt'):
        with it('returns pomodoro end datetime'):
            start_at = datetime.utcnow().replace(microsecond=0)
            timer = build_timer(long(start_at.strftime('%s')))
            expect(timer.pomodoro_end_dt).to(equal(start_at + timedelta(seconds=1500)))

    with context('#break_end_dt'):
        with it('returns break end datetime'):
            start_at = datetime.utcnow().replace(microsecond=0)
            timer = build_timer(long(start_at.strftime('%s')))
            expect(timer.break_end_dt).to(equal(start_at + timedelta(seconds=1800)))
