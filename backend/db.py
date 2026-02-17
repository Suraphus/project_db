from pymongo import MongoClient

def get_db():
    try:
        # --- Task: Database Connection ---
        # TODO: Connect to MongoDB using the 'pymongo' library.
        # TODO: The connection string should use 'localhost' and port 27017.
        # TODO: Authentication may be required (check docker-compose.yml).
        # TODO: Assign the MongoClient instance to a variable named 'client'.

        # Select the 'instagram_db' database assignment

        client = MongoClient("mongodb://root:examplepassword@localhost:27017/")
        client.admin.command('ping')
        db = client['instagram_db']
        
        # Return the database object to be used by the Flask application
        return db
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None
