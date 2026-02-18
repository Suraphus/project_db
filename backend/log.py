from flask import Flask, request, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash
from db import get_db
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "supersecretkey"
CORS(app, supports_credentials=True)

db = get_db()

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = db.user.find_one({"email": email})

    if user and check_password_hash(user["password"], password):
        session["user_id"] = str(user["_id"])
        return jsonify({"status": "success"})
    else:
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json

    user = {
        "studentId": data.get("studentId"),
        "name": data.get("name"),
        "surname": data.get("surname"),
        "email": data.get("email"),
        "password": generate_password_hash(data.get("password"))
    }

    db.user.insert_one(user)

    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(debug=True, port=6500)