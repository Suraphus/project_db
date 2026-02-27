from flask import Flask, request, jsonify, session
from dotenv import load_dotenv
from werkzeug.security import check_password_hash, generate_password_hash
from db_mongo import get_db
from flask_cors import CORS
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = "supersecretkey"
CORS(app, supports_credentials=True, origins="http://localhost:5173")


PORT = os.getenv("PORT")

@app.route("/api/login", methods=["POST"])
def login():
    db = get_db()
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
    try:
        db = get_db()
        data = request.json

        # Validate required fields
        required_fields = ["studentId", "name", "surname", "email", "password"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"status": "error", "message": f"please fill {field}"}), 400

        # Check duplicate email
        if db.user.find_one({"email": data.get("email")}):
            return jsonify({"status": "error", "message": "email has been used"}), 409

        # Check duplicate studentId
        if db.user.find_one({"studentId": data.get("studentId")}):
            return jsonify({"status": "error", "message": "studentId has been used"}), 409

        user = {
            "studentId": data.get("studentId"),
            "name": data.get("name"),
            "surname": data.get("surname"),
            "email": data.get("email"),
            "password": generate_password_hash(data.get("password"))
        }

        db.user.insert_one(user)

        return jsonify({"status": "success"})
    except Exception as e:
        print(e)
        return jsonify({"status": "error", "message": "server error"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=PORT)
