import pymysql

def get_mysql_db():
    db = pymysql.connect(
        host="mysql",  # 👈 ใช้ชื่อ service
        user="root",
        # port=3307,
        password="examplepassword",
        database="db_init",
        cursorclass=pymysql.cursors.DictCursor
    )
    return db
