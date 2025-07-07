import requests

API_BASE_URL = "http://localhost:8000/api/v1"

# Test registration endpoint
def test_registration():
    payload = {
        "username": "testuser123",
        "password": "TestPassword123!",
        "role": "user"
    }
    response = requests.post(f"{API_BASE_URL}/registration/register", json=payload)
    print("Registration status:", response.status_code)
    print("Response:", response.json())
    assert response.status_code in (200, 201), "Registration failed!"

# Test login endpoint
def test_login():
    payload = {
        "username": "testuser123",
        "password": "TestPassword123!"
    }
    response = requests.post(f"{API_BASE_URL}/auth/login", json=payload)
    print("Login status:", response.status_code)
    print("Response:", response.json())
    assert response.status_code == 200, "Login failed!"
    token = response.json().get("access_token")
    assert token, "No token returned!"
    return token

# Test access to a protected endpoint
def test_protected(token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE_URL}/users/me", headers=headers)
    print("Protected endpoint status:", response.status_code)
    print("Response:", response.json())
    assert response.status_code == 200, "Protected endpoint failed!"

def run_all():
    test_registration()
    token = test_login()
    test_protected(token)

if __name__ == "__main__":
    run_all()
