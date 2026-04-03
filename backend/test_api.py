import unittest
from unittest.mock import patch, MagicMock
from test_db import app

class TestAPI(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_1_home_endpoint(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'flask + Mysql working', response.data)

    @patch('test_db.get_db_sql')
    def test_2_register_missing_data(self, mock_db):
        response = self.client.post('/api/register', json={"email": "test@test.com"})
        
        self.assertEqual(response.status_code, 500)

    @patch('test_db.get_db_sql')
    def test_3_login_wrong_credentials(self, mock_db):

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
        response = self.client.get('/api/me')
        self.assertEqual(response.status_code, 401)
        self.assertIn(b'Not logged in', response.data)

    @patch('test_db.get_db_sql')
    def test_5_get_field(self, mock_db):

        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [{"court_id": 1, "name": "Tennis Court A"}]
        mock_db.return_value.cursor.return_value = mock_cursor

        response = self.client.get('/api/get_field')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Tennis Court A', response.data)

if __name__ == '__main__':
    unittest.main()
