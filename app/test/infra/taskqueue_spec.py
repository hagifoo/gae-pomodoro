from datetime import datetime, timedelta
from os.path import dirname

from google.appengine.ext import testbed

from infra.taskqueue import TimerTaskqueue

with description('taskqueue.Timer'):
    with context('#add'):
        with before.all:
            self.testbed = testbed.Testbed()
            self.testbed.activate()
            self.testbed.init_taskqueue_stub(
                root_path=dirname(dirname(dirname(__file__))))

        with after.all:
            self.testbed.deactivate()

        with it('ignore same task'):
            queue = TimerTaskqueue('1')
            now = datetime.utcnow()
            min10after = now + timedelta(minutes=10)
            queue.add('/test', 'aname', {}, min10after)

            # this method does not cause error!
            queue.add('/test', 'aname', {}, min10after)
