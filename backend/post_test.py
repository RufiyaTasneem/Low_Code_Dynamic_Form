import http.client
import json

conn = http.client.HTTPConnection('127.0.0.1', 8000)
headers = {
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:3001'
}
payload = json.dumps({
    'username': 'testuser123',
    'email': 'testuser123@example.com',
    'password': 'Password123!'
})
conn.request('POST', '/auth/register', body=payload, headers=headers)
resp = conn.getresponse()
print('status', resp.status)
print('headers', resp.getheaders())
print('body', resp.read().decode())
