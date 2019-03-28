from werkzeug.security import generate_password_hash, check_password_hash
from .missing_auth_header_exception import MissingAuthHeaderException
from .unrecognised_user_exception import UnrecognisedUserException
from .wrong_password_exception import WrongPasswordException
from passlib.hash import sha256_crypt
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
            raise MissingAuthHeaderException

        user = self.users_collection.find_one({'name': auth_header.username})
        if not user:
            raise UnrecognisedUserException

        if check_password_hash(user['password'], auth_header.password):
            token = self.jwt.encode(
                {
                    'public_id': str(user['_id']),
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=10),
                    'key': sha256_crypt.encrypt(auth_header.password, rounds=1000, salt='')[16: 16 + 16]
                },
                    self.private_key, algorithm='RS256')
            return token.decode('UTF-8')

        raise WrongPasswordException
