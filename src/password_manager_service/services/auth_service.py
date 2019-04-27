from mongosanitizer import sanitizer
from werkzeug.security import generate_password_hash, check_password_hash
from .missing_auth_header_exception import MissingAuthHeaderException
from .unrecognised_user_exception import UnrecognisedUserException
from .wrong_password_exception import WrongPasswordException
from passlib.hash import sha256_crypt
import datetime


class AuthService:

    def __init__(self, users_collection, whitelisted_users, private_key, jwt):
        self.users_collection = users_collection
        self.whitelisted_users = whitelisted_users
        self.private_key = private_key
        self.jwt = jwt

    def register(self, name, password):
        # mutate the existing query for nosql attacks
        query = {'name': name}
        sanitizer.sanitize(query)

        # pbkdf2:sha256', salt_length=8
        if self.users_collection.find_one({'name': name}) or self.is_whitelisted_user(name) is False:
            return False

        self.users_collection.insert_one({'name': name, 'password': generate_password_hash(password)})

        return True

    def is_whitelisted_user(self, username):
        # mutate the existing query for nosql attacks
        query = {'name': username}
        sanitizer.sanitize(query)

        if not self.whitelisted_users.find_one(query):
            return False

        return True
    
    def login(self, auth_header):

        if auth_header is None or auth_header.get('username') is None or  auth_header.get('password') is None:
            raise MissingAuthHeaderException

        # mutate the existing query for nosql attacks
        query = {'name': auth_header['username']}
        sanitizer.sanitize(query)

        user = self.users_collection.find_one(query)
        if not user:
            raise UnrecognisedUserException

        if check_password_hash(user['password'], auth_header['password']):
            token = self.jwt.encode(
                {
                    'public_id': str(user['_id']),
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=10),
                    'key': sha256_crypt.encrypt(auth_header['password'], rounds=1000, salt='')[16: 32]
                },
                    self.private_key, algorithm='RS256')
            return token.decode('UTF-8')

        raise WrongPasswordException
