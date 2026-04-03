import os
import pymysql


def get_mysql_db():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT", "4000")),
        cursorclass=pymysql.cursors.DictCursor,
        ssl={"ssl": {}}
    )
