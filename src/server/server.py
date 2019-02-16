from flask import Flask, render_template, jsonify, request
from flask_pymongo import PyMongo
from pymongo import ReturnDocument
from bson.objectid import ObjectId
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP

import jwt
from jwt.contrib.algorithms.pycrypto import RSAAlgorithm
import traceback
import os

from services.blacklist_service import BlackListService
from services.auth_service import AuthService

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
user_credentials_collection = mongo.db.user_credentials
auth_service = AuthService(users_collection=user_collection, private_key=raw_private_key, jwt=jwt)
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

        return f(user, *args, **kwargs)

    decorated.func_name = f.func_name
    return decorated


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    return render_template("index.html")


@app.route('/getCredentials', methods=['GET'])
@token_required
def get_credentials(user):
    user_id = ObjectId(user['_id'])
    user_credentials = user_credentials_collection.find_one({'_id': user_id})

    if user_credentials is None:
        return jsonify({'data': None})

    for credential in user_credentials['credentials']:
        credential['password'] = private_key.decrypt(credential['password'].decode('base64'))

    return jsonify({'data': user_credentials['credentials']})


@app.route('/addCredential', methods=['POST'])
@token_required
def add_credentials(user):
    user_id = ObjectId(user['_id'])
    new_credentials = request.json['entry']

    # reject duplication
    existing_credentials = user_credentials_collection.find_one({'_id': user_id})
    # can be searched better
    if existing_credentials is not None:
        for credential in existing_credentials['credentials']:
            if credential['email'] == new_credentials['email']:
                return jsonify({'msg': "can not add a new credential that exist already. Please use update."}), 400
    # add new entry
    user_credentials = user_credentials_collection.find_one_and_update(
        {'_id': user_id},
        {
            '$push': {
                'credentials':
                    {
                        'email': new_credentials['email'],
                        'password': public_key.encrypt(bytes(new_credentials['password'])).encode('base64')
                     }
            }
        },
        upsert=True,
        return_document=ReturnDocument.AFTER
    )
    return jsonify({'data': user_credentials['credentials']}), 200


@app.route('/logout', methods=['GET'])
@token_required
def logout(user):
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
    login_response = auth_service.login(request.authorization)

    if login_response.token is not None:
        return jsonify({'token': login_response.token}), 200

    return jsonify({'msg': login_response.error_msg}), 401


if __name__ == "__main__":
    app.run()
