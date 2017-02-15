from webapp2_extras import sessions
from webapp2_extras.securecookie import SecureCookieSerializer


def gen_user_cookie():
    session = {'user': {'id': '123', 'googleId': '1'}}
    secure_cookie_serializer = SecureCookieSerializer(
        'abcdefg'
    )
    serialized = secure_cookie_serializer.serialize(
        'session', session
    )
    return {'Cookie': 'session=%s' % serialized}
