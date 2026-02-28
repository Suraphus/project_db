from flask import Flask, request, jsonify, session, has_request_context
from dotenv import load_dotenv
from werkzeug.security import check_password_hash, generate_password_hash
from db_mongo import get_mongo_db
from db_sql import get_mysql_db
from flask_cors import CORS
import os
import time
from datetime import datetime

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


def parse_date_or_none(raw_date):
    try:
        return datetime.strptime(raw_date, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


AUTH_ACTIONS = {"login", "logout"}
BOOKING_ACTIONS = {"book", "cancel"}


def log_activity(action, user_id=None, status="success", detail=None):
    if action in AUTH_ACTIONS:
        collection = db_mongo["auth_logs"]
    elif action in BOOKING_ACTIONS:
        collection = db_mongo["booking_logs"]
    else:
        collection = db_mongo["activity_logs"]

    try:
        ip_address = None
        if has_request_context():
            ip_address = request.headers.get("X-Forwarded-For", request.remote_addr)
            if ip_address and "," in ip_address:
                ip_address = ip_address.split(",")[0].strip()

        if detail is None:
            detail = {}
        elif not isinstance(detail, (dict, list)):
            detail = {"message": str(detail)}

        collection.insert_one(
            {
                "user_id": user_id,
                "action": action,
                "status": status,
                "detail": detail,
                "ip_address": ip_address,
                "created_at": datetime.utcnow(),
            }
        )
    except Exception:
        pass


def _serialize_mongo_logs(rows):
    result = []
    for row in rows:
        item = dict(row)
        item.pop("_id", None)
        created_at = item.get("created_at")
        if isinstance(created_at, datetime):
            item["created_at"] = created_at.isoformat()
        result.append(item)
    return result

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
            log_activity(
                action="login",
                user_id=profile["user_id"],
                status="success",
                detail={"email": email},
            )
            return jsonify({"message": "success"})

        log_activity(
            action="login",
            user_id=user["user_id"] if user else None,
            status="failed",
            detail={"email": email, "reason": "Wrong Email or Password"},
        )
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
    user_id = session.get("user_id")
    session.clear()
    log_activity(action="logout", user_id=user_id, status="success")
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

    limit_raw = request.args.get("limit")
    try:
        limit = min(max(int(limit_raw or 200), 1), 1000)
    except ValueError:
        limit = 200

    rows = list(
        db_mongo["booking_logs"]
        .find({}, {"_id": 0})
        .sort("created_at", -1)
        .limit(limit)
    )
    return jsonify(_serialize_mongo_logs(rows))


@app.route("/api/admin/activity-logs", methods=["GET"])
def get_activity_logs():
    if not is_admin():
        return jsonify({"message": "Forbidden"}), 403

    scope = (request.args.get("scope") or "all").lower()
    limit_raw = request.args.get("limit")
    try:
        limit = min(max(int(limit_raw or 200), 1), 1000)
    except ValueError:
        limit = 200

    if scope == "auth":
        rows = list(
            db_mongo["auth_logs"].find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
        )
        return jsonify(_serialize_mongo_logs(rows))

    if scope == "booking":
        rows = list(
            db_mongo["booking_logs"].find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
        )
        return jsonify(_serialize_mongo_logs(rows))

    auth_rows = list(
        db_mongo["auth_logs"].find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    )
    booking_rows = list(
        db_mongo["booking_logs"].find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    )
    merged = sorted(
        auth_rows + booking_rows,
        key=lambda x: x.get("created_at", datetime.min),
        reverse=True,
    )[:limit]
    return jsonify(_serialize_mongo_logs(merged))

@app.route("/api/bookings", methods=["GET"])
def get_user_bookings():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = get_db_sql()
    cursor = db.cursor()
    cursor.execute("""
        SELECT 
            booking.*, 
            courts.name AS court_name,
            lobby_time_slot.time_slot_id AS time_id,
            TIME_FORMAT(time_slot.start_time, '%%H:%%i') AS start_time,
            TIME_FORMAT(time_slot.end_time, '%%H:%%i') AS end_time
        FROM booking 
        JOIN courts ON booking.court_id = courts.court_id
        JOIN lobby_time_slot ON booking.lobby_time_id = lobby_time_slot.lobby_time_id
        JOIN time_slot ON lobby_time_slot.time_slot_id = time_slot.time_slot_id
        WHERE booking.user_id = %s
        ORDER BY booking.create_at DESC
    """, (user_id,))
    
    user_booking = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(user_booking)


@app.route("/api/bookings", methods=["POST"])
def create_booking():
    user_id = session.get("user_id")
    if not user_id:
        log_activity(action="book", user_id=None, status="failed", detail="Unauthorized")
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    court_id = data.get("court_id")
    time_slot_id = data.get("time_slot_id")
    date_raw = data.get("date")

    if court_id is None or time_slot_id is None or not date_raw:
        log_activity(
            action="book",
            user_id=user_id,
            status="failed",
            detail="court_id, time_slot_id and date are required",
        )
        return jsonify({"error": "court_id, time_slot_id and date are required"}), 400

    try:
        court_id = int(court_id)
        time_slot_id = int(time_slot_id)
    except (TypeError, ValueError):
        log_activity(
            action="book",
            user_id=user_id,
            status="failed",
            detail={"court_id": court_id, "time_slot_id": time_slot_id, "reason": "invalid ids"},
        )
        return jsonify({"error": "court_id and time_slot_id must be numbers"}), 400

    booking_date = parse_date_or_none(date_raw)
    if booking_date is None:
        log_activity(
            action="book",
            user_id=user_id,
            status="failed",
            detail={"date": date_raw, "reason": "invalid date format"},
        )
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    db = get_db_sql()
    cursor = db.cursor()
    try:
        cursor.execute(
            """
            SELECT booking.booking_id
            FROM booking
            JOIN lobby_time_slot ON booking.lobby_time_id = lobby_time_slot.lobby_time_id
            WHERE booking.user_id = %s
              AND booking.court_id = %s
              AND lobby_time_slot.time_slot_id = %s
              AND booking.date = %s
            LIMIT 1
            """,
            (user_id, court_id, time_slot_id, booking_date)
        )
        conflict = cursor.fetchone()
        if conflict:
            log_activity(
                action="book",
                user_id=user_id,
                status="failed",
                detail={
                    "booking_id": conflict["booking_id"],
                    "court_id": court_id,
                    "time_slot_id": time_slot_id,
                    "date": booking_date.isoformat(),
                    "reason": "already booked by this user",
                },
            )
            return jsonify({"error": "You already booked this time slot"}), 409

        cursor.execute(
            "CALL make_booking(%s, %s, %s, %s)",
            (user_id, court_id, time_slot_id, booking_date)
        )
        while cursor.nextset():
            pass

        cursor.execute(
            """
            SELECT booking.booking_id
            FROM booking
            JOIN lobby_time_slot ON booking.lobby_time_id = lobby_time_slot.lobby_time_id
            WHERE booking.user_id = %s
              AND booking.court_id = %s
              AND lobby_time_slot.time_slot_id = %s
              AND booking.date = %s
            ORDER BY booking.booking_id DESC
            LIMIT 1
            """,
            (user_id, court_id, time_slot_id, booking_date)
        )
        created_booking = cursor.fetchone()
        db.commit()
        log_activity(
            action="book",
            user_id=user_id,
            status="success",
            detail={
                "booking_id": created_booking["booking_id"] if created_booking else None,
                "court_id": court_id,
                "time_slot_id": time_slot_id,
                "date": booking_date.isoformat(),
            },
        )
        return jsonify({"message": "Booking created"}), 201
    except Exception as e:
        db.rollback()
        log_activity(
            action="book",
            user_id=user_id,
            status="failed",
            detail={
                "court_id": court_id,
                "time_slot_id": time_slot_id,
                "date": booking_date.isoformat(),
                "error": str(e),
            },
        )
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        db.close()


@app.route("/api/courts/<int:court_id>/slots", methods=["GET"])
def get_court_slots(court_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    date_raw = request.args.get("date")
    booking_date = parse_date_or_none(date_raw)
    if booking_date is None:
        return jsonify({"error": "date query is required in YYYY-MM-DD format"}), 400

    db = get_db_sql()
    cursor = db.cursor()
    try:
        cursor.execute(
            """
            SELECT
                time_slot.time_slot_id,
                TIME_FORMAT(time_slot.start_time, '%%H:%%i') AS start_time,
                TIME_FORMAT(time_slot.end_time, '%%H:%%i') AS end_time,
                lobby_time_slot.lobby_time_id,
                COALESCE(lobby_time_slot.cur_pp, 0) AS cur_pp,
                COALESCE(lobby_time_slot.max_pp, courts.max_pp) AS max_pp,
                CASE
                    WHEN my_booking.booking_id IS NULL THEN 0
                    ELSE 1
                END AS is_my_booking
            FROM time_slot
            CROSS JOIN courts
            LEFT JOIN lobby_time_slot
                ON lobby_time_slot.court_id = courts.court_id
                AND lobby_time_slot.time_slot_id = time_slot.time_slot_id
                AND lobby_time_slot.date = %s
            LEFT JOIN booking AS my_booking
                ON my_booking.lobby_time_id = lobby_time_slot.lobby_time_id
                AND my_booking.user_id = %s
            WHERE courts.court_id = %s
            ORDER BY time_slot.start_time
            """,
            (booking_date, user_id, court_id)
        )
        rows = cursor.fetchall()

        slots = []
        for row in rows:
            row["is_full"] = row["cur_pp"] >= row["max_pp"]
            row["is_my_booking"] = bool(row["is_my_booking"])
            slots.append(row)

        return jsonify({
            "court_id": court_id,
            "date": booking_date.isoformat(),
            "slots": slots,
        })
    finally:
        cursor.close()
        db.close()

@app.route("/api/get_field", methods=["GET"])
def get_field():
    db = get_db_sql()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM courts")

    all_field = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(all_field)
    
@app.route("/api/admin/time_slots", methods=["GET"])
def get_all_time_slots():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Check if admin
    db = get_db_sql()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT role FROM user WHERE user_id = %s", (user_id,))
        user_role = cursor.fetchone()
        if not user_role or user_role["role"] != "admin":
            return jsonify({"error": "Admin access required"}), 403

        cursor.execute("SELECT time_slot_id, TIME_FORMAT(start_time, '%H:%i') as start_time, TIME_FORMAT(end_time, '%H:%i') as end_time FROM time_slot ORDER BY start_time")
        slots = cursor.fetchall()
        return jsonify(slots)
    finally:
        cursor.close()
        db.close()

@app.route("/api/admin/time_slots/batch", methods=["POST"])
def batch_create_time_slots():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Check if admin
    db = get_db_sql()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT role FROM user WHERE user_id = %s", (user_id,))
        user_role = cursor.fetchone()
        if not user_role or user_role["role"] != "admin":
            return jsonify({"error": "Admin access required"}), 403

        data = request.json
        start_h = int(data.get("start_hour", 8))
        end_h = int(data.get("end_hour", 22))
        duration = int(data.get("duration_minutes", 60))

        from datetime import time as dt_time, timedelta, datetime as dt_datetime

        current_time = dt_datetime.combine(dt_datetime.today(), dt_time(start_h, 0))
        end_limit = dt_datetime.combine(dt_datetime.today(), dt_time(end_h, 0))

        created_count = 0
        while current_time + timedelta(minutes=duration) <= end_limit:
            slot_start = current_time.strftime("%H:%M:%S")
            current_time += timedelta(minutes=duration)
            slot_end = current_time.strftime("%H:%M:%S")

            cursor.execute(
                "INSERT INTO time_slot (start_time, end_time) VALUES (%s, %s)",
                (slot_start, slot_end)
            )
            created_count += 1
        
        db.commit()
        return jsonify({"message": f"Created {created_count} time slots", "count": created_count})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        db.close()

@app.route("/api/admin/time_slots/<int:slot_id>", methods=["DELETE"])
def delete_time_slot(slot_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = get_db_sql()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT role FROM user WHERE user_id = %s", (user_id,))
        user_role = cursor.fetchone()
        if not user_role or user_role["role"] != "admin":
            return jsonify({"error": "Admin access required"}), 403

        cursor.execute("DELETE FROM time_slot WHERE time_slot_id = %s", (slot_id,))
        db.commit()
        return jsonify({"message": "Time slot deleted"})
    finally:
        cursor.close()
        db.close()

@app.route("/api/admin/mock_data", methods=["POST"])
def create_mock_data():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    db = get_db_sql()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT role FROM user WHERE user_id = %s", (user_id,))
        user_role = cursor.fetchone()
        if not user_role or user_role["role"] != "admin":
            return jsonify({"error": "Admin access required"}), 403

        # Mock Courts
        mock_courts = [
            ("Football Arena", "Zone A", "football", "Artificial Grass", "available", 14, "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800"),
            ("Grand Tennis Court", "Zone B", "tennis", "Hard Court", "available", 4, "https://images.unsplash.com/photo-1595435064219-c7813d162391?auto=format&fit=crop&q=80&w=800")
        ]

        for court in mock_courts:
            cursor.execute(
                "INSERT INTO courts (name, location, type, surface, status, max_pp, img_url) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                court
            )
        
        db.commit()
        return jsonify({"message": "Mock courts created successfully"})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        db.close()

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
        type = data["type"].lower()
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
    

@app.route("/api/fields/<int:field_id>", methods=["DELETE"])
def delete_field(field_id):
    if not is_admin():
        return jsonify({"message": "Forbidden"}), 403

    db = get_db_sql()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT court_id FROM courts WHERE court_id=%s", (field_id,))
        field = cursor.fetchone()
        if not field:
            return jsonify({"message": "Field not found"}), 404

        cursor.execute("DELETE FROM courts WHERE court_id=%s", (field_id,))
        db.commit()
        return jsonify({"message": "Field deleted successfully"})
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
        log_activity(action="cancel", user_id=None, status="failed", detail="Unauthorized")
        return jsonify({"error": "Unauthorized"}), 401
    
    db = get_db_sql()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT user_id, status FROM booking WHERE booking_id = %s", (booking_id,))
        booking = cursor.fetchone()
        
        if not booking:
            log_activity(
                action="cancel",
                user_id=user_id,
                status="failed",
                detail={"booking_id": booking_id, "reason": "Booking not found"},
            )
            return jsonify({"error": "Booking not found"}), 404
            
        if booking["user_id"] != user_id:
            log_activity(
                action="cancel",
                user_id=user_id,
                status="failed",
                detail={"booking_id": booking_id, "reason": "Forbidden"},
            )
            return jsonify({"error": "Forbidden"}), 403
            
        if booking["status"] == "cancelled":
            log_activity(
                action="cancel",
                user_id=user_id,
                status="failed",
                detail={"booking_id": booking_id, "reason": "Already cancelled"},
            )
            return jsonify({"error": "Already cancelled"}), 400
            
        cursor.execute("DELETE FROM booking WHERE booking_id=%s", (booking_id,))
        db.commit()
        log_activity(
            action="cancel",
            user_id=user_id,
            status="success",
            detail={"booking_id": booking_id},
        )
        return jsonify({"message": "Booking cancelled successfully"})
    except Exception as e:
        db.rollback()
        log_activity(
            action="cancel",
            user_id=user_id,
            status="failed",
            detail={"booking_id": booking_id, "error": str(e)},
        )
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        db.close()

@app.route("/api/quickjoin", methods=["GET"])
def get_quickjoin_slots():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db_sql()
    # ใช้แค่ db.cursor() เปล่าๆ เพราะระบบคุณตั้งค่าให้คืนค่าเป็น Dict ไว้อยู่แล้ว
    cursor = db.cursor() 
    try:
        cursor.execute(
            """
            SELECT 
                courts.court_id,
                courts.name AS field_name,
                courts.type AS sport_name,
                time_slot.time_slot_id,
                TIME_FORMAT(time_slot.start_time, '%%H:%%i') AS start_time,
                TIME_FORMAT(time_slot.end_time, '%%H:%%i') AS end_time,
                lobby_time_slot.lobby_time_id,
                COALESCE(lobby_time_slot.cur_pp, 0) AS cur_pp,
                COALESCE(lobby_time_slot.max_pp, courts.max_pp) AS max_pp
            FROM lobby_time_slot
            JOIN courts ON lobby_time_slot.court_id = courts.court_id
            JOIN time_slot ON lobby_time_slot.time_slot_id = time_slot.time_slot_id
            WHERE lobby_time_slot.date = CURDATE()
              AND time_slot.start_time > CURTIME()
              -- ใช้เครื่องหมายหาร 2 ปกติ ระบบจะจัดการทศนิยมให้เอง ป้องกัน Error จากฟังก์ชัน CEIL
              AND COALESCE(lobby_time_slot.cur_pp, 0) >= (COALESCE(lobby_time_slot.max_pp, courts.max_pp) / 2)
              AND COALESCE(lobby_time_slot.cur_pp, 0) < COALESCE(lobby_time_slot.max_pp, courts.max_pp)
              AND NOT EXISTS (
                  SELECT 1 FROM booking 
                  WHERE booking.lobby_time_id = lobby_time_slot.lobby_time_id 
                    AND booking.user_id = %s
              )
            ORDER BY (COALESCE(lobby_time_slot.cur_pp, 0) / COALESCE(lobby_time_slot.max_pp, courts.max_pp)) DESC, time_slot.start_time ASC
            LIMIT 6;
            """,
            (user_id,)
        )
        
        # รับค่ามาใช้งานได้ตรงๆ เลย
        rows = cursor.fetchall()
        
        quickjoin_list = []
        for idx, row in enumerate(rows):
            quickjoin_list.append({
                "id": idx + 1,
                "sportName": row["sport_name"].capitalize() if row["sport_name"] else "Sport",
                "fieldName": row["field_name"],
                "courtId": row["court_id"],
                "date": datetime.now().strftime("%Y-%m-%d"), 
                "room": {
                    "time_slot_id": row["time_slot_id"],
                    "name": f"Slot #{row['time_slot_id']}",
                    "time": f"{row['start_time']} - {row['end_time']}",
                    "currentPlayers": int(row["cur_pp"]),
                    "maxPlayers": int(row["max_pp"])
                }
            })

        return jsonify(quickjoin_list)
    except Exception as e:
        print("QuickJoin Error:", str(e))
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        db.close()
        
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(PORT))
