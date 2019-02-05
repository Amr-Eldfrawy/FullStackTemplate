from flask import Flask, render_template, jsonify, request , make_response
from flask_pymongo import PyMongo
import jwt
import datetime
from werkzeug.security import generate_password_hash, \
     check_password_hash

secert_key = "asdhiu13py9eqwdpaweqwe"

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
            return jsonify({'message' : 'Token is missing'}), 401

        try:
            data = jwt.decode(token, secert_key)

            users_db = mongo.db.users
            user = users_db.find_one({'_id': data['public_id']})
        except:
            return jsonify({'message' : 'Token is invalid'}), 401

        return f(user, *args, **kwargs)

    return decorated


@app.route("/homepage")
@token_required
def homepage(user):
    return render_template("index.html")


@app.route('/register', methods=['POST'])
def register():
    name = request.json['name']
    password = request.json['password']

    users_db = mongo.db.users

    insert_one_result = users_db.insert_one({'name': name, 'password': generate_password_hash(password)})

    if insert_one_result.acknowledged is False:
        return make_response("couldn't create a new user. please choose a different username", 400)

    output = {'id': str(insert_one_result.inserted_id)}

    return jsonify({'result': output})


@app.route('/login')
def login():
    users_db = mongo.db.users
    auth_header = request.authorization

    if not auth_header or not auth_header.username or not auth_header.password:
        return make_response("couldn't verify", 401)

    user = users_db.find_one({'name': auth_header.username})
    if not user:
        return make_response("couldn't verify", 401)

    if check_password_hash(user['password'], auth_header.password):
        token = jwt.encode({'public_id' : str(user['_id']), 'exp' : datetime.datetime.utcnow() + datetime.timedelta(minutes=10)}
                           , secert_key)
        return jsonify({'token' : token.decode('UTF-8')})

    # need to add publickey and private key while generating tokens
    return make_response("couldn't verify", 401)


if __name__ == "__main__":
    app.run()
