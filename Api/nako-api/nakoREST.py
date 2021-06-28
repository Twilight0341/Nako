from sqllite import connect_db
import logging
import os
import io
import sys
from util import *
from flask import Flask, request, make_response, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
import string
import random
import qrcode
import base64
import json

host = "localhost"
port = "5000"

app = Flask(__name__)
api = Api(app)

cors = CORS(app, resources={r"/*": {"origins": "*"}})


# app.config['CORS_HEADERS'] = 'Content-Type'


def getip():
    return str(request.remote_addr)


def checklogin(usr, pwd, mode=0):
    login_query = "SELECT user FROM login where user='{u}'".format(u=usr)
    # print(login_query)
    db_query = connect_db(login_query)
    if len(db_query) == 1 and mode == 0:  # find username in db
        query = "SELECT pw FROM login where user='{u}' AND pw='{p}'".format(u=usr, p=pwd)
        if len(connect_db(query)) == 1:
            return True

    if mode == 1:
        db_query = connect_db("SELECT type FROM login where user='{u}'".format(u=usr))
        return db_query


def register(pin):
    query = "SELECT pin FROM register where pin={p} and is_used=0".format(p=pin)
    rquery = connect_db(query)
    if len(rquery) == 1:
        return True
    else:
        print(return_timestamp(), getip(), "no such pin or pin is used")
        logging.info("no such pin or pin is used")
        return False


def rng():
    xx = ""
    x = 0
    while x < 40:
        y = random.choice(string.ascii_letters)
        xx = xx + y
        x += 1
    return xx


def genpin(id):
    str = rng()
    print(str)
    query = """insert into qr (temp,id) values ('{temp}','{id}')""".format(temp=str, id=id)
    if connect_db(query):
        print('yes')
    else:
        print('ignore the above constraint failed')
        q = """update qr set temp='{t}' where id ={id} """.format(t=str, id=id)
        connect_db(q)
    return str


def genqr(str):
    ip = "localhost"  # put ur ip here
    port = 5000
    blob = qrcode.make("""http://{ip}:{p}/scan/{str}""".format(ip=ip, p=port, str=str))
    return blob


def qrsta(id):
    q = "select id from qr where status = 1 and id = '{}'".format(id)
    if len(connect_db(q)) == 1:
        return True


def saveq(obj):
    try:
        new_path = './qbank.json'
        file = open(new_path, 'w')
        output = json.dumps(obj)
        file.write(output)
    except exception as e:
        print("Error :")
        print(e)


def getq():
    try:
        with open('./qbank.json') as f:
            return json.load(f)
    except:
        return False


class NakoREST(Resource):
    def get(self):
        print(getip())
        return {'hello': 'world', 'ur_ip': getip()}, 201


class Login(Resource):
    def post(self, login_usr, login_pwd):
        print(return_timestamp(), getip(), 'Login Post Request Received')
        logging.info('Login Post Request Received')
        if checklogin(login_usr, login_pwd):
            print(return_timestamp(), getip(), 'login success')
            logging.info('login success')
            acctype = checklogin(login_usr, login_pwd, 1)
            acctypestr = str(acctype[0])
            acctypestr = acctypestr[1]
            return {'login_usr': login_usr, 'reason': 'success', 'type': '{t}'.format(t=acctypestr)}, 201
        else:
            print(return_timestamp(), getip(), 'login failed')
            logging.info('login failed')
            return {'reason': 'failed'}, 201


class Register(Resource):
    def post(self, pin, email, pw, con):
        print(return_timestamp(), getip(), 'Register Post Request Received')
        logging.info(return_timestamp() + getip() + 'Register Post Request Received')
        if register(pin):
            if pw == pw:
                query = "insert into login (user,pw,type) values ('{u}','{pw}','{t}')".format(u=pin, pw=pw,
                                                                                              t=0)
                query2 = "update register set is_used=1 where is_used=0 and pin={p}".format(p=pin)
                connect_db(query)
                connect_db(query2)
                print("Register Successful")
                logging.info("Register Successful")
                return {'reason': 'success'}
            else:
                print("Register Failed: pw")
                logging.info("Register Failed")
                return {'reason': 'failed'}
        else:
            print("Register Failed")
            logging.info("Register Failed")
            return {'reason': 'failed'}


class qr(Resource):
    def get(self, id):
        print(return_timestamp(), getip(), 'QR Get Request Received')
        logging.info(return_timestamp() + getip() + 'QR Get Request Received')
        str = genpin(id)
        img = genqr(str)
        img.show()
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_byte_arr = img_byte_arr.getvalue()
        b64 = base64.b64encode(img_byte_arr)
        string = b64.decode('utf-8')
        # print(string)
        return {'img': '{}'.format(string)}, 201


class scan(Resource):
    def get(self, rng, info):
        print(return_timestamp(), getip(), 'scan Get Request Recived')
        logging.info(return_timestamp() + getip() + 'scan Get Request Received')
        print(rng)
        q = "update qr set status = 1, info = '{i}' where temp = '{t}'".format(i=info, t=rng)
        connect_db(q)
        return {'scan': info}, 201


class checkqr(Resource):
    def get(self, id):
        print(id)
        try:
            if qrsta(id):
                q = """select info from qr where id = '{}'""".format(id)
                info = connect_db(q)
                i = info[0][0]
                print(json.loads(i))

                # info = list2str(info)
                # i = info.replace(" ", "")
                # i = i.replace("'", "").replace("[", "").replace("]", "").replace("(", "").replace(")", "")
                # return {'info': jsonify(json.loads(info[0][0]))}, 201
                return make_response(jsonify(json.loads(i)), 201)
            else:
                return make_response('null', 200)
        except Exception as e:
            print(e)
            return {'status': '500'}, 500


class cls(Resource):
    def get(self, table):
        if table == 'qr':
            print("Wiped table : qr")
            connect_db('delete from qr')
            return {table: 'wiped'}, 201
        else:
            return 404


class qbank(Resource):
    def post(self):
        try:
            json_data = request.get_json(force=True)
            if json_data["questions"]:
                # print(json_data)
                saveq(json_data)
                return "Success", 201, {'Access-Control-Allow-Origin': '*'}
            else:
                return "Empty object", 200
        except:
            return "Probably body is empty or some errors", 200


class qbank_get(Resource):
    def get(self):
        try:
            q = getq()
            if (q):
                return q, 201
            else:
                return "failed", 200
        except:
            return "Error occurs", 200


api.add_resource(NakoREST, '/')
api.add_resource(Login, '/login/<string:login_usr>/<string:login_pwd>')
api.add_resource(Register, '/register/<string:pin>/<string:email>/<string:pw>/<string:con>')
api.add_resource(qr, '/qr/<string:id>')
api.add_resource(scan, '/scan/<string:rng>/<string:info>')
api.add_resource(checkqr, '/check/<string:id>')
api.add_resource(cls, '/cls/<string:table>')
api.add_resource(qbank, '/qbank')
api.add_resource(qbank_get, '/qbank_get')


def main():
    app.run("0.0.0.0", port, debug=True)


if __name__ == '__main__':
    try:
        print(return_timestamp(), 'development api server running at {h}:{p}'.format(h=host, p=port))
        msg = 'development api server running at {h}:{p}'.format(h=host, p=port)
        logging.info(return_timestamp() + msg)
        main()
    except KeyboardInterrupt as k:
        print(return_timestamp(), "keyboardInterrupt")
        logging.warning("keyboardInterrupt")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
