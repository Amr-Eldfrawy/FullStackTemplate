from werkzeug.security import generate_password_hash, check_password_hash
from .login_response import LoginResponse

import datetime


class AuthService:

    def __init__(self, users_collection, private_key, jwt):
        self.users_collection = users_collection
        self.private_key = private_key
        self.jwt = jwt

    def register(self, name, password):

        # pbkdf2:sha256', salt_length=8
        if self.users_collection.find_one({'name': name}):
            return False

        self.users_collection.insert_one({'name': name, 'password': generate_password_hash(password)})

        return True

    def login(self, auth_header):
        if not auth_header or not auth_header.username or not auth_header.password:
            return LoginResponse(token=None, error_msg="missing auth header")

        user = self.users_collection.find_one({'name': auth_header.username})
        if not user:
            return LoginResponse(token=None, error_msg="user do not exist")

        if check_password_hash(user['password'], auth_header.password):
            token = self.jwt.encode({'public_id': str(user['_id']),
                                     'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=100)},
                                    self.private_key, algorithm='RS256')
            return LoginResponse(token=token.decode('UTF-8'), error_msg="")

        return LoginResponse(token=None, error_msg="couldn't verify")
