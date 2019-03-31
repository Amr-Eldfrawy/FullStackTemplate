# auth_service
# exceptions on the login function
# True,False on the signup function
from pytest import raises
from mock import Mock
import jwt

from auth_service import AuthService

from password_manager_service.services.missing_auth_header_exception import MissingAuthHeaderException
from password_manager_service.services.unrecognised_user_exception import UnrecognisedUserException
from password_manager_service.services.wrong_password_exception import WrongPasswordException

from ..server import raw_private_key as mock_private_key
from ..server import raw_public_key as mock_public_key


def test_given_invalid_header_when_calling_login_then_MissingAuthHeaderException_is_returned():
    # given
    mock_user_collection = Mock()
    mock_user_collection.find_one.return_value = {
        'password': "pbkdf2:sha256:50000$OtdSXmd7$cb97cbe1a278106c333e432dbcd943c4bd7f3a1a42ea220ade795f77fbc7d9e0",
        '_id': '12345'
    }
    auth_service = AuthService(mock_user_collection, mock_private_key, jwt)

    # then
    with raises(MissingAuthHeaderException):
        auth_service.login({"password": 'test'})

    with raises(MissingAuthHeaderException):
        auth_service.login({"username": 'test'})

    with raises(MissingAuthHeaderException):
        auth_service.login(None)


def test_given_valid_auth_header_when_calling_login_then_token_is_returned():
    # given
    mock_user_collection = Mock()
    mock_user_collection.find_one.return_value = {
        # hashed version of 'test' with salt
        'password': "pbkdf2:sha256:50000$OtdSXmd7$cb97cbe1a278106c333e432dbcd943c4bd7f3a1a42ea220ade795f77fbc7d9e0",
        '_id': 'some_id'
    }
    auth_service = AuthService(mock_user_collection, mock_private_key, jwt)

    # when
    token = auth_service.login({"username": 'test', 'password': 'test'})

    # then
    data = jwt.decode(token, mock_public_key, algorithm='RS256')
    assert 'some_id' == data['public_id']
    assert data['exp'] is not None

    # hashed version, no salt for 'test'
    print data['key'] == "xzwXZ2CoOI8Z/2QH"
    mock_user_collection.find_one.assert_called_once_with({'name': 'test'})


def test_given_unrecognised_user_when_calling_login_then_UnrecognisedUserException_is_returned():
    # given
    mock_user_collection = Mock()
    mock_user_collection.find_one.return_value = False
    auth_service = AuthService(mock_user_collection, mock_private_key, jwt)

    # then
    with raises(UnrecognisedUserException):
        auth_service.login({'username': 'test', "password": 'test'})


def test_given_invalid_password_when_calling_login_then_WrongPasswordException_is_returned():
    # given
    mock_user_collection = Mock()
    mock_user_collection.find_one.return_value = {
        # hashed version of 'test' with salt
        'password': "pbkdf2:sha256:50000$OtdSXmd7$cb97cbe1a278106c333e432dbcd943c4bd7f3a1a42ea220ade795f77fbc7d9e0",
        '_id': 'some_id'
    }
    auth_service = AuthService(mock_user_collection, mock_private_key, jwt)

    # then
    with raises(WrongPasswordException):
        auth_service.login({'username': 'test', "password": 'wrong_password'})


