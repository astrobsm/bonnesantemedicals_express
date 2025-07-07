import requests

# This script will call the deployed backend's /api/v1/auth/admin/reset-admin endpoint
# to reset the admin password and status.

BACKEND_URL = "https://astrobsm-oracle-backend.onrender.com/api/v1/auth/admin/reset-admin"

try:
    response = requests.post(BACKEND_URL)
    print("Status Code:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error calling reset-admin endpoint:", e)
