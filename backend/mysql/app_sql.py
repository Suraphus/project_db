from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

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

    email = data["email"]
    password = data["password"]
    firstname = data["firstname"]
    lastname = data["lastname"]
    student_id = data["student_id"]

    try:

        # create user
        sql_user = """
        INSERT INTO user (email,password)
        VALUES (%s,%s)
        """

        cursor.execute(sql_user, (email,password))
        db.commit()

        user_id = cursor.lastrowid

        # create profile
        sql_profile = """
        INSERT INTO profile_student (user_id,student_id,firstname,lastname)
        VALUES (%s,%s,%s,%s)
        """

        cursor.execute(sql_profile, (
            user_id,
            student_id,
            firstname,
            lastname
        ))

        db.commit()

        return jsonify({
            "token": str(user_id),
            "user": {
                "user_id": user_id,
                "email": email,
                "firstname": firstname,
                "lastname": lastname,
                "student_id": student_id
            }
        })

    except Exception as e:
        return jsonify({"message": str(e)}), 400

    


@app.route("/auth/login", methods=["POST"])
def login():

    data = request.json

    sql = """
    SELECT
        user.user_id,
        user.email,
        profile_student.firstname,
        profile_student.lastname,
        profile_student.student_id
    FROM user
    JOIN profile_student
        ON user.user_id = profile_student.user_id
    WHERE email=%s AND password=%s
    """

    cursor.execute(sql, (
        data["email"],
        data["password"]
    ))

    user = cursor.fetchone()

    if user:

        return jsonify({
            "token": str(user["user_id"]),
            "user": user
        })

    return jsonify({"message": "Invalid login"}), 401


@app.route("/courts",methods=["GET"])
def get_courts():
    cursor.execute("SELECT * from courts")
    courts = cursor.fetchall()
    return jsonify(courts)

@app.route("/timeslots")
def get_timeslots():

    court_id = request.args.get("court_id")

    sql = """
    SELECT *
    FROM TimeSlot
    WHERE court_id=%s
    """

    cursor.execute(sql, (court_id,))
    slots = cursor.fetchall()

    return jsonify(slots)

@app.route("/booking/slots")
def booked_slots():
    court_id = request.args.get("court_id")
    date = request.args.get("date")

    sql = "SELECT * FROM booking WHERE court_id = %s and date = %s"
    cursor.execute(sql,(court_id,date))
    slots = cursor.fetchall()

    return jsonify(slots)

@app.route("/bookings",methods = ["POST"])
def create_booking():

    token = request.headers.get("Authorization")
    user_id = token.replace("Bearer ", "")
    data = request.json

    sql = "INSERT INTO booking (user_id,court_id,date,time_id) VALUES (%s,%s,%s,%s)"

    cursor.execute(sql, (
        user_id,
        data["court_id"],
        data["date"],
        data["time_id"]
    ))
    db.commit()
    return jsonify({"message": "booking success"})


@app.route("/bookings/my")
def my_bookings():

    token = request.headers.get("Authorization")
    user_id = token.replace("Bearer ", "")

    sql = """
    SELECT
        booking.booking_id,
        courts.name as court_name,
        booking.date,
        booking.time_id,
        booking.status
    FROM booking
    JOIN courts ON courts.court_id = booking.court_id
    WHERE booking.user_id=%s
    ORDER BY booking.create_at DESC
    """

    cursor.execute(sql, (user_id,))
    bookings = cursor.fetchall()

    return jsonify(bookings)


@app.route("/bookings/<int:id>/cancel", methods=["PATCH"])
def cancel_booking(id):

    sql = "UPDATE booking SET status='cancelled' WHERE booking_id=%s"
    cursor.execute(sql, (id,))
    db.commit()
    return jsonify({"message": "cancelled"})



if __name__ == "__main__":
    app.run(debug=True)