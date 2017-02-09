class Team(object):
    def __init__(self, id, name, members, scope=''):
        self._id = id
        self._name = name
        self._members = members
        self._scope = scope
        self._timer = None
        self._slack = None

    @property
    def id(self):
        return self._id

    @property
    def name(self):
        return self._name

    @property
    def members(self):
        return self._members.keys()

    @property
    def member_ids(self):
        return self._members.keys()

    @property
    def scope(self):
        return self._scope

    def is_member(self, user_id):
        return user_id in self.member_ids

    def set_timer(self, timer):
        self._timer = timer

    def set_slack(self, slack):
        self._slack = slack

    @property
    def timer(self):
        return self._timer

    @property
    def slack(self):
        return self._slack

