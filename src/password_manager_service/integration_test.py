# test_hello_add.py
from server import app
from server import blacklist_service

import base64

# signup
def test_given_old_user_when_user_signup_again_with_same_username_then_unauthorized_is_returned():
    # given
    register_account('test', 'test')

    # when
    response = register_account('test', 'test')

    # then
    assert response.status_code == 400
    assert response.json['msg'] == "couldn't create a new user. Please choose a different username"


# login
def test_given_new_user_signup_when_new_user_login_then_gets_a_valid_token():
    register_account('test', 'test')

    status_code, jwt_token = sign_in('test', 'test')

    assert status_code == 200
    assert is_valid_token(jwt_token) is True


def test_given_existing_user_when_user_login_with_invalid_credentials_then_401():
    register_account('test', 'test')

    status_code, service_msg = sign_in('test', 'wrong_password')

    assert status_code == 400

# logout
def test_authorized_user_when_calling_logout_then_API_returns_200():
    register_account('test', 'test')
    status_code, jwt_token = sign_in('test', 'test')

    response = app.test_client().get(
        '/logout',
        headers={'x-access-token': jwt_token},
    )

    assert response.status_code == 200
    assert blacklist_service.is_black_listed(jwt_token)
    blacklist_service.clear_cache()


def test_given_a_blacklisted_token_when_calling_secured_API_then_API_returns_401():
    # given
    register_account('test', 'test')
    status_code, jwt_token = sign_in('test', 'test')
    logut_call_response = app.test_client().get(
        '/logout',
        headers={'x-access-token': jwt_token},
    )
    assert logut_call_response.status_code == 200
    blacklisted_token = jwt_token

    # when
    secured_api_call_response=app.test_client().get(
        '/logout',
        headers={'x-access-token': blacklisted_token},
    )

    # then
    assert secured_api_call_response.status_code == 401
    blacklist_service.clear_cache()

# get credentials
def test_given_un_authorized_user_when_calling_get_credentials_then_401():
    register_account('test', 'test')
    status_code, jwt_token = sign_in('test', 'wrong_password')

    response=app.test_client().get(
        '/getCredentials',
        headers={'x-access-token': jwt_token},
    )

    assert response.status_code == 401

def test_given_authorized_user_when_calling_get_credentials_then_200():
    register_account('test', 'test')
    status_code, jwt_token = sign_in('test', 'test')

    response=app.test_client().get(
        '/getCredentials',
        headers={'x-access-token': jwt_token},
    )

    assert response.status_code == 200

# edit credentials
def test_authorized_user_when_calling_edit_credeitnals_then_credentials_are_updated():
    # given
    register_account('test', 'test')
    status_code, jwt_token = sign_in('test', 'test')
    delete_test_user_credentials(jwt_token)
    add_credentials({
        "email": "test@domain.com",
        "password": "domain_password"
    }, jwt_token)

    # when
    response = edit_credentials({
        "old_email": "test@domain.com",
        "new_email": "new_test@domain.com",
        "password": "new_domain_password"
    }, jwt_token)

    # then
    assert response.status_code == 200
    assert response.json['data'][0]['email'] == 'new_test@domain.com';
    assert response.json['data'][0]['password'] == 'new_domain_password';


def test_unauthorized_user_when_calling_edit_credeitnals_then_401():
    # given
    register_account('test', 'test')
    status_code, jwt_token = sign_in('test', 'wrong_password')

    # when
    response = edit_credentials({
        "old_email": "test@domain.com",
        "new_email": "new_test@domain.com",
        "password": "new_domain_password"
    }, jwt_token)

    # then
    assert response.status_code == 401


def test_authorized_user_when_calling_edit_credeitnals_with_wrong_payload_then_400():
    # given
    register_account('test', 'test')
    status_code, jwt_token = sign_in('test', 'test')
    delete_test_user_credentials(jwt_token)
    add_credentials({
        "email": "test@domain.com",
        "password": "domain_password"
    }, jwt_token)

    # when
    response = edit_credentials({
        "old_email": "test2222@domain.com",
        "new_email": "new_test@domain.com",
        "password": "new_domain_password"
    }, jwt_token)

    # then
    assert response.status_code == 400

# add credentials
def test_given_authorized_user_when_calling_add_credentials_then_new_credenials_are_added():
    # given
    register_account('test', 'test')
    status_code, jwt_token = sign_in('test', 'test')
    delete_test_user_credentials(jwt_token)

    # when
    response=add_credentials({
        "email": "test@domain.com",
        "password": "domain_password"
    }, jwt_token)

    # then
    assert response.status_code == 200
    assert response.json['data'][0]['email'] == 'test@domain.com'
    assert response.json['data'][0]['password'] == 'domain_password'


def test_given_unauthorized_user_when_calling_add_credential_then_401():
    register_account('test', 'test')
    status_code, jwt_token = sign_in('test', 'wrong_password')

    respone=add_credentials({
        "email": "test@domain.com",
        "password": "domain_password"
    }, jwt_token)

    assert respone.status_code == 401


def test_given_authorized_user_when_calling_add_credential_for_existing_entry_then_400():
    register_account('test', 'test')
    status_code, jwt_token = sign_in('test', 'test')
    delete_test_user_credentials(jwt_token)

    add_credentials({
        "email": "test@domain.com",
        "password": "domain_password"
    }, jwt_token)

    respone=add_credentials({
        "email": "test@domain.com",
        "password": "domain_password"
    }, jwt_token)

    assert respone.status_code == 400

# delete credentials
def test_authorized_user_when_calling_delete_credentials_then_credenials_are_deleted():
    # given
    register_account('test', 'test')
    status_code, jwt_token = sign_in('test', 'test')
    delete_test_user_credentials(jwt_token)
    add_credentials({
        "email": "test@domain.com",
        "password": "domain_password"
    }, jwt_token)

    # when
    response=delete_credentials('test@domain.com', jwt_token)

    # then
    assert response.status_code == 200
    assert len(response.json['data']) is 0

def test_unauthorized_user_token_when_calling_delete_credentials_then_401():
    # given
    register_account('test', 'test')
    status_code, jwt_token = sign_in('test', 'wrong_password')
    delete_test_user_credentials(jwt_token)
    add_credentials({
        "email": "test@domain.com",
        "password": "domain_password"
    }, jwt_token)
    # when
    response = delete_credentials('test@domain.com', jwt_token)

    # then
    assert response.status_code == 401

def test_authorized_user_token_when_calling_delete_credentials_with_wrong_payload_then_400():
    # given
    register_account('test', 'test')
    status_code, jwt_token = sign_in('test', 'test')
    delete_test_user_credentials(jwt_token)
    add_credentials({
        "email": "test@domain.com",
        "password": "domain_password"
    }, jwt_token)

    # when
    response = delete_credentials('wrong_email@domain.com', jwt_token)

    # then
    assert response.status_code == 400

# utils
def delete_test_user_credentials(jwt_token):
    delete_credentials('test@domain.com', jwt_token)
    delete_credentials('new_test@domain.com', jwt_token)


def delete_credentials(email, jwt_token):
    return app.test_client().post(
        '/deleteCredential',
        json={'email': email},
        headers={'x-access-token': jwt_token},
    )


def edit_credentials(param, jwt_token):
    response=app.test_client().post(
        '/editCredential',
        json={
                'old_email': param['old_email'],
                'new_email': param['new_email'],
                'password': param['password']
        },
        headers={'x-access-token': jwt_token},
    )

    return response



def add_credentials(param, jwt_token):
    response = app.test_client().post(
        '/addCredential',
        json={'email': param['email'], 'password': param['password']},
        headers={'x-access-token': jwt_token},
     )


    return response


def register_account(name, password):
    return app.test_client().post(
        '/register',
        json={'name': name, 'password': password},

    )


def sign_in(name, password):
    base64string = base64.encodestring('%s:%s' % (name, password)).replace('\n', '')
    response = app.test_client().get(
        '/login',
        json={'name': name, 'password': password},
        headers={'Authorization': "Basic " + base64string},
    )

    if response.status_code == 200:
        return 200, response.json['token']

    if response.status_code == 400:
        return 400, response.json['msg']

    raise Exception('failed to call /login response:{}'.format(response.json))


def is_valid_token(jwt_token):
    response = app.test_client().get(
        '/logout',
        headers={'x-access-token': jwt_token},
    )

    blacklist_service.clear_cache()

    if response.status_code == 200:
        return True

    return False





