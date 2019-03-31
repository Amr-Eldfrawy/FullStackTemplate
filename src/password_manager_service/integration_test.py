# test_hello_add.py
from server import app
from server import blacklist_service

import base64


def test_given_new_user_signup_when_new_user_login_then_gets_a_valid_token():
    register_account('test', 'test')

    jwt_token = sign_in('test', 'test')

    assert is_valid_token(jwt_token) is True


def test_given_old_user_when_user_signup_again_with_same_username_then_unauthorized_is_returned():
    # given
    register_account('test', 'test')

    # when
    response = register_account('test', 'test')

    # then
    assert response.status_code == 400
    assert response.json['msg'] == "couldn't create a new user. Please choose a different username"


def test_given_user_has_valid_token_when_calling_edit_credeitnals_then_credentials_are_updated():
    # given
    register_account('test', 'test')
    jwt_token = sign_in('test', 'test')
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


def test_given_user_has_valid_token_when_calling_add_credentials_then_new_credenials_are_added():
    # given
    register_account('test', 'test')
    jwt_token = sign_in('test', 'test')
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


def test_given_user_has_valid_token_when_calling_delete_credentials_then_credenials_are_deleted():
    # given
    register_account('test', 'test')
    jwt_token = sign_in('test', 'test')

    # when
    response=delete_credentials('test@domain.com', jwt_token)

    # then
    assert response.status_code == 200
    assert len(response.json['data']) is 0


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

    if response.status_code == 200:
        return response

    raise Exception('failed to call /editCredential response:{}'.format(response.json))


def add_credentials(param, jwt_token):
    response = app.test_client().post(
        '/addCredential',
        json={'email': param['email'], 'password': param['password']},
        headers={'x-access-token': jwt_token},
     )

    if response.status_code == 200:
        return response

    raise Exception('failed to call /addCredential response:{}'.format(response.json))


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
        return response.json['token']

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





