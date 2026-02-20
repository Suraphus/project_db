from flask import Flask, request, jsonify, session
from dotenv import load_dotenv
from werkzeug.security import check_password_hash, generate_password_hash
from db_mongo import get_mongo_db
from db_sql import get_mysql_db
from flask_cors import CORS
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = "supersecretkey"
CORS(app,
     supports_credentials=True,
     origins=["http://localhost:5173"])

db_mongo = get_mongo_db()
db_sql = get_mysql_db()


PORT = os.getenv("PORT")

@app.route("/")
def home():
    return "flask + Mysql working"

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    cursor = db_sql.cursor()

    email = data["email"]
    password = generate_password_hash(data["password"])
    firstname = data["name"]
    lastname = data["surname"]
    student_id = data["student_id"]

    try:
        # insert user (hash password!)
        cursor.execute("SELECT * FROM user WHERE email=%s", (email,))
        user = cursor.fetchone()
        if not user:
            cursor.execute(
                "INSERT INTO user (email,password) VALUES (%s,%s)",
                (email, password)
            )

            user_id = cursor.lastrowid

            # insert profile
            cursor.execute(
                "INSERT INTO profile_student (user_id,student_id,firstname,lastname) VALUES (%s,%s,%s,%s)",
                (user_id, student_id, firstname, lastname)
            )
            db_sql.commit()

            return jsonify({"status": "success"})
        else:
            return jsonify({"status": "failed"})
            
    except Exception as e:
        db_sql.rollback()
        return jsonify({"message": str(e)}), 400

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    cursor = db_sql.cursor()

    email = data["email"]
    password = data["password"]

    cursor.execute("SELECT * FROM user WHERE email=%s", (email,))
    user = cursor.fetchone()

    if user and check_password_hash(user["password"], password):

        cursor.execute("""
            SELECT
                user.user_id,
                user.email,
                profile_student.firstname,
                profile_student.lastname, 
                profile_student.student_id
            FROM user
            JOIN profile_student
                ON user.user_id = profile_student.user_id
            WHERE user.user_id=%s
        """, (user["user_id"],))

        profile = cursor.fetchone()

        session["user_id"] = profile["user_id"]
        session["firstname"] = profile["firstname"]
        session["lastname"] = profile["lastname"]
        session["student_id"] = profile["student_id"]
        return jsonify({"message": "success"})


    return jsonify({"message": "Wrong Email or Password"}), 401

@app.route("/api/me")
def get_current_user():
    if "user_id" not in session:
        return jsonify({"message": "Not logged in"}), 401

    cursor = db_sql.cursor()

    cursor.execute("""
        SELECT
            user.user_id,
            user.email,
            profile_student.firstname,
            profile_student.lastname,
            profile_student.student_id
        FROM user
        JOIN profile_student
        ON user.user_id = profile_student.user_id
        WHERE user.user_id=%s
    """, (session["user_id"],))

    profile = cursor.fetchone()

    return jsonify(profile)

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "logged out"})

    
# @app.route("/courts",methods=["GET"])
# def get_courts():
#     cursor = db_sql.cursor(dictionary=True)
#     cursor.execute("SELECT * from courts")
#     courts = cursor.fetchall()
#     return jsonify(courts)

# @app.route("/timeslots")
# def get_timeslots():
#     cursor = db_sql.cursor(dictionary=True)
#     court_id = request.args.get("court_id")

#     sql = """
#     SELECT *
#     FROM TimeSlot
#     WHERE court_id=%s
#     """

#     cursor.execute(sql, (court_id,))
#     slots = cursor.fetchall()

#     return jsonify(slots)

# @app.route("/booking/slots")
# def booked_slots():
#     cursor = db_sql.cursor(dictionary=True)
#     court_id = request.args.get("court_id")
#     date = request.args.get("date")

#     sql = "SELECT * FROM booking WHERE court_id = %s and date = %s"
#     cursor.execute(sql,(court_id,date))
#     slots = cursor.fetchall()

#     return jsonify(slots)

# @app.route("/bookings",methods = ["POST"])
# def create_booking():
#     cursor = db_sql.cursor(dictionary=True)

#     token = request.headers.get("Authorization")
#     user_id = token.replace("Bearer ", "")
#     data = request.json

#     sql = "INSERT INTO booking (user_id,court_id,date,time_id) VALUES (%s,%s,%s,%s)"

#     cursor.execute(sql, (
#         user_id,
#         data["court_id"],
#         data["date"],
#         data["time_id"]
#     ))
#     db_sql.commit()
#     return jsonify({"message": "booking success"})


# @app.route("/bookings/my")
# def my_bookings():
#     cursor = db_sql.cursor(dictionary=True)

#     token = request.headers.get("Authorization")
#     user_id = token.replace("Bearer ", "")

#     sql = """
#     SELECT
#         booking.booking_id,
#         courts.name as court_name,
#         booking.date,
#         booking.time_id,
#         booking.status
#     FROM booking
#     JOIN courts ON courts.court_id = booking.court_id
#     WHERE booking.user_id=%s
#     ORDER BY booking.create_at DESC
#     """

#     cursor.execute(sql, (user_id,))
#     bookings = cursor.fetchall()

#     return jsonify(bookings)


# @app.route("/bookings/<int:id>/cancel", methods=["PATCH"])
# def cancel_booking(id):
#     cursor = db_sql.cursor(dictionary=True)

#     sql = "UPDATE booking SET status='cancelled' WHERE booking_id=%s"
#     cursor.execute(sql, (id,))
#     db_sql.commit()
#     return jsonify({"message": "cancelled"})



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(PORT))