#!/usr/bin/env python
import logging
from os.path import join, dirname
import sys

import webapp2

# add local modules
sys.path.insert(0, join(dirname(__file__)))

logging.getLogger().setLevel(logging.DEBUG)

### Variables
handlers = []

### Main
app = webapp2.WSGIApplication([
    webapp2.Route(r'/api/token/firebase', 'application.handler.token.FirebaseHandler'),
], debug=True)
