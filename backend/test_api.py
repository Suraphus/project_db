import unittest
from unittest.mock import patch, MagicMock
from test_db import app

class TestAPI(unittest.TestCase):
    def setUp(self):
        # Set up a test client before each test
        self.client = app.test_client()
        self.client.testing = True

    def test_1_home_endpoint(self):
        """Test the home endpoint '/' returns 200 and a specific string"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'flask + Mysql working', response.data)

    @patch('test_db.get_db_sql')
    def test_2_register_missing_data(self, mock_db):
        """Test the '/api/register' endpoint with missing data (Raises KeyError / catches and returns 400)"""
        # Sending incomplete JSON structure (missing 'password', 'name', etc.)
        response = self.client.post('/api/register', json={"email": "test@test.com"})
        
        # Should return 500 based on the KeyError thrown outside the try-catch block
        self.assertEqual(response.status_code, 500)

    @patch('test_db.get_db_sql')
    def test_3_login_wrong_credentials(self, mock_db):
        """Test the '/api/login' endpoint with non-existent user returns 401"""
        # Mock database cursor to return None for fetching user
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_db.return_value.cursor.return_value = mock_cursor

        response = self.client.post('/api/login', json={
            "email": "wrong@example.com", 
            "password": "wrongpassword"
        })
        self.assertEqual(response.status_code, 401)
        self.assertIn(b'Wrong Email or Password', response.data)

    def test_4_get_current_user_unauthorized(self):
        """Test the '/api/me' endpoint without a user session returns 401"""
        response = self.client.get('/api/me')
        self.assertEqual(response.status_code, 401)
        self.assertIn(b'Not logged in', response.data)

    @patch('test_db.get_db_sql')
    def test_5_get_field(self, mock_db):
        """Test the '/api/get_field' endpoint that it successfully fetches data"""
        # Mock database cursor to return a fake court list
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [{"court_id": 1, "name": "Tennis Court A"}]
        mock_db.return_value.cursor.return_value = mock_cursor

        response = self.client.get('/api/get_field')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Tennis Court A', response.data)

if __name__ == '__main__':
    unittest.main()
