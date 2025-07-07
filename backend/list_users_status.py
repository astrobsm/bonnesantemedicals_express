import requests

API_BASE_URL = "http://localhost:8000/api/v1"

# If you have an admin token, you can add it here for protected endpoints
ADMIN_TOKEN = None  # e.g., 'eyJ0eXAiOiJKV1QiLCJhbGciOi...'

headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"} if ADMIN_TOKEN else {}

response = requests.get(f"{API_BASE_URL}/auth/list-users", headers=headers)

if response.ok:
    users = response.json()
    print("ID | Username | Role | Status | Email | Full Name")
    print("-"*60)
    for u in users:
        print(f"{u['id']} | {u['username']} | {u['role']} | {u['status']} | {u.get('email','')} | {u.get('full_name','')}")
else:
    print("Failed to fetch users:", response.text)
