# encoding: utf-8
import base64
import jws
import python_jwt as jwt

from google.appengine.api import app_identity
import datetime


def create_custom_token(uid, is_premium_account):
    service_account_email = app_identity.get_service_account_name()
    payload = {
        'iss': service_account_email,
        'sub': service_account_email,
        'aud': 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
        'uid': uid,
        'claims': {
            'premium_account': is_premium_account
        }
    }
    exp = datetime.timedelta(minutes=60)

    token = jwt.generate_jwt(payload, None, 'RS256', exp)
    header, body, secret = token.split('.')

    # 返ってくるヘッダーは 'alg': 'none' になっているので RS256 に変更
    header = jws.utils.encode({
        'typ': 'JWT',
        'alg': 'RS256'
    }).decode('utf-8')

    # app_identity.sign_blob を使ってサインを作成
    sign = base64.urlsafe_b64encode(app_identity.sign_blob(str(header + '.' + body))[1]).strip('=')

    return header + '.' + body + '.' + sign
