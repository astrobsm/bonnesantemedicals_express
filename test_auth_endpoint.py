#!/usr/bin/env python3
"""
Quick test script to verify the login endpoint
"""
import requests
import json

def test_login_endpoint():
    url = "http://localhost:8000/api/v1/auth/login"
    
    # Test data - using simulation credentials
    test_credentials = {
        "username": "admin",
        "password": "admin123", 
        "role": "Admin"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print("🔍 Testing login endpoint...")
    print(f"URL: {url}")
    print(f"Data: {test_credentials}")
    
    try:
        # Test POST request
        response = requests.post(url, json=test_credentials, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")

def test_available_endpoints():
    base_url = "http://localhost:8000"
    
    # Test health check
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Health check: {response.status_code}")
    except:
        print("Health endpoint not available")
    
    # Test docs
    try:
        response = requests.get(f"{base_url}/docs")
        print(f"Docs endpoint: {response.status_code}")
    except:
        print("Docs endpoint not available")

if __name__ == "__main__":
    print("🧪 Testing Authentication Endpoints")
    print("=" * 50)
    test_available_endpoints()
    print("-" * 50)
    test_login_endpoint()
