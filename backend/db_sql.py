import os
import pymysql


def get_mysql_db():
    return pymysql.connect(
        host=os.getenv("MYSQL_HOST", "mysql"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", "examplepassword"),
        database=os.getenv("MYSQL_DATABASE", "db_init"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        cursorclass=pymysql.cursors.DictCursor,
    )
