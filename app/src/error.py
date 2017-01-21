"""
this module provide package specific error classes.
"""

import webapp2


class BaseHTTPException(webapp2.HTTPException):
    code = None

    def __init__(self, message=''):
        self._message = message

    @property
    def message(self):
        return self._message


class UnauthorizedException(BaseHTTPException):
    code = 401


class ForbiddenException(BaseHTTPException):
    code = 403


class NotFoundException(BaseHTTPException):
    code = 403
