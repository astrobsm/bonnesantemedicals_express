import requests
import pytest

API_BASE = "http://localhost:8000/api/v1"

def test_health():
    r = requests.get(f"{API_BASE}/auth/list-users")
    assert r.status_code in (200, 401)

def test_register_staff():
    payload = {
        "name": "Test Staff",
        "staff_id": "TEST1234",
        "dob": "1990-01-01",
        "gender": "M",
        "phone": "1234567890",
        "address": "Test Address",
        "bank": "Test Bank",
        "account_number": "1234567890",
        "hourly_rate": 10.0,
        "role": "staff",
        "department": "IT",
        "appointment_type": "Full-Time"
    }
    r = requests.post(f"{API_BASE}/registration/staff-profile", json=payload)
    assert r.status_code in (200, 201, 400)

def test_login():
    payload = {"username": "blakvelvet", "password": "chibuike_douglas", "role": "Admin"}
    r = requests.post(f"{API_BASE}/auth/login", json=payload)
    assert r.status_code in (200, 400, 403)
    if r.ok:
        assert "access_token" in r.json()

def test_get_products():
    r = requests.get(f"{API_BASE}/products")
    assert r.status_code in (200, 401, 404)

def test_get_customers():
    r = requests.get(f"{API_BASE}/customers")
    assert r.status_code in (200, 401, 404)

def test_get_warehouses():
    r = requests.get(f"{API_BASE}/inventory/warehouses")
    assert r.status_code in (200, 401, 404)

# Add more endpoint tests as needed

def run_all():
    test_health()
    test_register_staff()
    test_login()
    test_get_products()
    test_get_customers()
    test_get_warehouses()

if __name__ == "__main__":
    run_all()
