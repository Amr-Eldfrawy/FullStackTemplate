from flask import Flask, render_template, jsonify, request , make_response
from flask_pymongo import PyMongo
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import traceback
import os
from jwt.contrib.algorithms.pycrypto import RSAAlgorithm
jwt.register_algorithm('RS256', RSAAlgorithm(RSAAlgorithm.SHA256))

dirname = os.path.dirname(__file__)

private_key = open(os.path.join(dirname,'jwt-key')).read()
public_key = open(os.path.join(dirname, 'jwt-key.pub')).read()

app = Flask(__name__, static_folder="../static/dist", template_folder="../static")

app.config['MONGO_DBNAME'] = 'frameworkTest'
app.config["MONGO_URI"] = "mongodb://localhost:27017/frameworkTest"

mongo = PyMongo(app)


def token_required(f):
    def decorated(*args, **kwargs):
        token = None

        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, public_key, algorithm='RS256')

            users_db = mongo.db.users
            user = users_db.find_one({'_id': data['public_id']})
        except:
            traceback.print_exc()
            return jsonify({'message': 'Token is invalid'}), 401

        return f(user, *args, **kwargs)

    return decorated


@app.route("/")
def index():
    return render_template("index.html")


@app.route('/getCredentials', methods=['POST'])
@token_required
def get_credentials(user):
    return "data for user " + user;


@app.route('/register', methods=['POST'])
def register():
    name = request.json['name']
    password = request.json['password']

    users_db = mongo.db.users

    # pbkdf2:sha256', salt_length=8
    if users_db.find_one({'name': name}):
        return make_response("couldn't create a new user. Please choose a different username", 400)

    users_db.insert_one({'name': name, 'password': generate_password_hash(password)})

    return jsonify({'result': True})


@app.route('/login')
def login():
    users_db = mongo.db.users
    auth_header = request.authorization

    if not auth_header or not auth_header.username or not auth_header.password:
        return make_response("missing auth header", 401)

    user = users_db.find_one({'name': auth_header.username})
    if not user:
        return make_response("user do not exist", 401)

    if check_password_hash(user['password'], auth_header.password):
        token = jwt.encode({'public_id': str(user['_id']),
                            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=10)},
                           private_key, algorithm='RS256')
        return jsonify({'token': token.decode('UTF-8')})

    return make_response("couldn't verify", 401)


if __name__ == "__main__":
    app.run()
