from flask import Flask, request, jsonify, session
from dotenv import load_dotenv
from werkzeug.security import check_password_hash, generate_password_hash
from db_mongo import get_mongo_db
from db_sql import get_mysql_db
from flask_cors import CORS
import os
import time

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")
app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False
)
CORS(app,
     supports_credentials=True,
     resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}},
     methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

db_mongo = get_mongo_db()


def get_db_sql():
    for _ in range(20):
        try:
            return get_mysql_db()
        except Exception:
            time.sleep(1)
    return get_mysql_db()


PORT = os.getenv("PORT")

@app.route("/")
def home():
    return "flask + Mysql working"

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    db = get_db_sql()
    cursor = db.cursor()

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
            db.commit()

            return jsonify({"status": "success"})
        else:
            return jsonify({"status": "failed"})
            
    except Exception as e:
        db.rollback()
        return jsonify({"message": str(e)}), 400
    finally:
        cursor.close()
        db.close()

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    db = get_db_sql()
    cursor = db.cursor()

    try:
        email = data["email"]
        password = data["password"]

        cursor.execute("SELECT * FROM user WHERE email=%s", (email,))
        user = cursor.fetchone()

        if user and check_password_hash(user["password"], password):
            cursor.execute("""
                SELECT
                    user.user_id,
                    user.email,
                    user.role,
                    profile_student.firstname,
                    profile_student.lastname,
                    profile_student.student_id
                FROM user
                LEFT JOIN profile_student
                    ON user.user_id = profile_student.user_id
                WHERE user.user_id=%s
            """, (user["user_id"],))

            profile = cursor.fetchone()
            if not profile:
                return jsonify({"message": "User profile not found"}), 404

            session["user_id"] = profile["user_id"]
            session["firstname"] = profile.get("firstname")
            session["lastname"] = profile.get("lastname")
            session["student_id"] = profile.get("student_id")
            session["role"] = profile["role"]
            return jsonify({"message": "success"})

        return jsonify({"message": "Wrong Email or Password"}), 401
    finally:
        cursor.close()
        db.close()

@app.route("/api/me")
def get_current_user():
    if "user_id" not in session:
        return jsonify({"message": "Not logged in"}), 401

    db = get_db_sql()
    cursor = db.cursor()

    try:
        cursor.execute("""
            SELECT
                user.user_id,
                user.email,
                user.role,
                profile_student.firstname,
                profile_student.lastname,
                profile_student.student_id
            FROM user
            LEFT JOIN profile_student
            ON user.user_id = profile_student.user_id
            WHERE user.user_id=%s
        """, (session["user_id"],))

        profile = cursor.fetchone()
        if not profile:
            return jsonify({"message": "User not found"}), 404

        return jsonify(profile)
    finally:
        cursor.close()
        db.close()

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "logged out"})


def is_admin():
    user_id = session.get("user_id")
    if not user_id:
        return False

    db = get_db_sql()
    cursor = db.cursor()
    cursor.execute("SELECT role FROM user WHERE user_id=%s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    db.close()
    return bool(user and user["role"] == "admin")
    
@app.route("/api/admin/users", methods=["GET"])
def list_users():
    if not is_admin():
        return jsonify({"message": "Forbidden"}), 403

    db = get_db_sql()
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT
            user.user_id,
            user.email,
            user.role,
            profile_student.student_id,
            profile_student.firstname,
            profile_student.lastname
        FROM user
        LEFT JOIN profile_student ON profile_student.user_id = user.user_id
        ORDER BY user.created_at DESC
        """
    )
    users = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(users)


@app.route("/api/admin/users/<int:target_user_id>/kick", methods=["DELETE"])
def kick_user(target_user_id):
    if not is_admin():
        return jsonify({"message": "Forbidden"}), 403

    if session.get("user_id") == target_user_id:
        return jsonify({"message": "You cannot kick yourself"}), 400

    db = get_db_sql()
    cursor = db.cursor()
    cursor.execute("SELECT role FROM user WHERE user_id=%s", (target_user_id,))
    user = cursor.fetchone()
    if not user:
        return jsonify({"message": "User not found"}), 404
    if user["role"] == "admin":
        return jsonify({"message": "Cannot kick another admin"}), 400

    try:
        cursor.execute("DELETE FROM user WHERE user_id=%s", (target_user_id,))
        db.commit()
        return jsonify({"message": "User kicked"})
    except Exception as e:
        db.rollback()
        return jsonify({"message": str(e)}), 400
    finally:
        cursor.close()
        db.close()


@app.route("/api/admin/logs", methods=["GET"])
def get_logs():
    if not is_admin():
        return jsonify({"message": "Forbidden"}), 403

    db = get_db_sql()
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT
            booking.booking_id,
            booking.status,
            booking.date,
            booking.create_at,
            user.user_id,
            user.email,
            profile_student.firstname,
            profile_student.lastname,
            courts.name AS court_name
        FROM booking
        JOIN user ON user.user_id = booking.user_id
        LEFT JOIN profile_student ON profile_student.user_id = user.user_id
        JOIN courts ON courts.court_id = booking.court_id
        ORDER BY booking.create_at DESC
        LIMIT 100
        """
    )
    logs = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(logs)

@app.route("/api/bookings", methods=["GET"])
def get_user_bookings():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"})
    
    db = get_db_sql()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM booking WHERE user_id = %s", (user_id,))
    
    user_booking = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(user_booking)

@app.route("/api/get_field", methods=["GET"])
def get_field():
    db = get_db_sql()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM courts")

    all_field = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(all_field)
    
@app.route("/api/admin/facilities", methods=["POST"])
def add_field():
    if not is_admin():
        return jsonify({"message": "Forbidden"}), 403
    
    db = get_db_sql()
    cursor = db.cursor()
    try:
        data = request.json

        name = data["name"]
        location = data["location"]
        type = data["type"]
        surface = data["surface"]
        status = data["status"]
        max_pp = data["max_pp"]
        img_url = data["image_url"]

        cursor.execute("INSERT INTO courts (name, location, type, surface, status, max_pp, img_url) VALUE (%s,%s,%s,%s,%s,%s,%s)"
                    ,(name, location, type, surface, status, max_pp, img_url))
        
        db.commit()
        return jsonify({"message": "Facility created"})
    except Exception as e:
        db.rollback()
        return jsonify({"message": str(e)}), 400
    finally:
        cursor.close()
        db.close()
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



@app.route("/api/bookings/<int:booking_id>/cancel", methods=["PATCH"])
def cancel_booking(booking_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = get_db_sql()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT user_id, status FROM booking WHERE booking_id = %s", (booking_id,))
        booking = cursor.fetchone()
        
        if not booking:
            return jsonify({"error": "Booking not found"}), 404
            
        if booking["user_id"] != user_id:
            return jsonify({"error": "Forbidden"}), 403
            
        if booking["status"] == "cancelled":
            return jsonify({"error": "Already cancelled"}), 400
            
        cursor.execute("DELETE FROM booking WHERE booking_id=%s", (booking_id,))
        db.commit()
        return jsonify({"message": "Booking cancelled successfully"})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        db.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(PORT))
