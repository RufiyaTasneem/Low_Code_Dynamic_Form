import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
response = client.options('/auth/register', headers={
    'Origin': 'http://localhost:3001',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
})
print('OPTIONS status', response.status_code)
print('OPTIONS headers', response.headers)
print('OPTIONS body', response.text)

response = client.post('/auth/register', json={
    'username': 'testuser123',
    'email': 'testuser123@example.com',
    'password': 'Password123!'
}, headers={'Origin': 'http://localhost:3001'})
print('POST status', response.status_code)
print('POST headers', response.headers)
print('POST body', response.text)
