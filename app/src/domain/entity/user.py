class User(object):
    def __init__(self, id, name, email, image, google_id, scope=''):
        self._id = id
        self._name = name
        self._email = email
        self._image = image
        self._google_id = google_id
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
    def email(self):
        return self._email

    @property
    def image(self):
        return self._image

    @property
    def google_id(self):
        return self._google_id

    @property
    def scope(self):
        return self._scope

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
