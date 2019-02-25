from flask import Flask, render_template, jsonify, request
from flask_pymongo import PyMongo

from bson.objectid import ObjectId
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
import jwt
from jwt.contrib.algorithms.pycrypto import RSAAlgorithm
import traceback
import os

from services.blacklist_service import BlackListService
from services.auth_service import AuthService
from services.credentials_service import CredentialsService

from services.missing_auth_header_exception import MissingAuthHeaderException
from services.unrecognised_user_exception import UnrecognisedUserException
from services.wrong_password_exception import WrongPasswordException

from crypto.aes_cipher import AESCipher
jwt.register_algorithm('RS256', RSAAlgorithm(RSAAlgorithm.SHA256))

dir_name = os.path.dirname(__file__)

raw_private_key = open(os.path.join(dir_name, 'jwt-key')).read()
raw_public_key = open(os.path.join(dir_name, 'jwt-key.pub')).read()

private_key = PKCS1_OAEP.new(RSA.importKey(raw_private_key))
public_key = PKCS1_OAEP.new(RSA.importKey(raw_public_key))

app = Flask(__name__, static_folder="../static/dist", template_folder="../static")

app.config['MONGO_DBNAME'] = 'frameworkTest'
app.config["MONGO_URI"] = "mongodb://localhost:27017/frameworkTest"

mongo = PyMongo(app)

user_collection = mongo.db.users
auth_service = AuthService(users_collection=user_collection, private_key=raw_private_key, jwt=jwt)

user_credentials_collection = mongo.db.user_credentials
credential_service = CredentialsService(credentials_collection=user_credentials_collection)

blacklist_service = BlackListService()


def token_required(f):
    def decorated(*args, **kwargs):
        token = None

        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        if blacklist_service.is_black_listed(token):
            return jsonify({'message': 'Token is invalid'}), 401

        try:
            data = jwt.decode(token, raw_public_key, algorithm='RS256')
            user = user_collection.find_one({'_id': ObjectId(data['public_id'])})
        except:
            traceback.print_exc()
            return jsonify({'message': 'failed to decode token. please sign in again '}), 400

        if user is None:
            return jsonify({'message': 'user attached is not valid. please register first'}), 400

        return f(user, data['key'], *args, **kwargs)

    decorated.func_name = f.func_name
    return decorated


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    return render_template("index.html")


@app.route('/getCredentials', methods=['GET'])
@token_required
def get_credentials(user, key):
    user_id = ObjectId(user['_id'])

    aes_key = AESCipher(key, user['password'])
    encrypted_user_credentials = credential_service.read_all_credentials(user_id)
    decrypted_user_credentials = credential_service.decrypt_credentials(encrypted_user_credentials, aes_key)

    return jsonify({'data': decrypted_user_credentials['credentials']})


@app.route('/addCredential', methods=['POST'])
@token_required
def add_credential(user, key):
    user_id = ObjectId(user['_id'])
    new_email = request.json['email']
    new_password = request.json['password']

    if credential_service.user_has_email(user_id, new_email) is True:
        return jsonify({'msg': "can not add a new credential that exist already. Please use update."}), 400

    aes_key = AESCipher(key, user['password'])
    encrypted_user_credentials = credential_service.add_credential_and_read_all(user_id, new_email, new_password,
                                                                                aes_key)
    decrypted_user_credentials = credential_service.decrypt_credentials(encrypted_user_credentials, aes_key)

    return jsonify({'data': decrypted_user_credentials['credentials']}), 200


@app.route('/editCredential',methods=['POST'])
@token_required
def edit_credential(user, key):
    # TODO add validation on values
    user_id = ObjectId(user['_id'])

    # delete old email
    old_email = request.get_json()["old_email"]
    if credential_service.user_has_email(user_id, old_email) is False:
        return jsonify({'msg': "Credential do not exist in the first place"}), 400
    credential_service.delete_email_and_read_all(user_id, old_email)

    # add new email
    new_email = request.get_json()["new_email"]
    new_password = request.get_json()["password"]
    aes_key = AESCipher(key, user['password'])
    encrypted_user_credentials = \
        credential_service.add_credential_and_read_all(user_id, new_email, new_password, aes_key)
    decrypted_user_credentials = credential_service.decrypt_credentials(encrypted_user_credentials, aes_key)

    return jsonify({'data': decrypted_user_credentials['credentials']}), 200


@app.route('/deleteCredential', methods=['POST'])
@token_required
def delete_credential(user, key):
    user_id = ObjectId(user['_id'])
    email_to_delete = request.get_json()["email"]

    if credential_service.user_has_email(user_id, email_to_delete) is False:
        return jsonify({'msg': "Credential do not exist in the first place"}), 400

    aes_key = AESCipher(key, user['password'])
    encrypted_user_credentials = credential_service.delete_email_and_read_all(user_id, email_to_delete)

    decrypted_user_credentials = credential_service.decrypt_credentials(encrypted_user_credentials, aes_key)

    return jsonify({'data': decrypted_user_credentials['credentials']}), 200


@app.route('/logout', methods=['GET'])
@token_required
def logout(user, key):
    token = request.headers['x-access-token']
    blacklist_service.blacklist(token)
    return jsonify({"msg": "token has been blacklisted"}), 200


@app.route('/register', methods=['POST'])
def register():
    registration_status = auth_service.register(request.json['name'], request.json['password'])

    if registration_status is False:
        return jsonify({'result': "couldn't create a new user. Please choose a different username"}), 400

    return jsonify(), 200


@app.route('/login')
def login():
    try:
        token = auth_service.login(request.authorization)
    except MissingAuthHeaderException:
        return jsonify({'msg': "missing auth header'"}), 401
    except UnrecognisedUserException:
        return jsonify({'msg': "user do not exist"}), 401
    except WrongPasswordException:
        return jsonify({'msg': "couldn't verify password"}), 401

    if token is not None:
        return jsonify({'token': token}), 200

    return jsonify({'msg': 'bad request'}), 400


if __name__ == "__main__":
    app.run()
