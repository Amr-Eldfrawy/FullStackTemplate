from flask import Flask, render_template, jsonify, request , make_response
from flask_pymongo import PyMongo
import jwt
import datetime

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
            user = users_db.find_one({'name': data['public_id']})
        except:
            return jsonify({'message' : 'Token is invalid'}), 401

        return f(user, *args, **kwargs)

    return decorated


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/hello") # take note of this decorator syntax, it's a common pattern
def hello():
    return "Hello World!"


@app.route('/framework', methods=['GET'])
@token_required
def get_all_frameworks(user):
    framework = mongo.db.framework

    output = []

    for q in framework.find():
        output.append({'name' : q['name'], 'language' : q['language']})

    return jsonify({'result' : output})


@app.route('/framework', methods=['POST'])
def add_framework():
    framework = mongo.db.framework

    name = request.json['name']
    language = request.json['language']

    framework_id = framework.insert({'name' : name, 'language' : language})
    new_framework = framework.find_one({'_id' : framework_id})

    # output = {'name' : new_framework['name'], 'language' : new_framework['language']}

    return jsonify({'result' : new_framework})


@app.route('/framework/<name>', methods=['GET'])
def get_one_framework(name):
    framework = mongo.db.framework

    q = framework.find_one({'name' : name})

    if q:
        output = {'name' : q['name'], 'language' : q['language']}
    else:
        output = 'No results found'

    return jsonify({'result': output})


@app.route('/register', methods=['POST'])
def register():
    users = mongo.db.users

    name = request.json['name']
    password = request.json['password']

    user_id = users.insert({'name': name, 'password': password})
    user_id = users.find_one({'_id': user_id})

    output = {'name': user_id['name'], 'password': user_id['password']}

    return jsonify({'result': output})


@app.route('/login')
def login():
    users = mongo.db.users
    auth = request.authorization

    if not auth or not auth.username or not auth.password:
        return make_response("couldn't verify", 401)

    user = users.find_one({'name': auth.username})

    if not user:
        return make_response("couldn't verify", 401)

    # need to has password using check_password_hash to prevent saving plain text
    if user['password']== auth.password:
        token = jwt.encode({'public_id' : user['name'], 'exp' : datetime.datetime.utcnow() + datetime.timedelta(minutes=10)}
                           , secert_key)
        return jsonify({'token' : token.decode('UTF-8')})

    # need to add publickey and private key while generating tokens
    return make_response("couldn't verify", 401)

if __name__ == "__main__":
    app.run()
