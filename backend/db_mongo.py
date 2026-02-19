from pymongo import MongoClient

def get_mongo_db():
    client = MongoClient(
        "mongodb://root:examplepassword@mongodb:27017/"
    )
    db = client["register_log"]
    return db
