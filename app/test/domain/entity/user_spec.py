from expects import *

from domain.entity import User


with description('User'):
    with context('#__init__'):
        with it('instantiate User'):
            user = User(
                id='id',
                name='name',
                email='email',
                image='image',
                google_id='googleId',
            )

            expect(user.id).to(equal('id'))
