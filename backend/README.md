# Activity 2: Mini Instagram (Flask App)

This is a simple social media web application built with Flask and MongoDB.

## Prerequisites

1.  **MongoDB**: Ensure MongoDB is running.
    ```bash
    docker compose up -d
    ```
    *Connection string used:* `mongodb://root:examplepassword@localhost:27017/`

## Setup & Installation

1.  Navigate to the directory:
    ```bash
    cd Activity2
    ```

2.  (Optional) Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use: venv\Scripts\activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## How to Run

1.  Start the Flask server:
    ```bash
    python app.py
    ```
2.  Open your browser and go to:
    [http://localhost:5000](http://localhost:5000)

## Features
- **User Auth**: Register and Login.
- **Feed**: Post images and view a combined feed.
- **Interactions**:
    - **Comments**: Stored as *embedded documents* inside posts.
    - **Follow**: Stored as *references* in user documents.
