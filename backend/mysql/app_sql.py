rom flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = flack(__name__)
CORS(app_sql)

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="rootpassword",
    database="db_init"
)

cursor = db.cursor(dictionary=True)

@app.route("/")
def home():
    return "flask + Mysql working"
@app.route("/auth/register", methods=["POST"])
def register():
    data = request.json
    name = data["name"]
    email = data["email"]
    passowrd = data["password"]
    student_id = data["student_id"]

    query_user = "INSERT into user (role,email,password) VALUES (%s,%s,%s,%s)"
    query_profile_student = "INSERT into profile_student (student_id,name) VALUES(%s,%s)"
    
    cursor.execute(query_user, ("student",email,password))
    cursor.execute(query_profile_student,(student_id,name))
    db.commit()
    return jsonify({
        "message": "register success"
    })
