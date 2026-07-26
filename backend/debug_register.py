import traceback
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
try:
    response = client.post(
        '/auth/register',
        json={'username': 'testuser123', 'email': 'testuser123@example.com', 'password': 'Password123!'},
        headers={'Origin': 'http://localhost:3001'},
    )
    print('status', response.status_code)
    print('headers', response.headers)
    print('body', response.text)
except Exception as exc:
    print('EXCEPTION', type(exc).__name__, exc)
    traceback.print_exc()
