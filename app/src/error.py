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


class BadRequestException(BaseHTTPException):
    code = 400


class UnauthorizedException(BaseHTTPException):
    code = 401


class ForbiddenException(BaseHTTPException):
    code = 403


class NotFoundException(BaseHTTPException):
    code = 403


class TaskUnrecoverableException(Exception):
    def __init__(self, exception):
        self._exception = exception

    @property
    def cause(self):
        return self._exception