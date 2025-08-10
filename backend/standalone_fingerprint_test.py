#!/usr/bin/env python3
"""
🔍 Simple Fingerprint System Test (Standalone)

This is an alternative testing approach that doesn't rely on the backend server.
It provides a direct way to test fingerprint functionality using HTTP requests.
"""

import requests
import json
import time
import sys
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
ENDPOINTS = {
    "health": f"{BASE_URL}/health",
    "docs": f"{BASE_URL}/docs",
    "auth_login": f"{BASE_URL}/api/v1/auth/login",
    "auth_simulation": f"{BASE_URL}/api/v1/auth/simulation-credentials",
    "fingerprint_status": f"{BASE_URL}/api/v1/fingerprint/status",
    "fingerprint_enroll": f"{BASE_URL}/api/v1/fingerprint/enroll",
    "fingerprint_verify": f"{BASE_URL}/api/v1/fingerprint/verify",
    "fingerprint_templates": f"{BASE_URL}/api/v1/fingerprint/templates",
    "fingerprint_test_capture": f"{BASE_URL}/api/v1/fingerprint/test-capture",
}

def test_server_health() -> bool:
    """Test if the server is running and healthy."""
    try:
        print("🔍 Testing server health...")
        response = requests.get(ENDPOINTS["health"], timeout=15)
        if response.status_code == 200:
            print("✅ Server is healthy and responding!")
            return True
        else:
            print(f"❌ Server health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to server: {e}")
        return False

def get_simulation_credentials() -> Dict[str, Any]:
    """Get available simulation credentials."""
    try:
        print("🔑 Getting simulation credentials...")
        response = requests.get(ENDPOINTS["auth_simulation"], timeout=15)
        if response.status_code == 200:
            creds = response.json()
            print("✅ Available simulation credentials:")
            
            # Handle both old format (users array) and new format (credentials object)
            users_data = creds.get("users", [])
            if not users_data and "credentials" in creds:
                # Convert new format to old format for compatibility
                users_data = []
                for key, user_info in creds["credentials"].items():
                    users_data.append(user_info)
            
            for user in users_data:
                print(f"   📋 {user['username']} ({user['role']}) - password: {user['password']}")
            return creds
        else:
            print(f"❌ Failed to get credentials: {response.status_code}")
            return {}
    except Exception as e:
        print(f"❌ Error getting credentials: {e}")
        return {}

def login_user(username: str, password: str, role: str) -> bool:
    """Login with simulation credentials."""
    try:
        print(f"🔐 Logging in as {username} ({role})...")
        payload = {
            "username": username,
            "password": password,
            "role": role
        }
        response = requests.post(ENDPOINTS["auth_login"], json=payload, timeout=5)
        if response.status_code == 200:
            print(f"✅ Login successful for {username}!")
            return True
        else:
            print(f"❌ Login failed for {username}: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False

def test_fingerprint_status() -> bool:
    """Test fingerprint system status."""
    try:
        print("🔍 Checking fingerprint system status...")
        response = requests.get(ENDPOINTS["fingerprint_status"], timeout=5)
        if response.status_code == 200:
            status = response.json()
            print("✅ Fingerprint system status:")
            print(f"   📡 Reader connected: {status.get('reader_connected', False)}")
            print(f"   🛠️  SDK available: {status.get('sdk_available', False)}")
            print(f"   🔧 Service status: {status.get('service_status', 'unknown')}")
            print(f"   📋 Total templates: {status.get('total_templates', 0)}")
            return True
        else:
            print(f"❌ Fingerprint status check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Status check error: {e}")
        return False

def test_fingerprint_enrollment() -> bool:
    """Test fingerprint enrollment (simulation mode)."""
    try:
        print("🖐️  Testing fingerprint enrollment...")
        payload = {
            "staff_id": 1,
            "finger_position": 1  # Use integer instead of string
        }
        response = requests.post(ENDPOINTS["fingerprint_enroll"], json=payload, timeout=10)
        print(f"📊 Enrollment response: {response.status_code}")
        print(f"📄 Response body: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✅ Fingerprint enrollment successful!")
                print(f"   🆔 Template ID: {result.get('template_id')}")
                print(f"   📊 Quality score: {result.get('quality_score')}")
                print(f"   📈 Samples collected: {result.get('samples_collected')}")
                return True
            else:
                print(f"❌ Enrollment failed: {result.get('message')}")
                return False
        else:
            print(f"❌ Enrollment request failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Enrollment error: {e}")
        return False

def test_fingerprint_verification() -> bool:
    """Test fingerprint verification (simulation mode)."""
    try:
        print("🔍 Testing fingerprint verification...")
        payload = {
            "staff_id": 1,
            "action": "IN"
        }
        response = requests.post(ENDPOINTS["fingerprint_verify"], json=payload, timeout=10)
        print(f"📊 Verification response: {response.status_code}")
        print(f"📄 Response body: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✅ Fingerprint verification successful!")
                print(f"   👤 Staff: {result.get('staff_name', 'Unknown')}")
                print(f"   🎯 Confidence: {result.get('confidence', 0)}%")
                print(f"   📝 Attendance recorded: {result.get('attendance_recorded', False)}")
                return True
            else:
                print(f"❌ Verification failed: {result.get('message')}")
                return False
        else:
            print(f"❌ Verification request failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False

def test_fingerprint_capture() -> bool:
    """Test fingerprint capture functionality."""
    try:
        print("📸 Testing fingerprint capture...")
        response = requests.post(ENDPOINTS["fingerprint_test_capture"], timeout=10)
        print(f"📊 Capture response: {response.status_code}")
        print(f"📄 Response body: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                print("✅ Fingerprint capture test successful!")
                print(f"   📏 Sample length: {result.get('sample_length', 0)} bytes")
                return True
            else:
                print(f"❌ Capture test failed: {result.get('message')}")
                return False
        else:
            print(f"❌ Capture request failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Capture error: {e}")
        return False

def test_fingerprint_templates() -> bool:
    """Test fingerprint templates listing."""
    try:
        print("📄 Testing fingerprint templates listing...")
        response = requests.get(ENDPOINTS["fingerprint_templates"], timeout=10)
        print(f"📊 Templates response: {response.status_code}")
        print(f"📄 Response body: {response.text}")
        
        if response.status_code == 200:
            templates = response.json()  # Direct list response
            print("✅ Fingerprint templates test successful!")
            print(f"   📋 Templates found: {len(templates)}")
            for i, template in enumerate(templates[:3]):  # Show first 3
                print(f"   {i+1}. Staff ID: {template.get('staff_id')}, Enrolled: {template.get('enrollment_date', 'N/A')}")
            return True
        else:
            print(f"❌ Templates request failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Templates error: {e}")
        return False

def run_comprehensive_test():
    """Run all fingerprint tests."""
    print("🚀 Starting Comprehensive Fingerprint System Test")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 0
    
    # Test 1: Server Health
    total_tests += 1
    if test_server_health():
        tests_passed += 1
    
    time.sleep(1)
    
    # Test 2: Get Simulation Credentials
    total_tests += 1
    creds = get_simulation_credentials()
    if creds:
        tests_passed += 1
    
    time.sleep(1)
    
    # Test 3: Login Test
    total_tests += 1
    if creds:
        # Handle both formats
        users_data = creds.get("users", [])
        if not users_data and "credentials" in creds:
            users_data = list(creds["credentials"].values())
        
        admin_user = next((u for u in users_data if u["role"] == "Admin"), None)
        if admin_user and login_user(admin_user["username"], admin_user["password"], admin_user["role"]):
            tests_passed += 1
    
    time.sleep(1)
    
    # Test 4: Fingerprint Status
    total_tests += 1
    if test_fingerprint_status():
        tests_passed += 1
    
    time.sleep(1)
    
    # Test 5: Fingerprint Enrollment
    total_tests += 1
    if test_fingerprint_enrollment():
        tests_passed += 1
    
    time.sleep(1)
    
    # Test 6: Fingerprint Verification
    total_tests += 1
    if test_fingerprint_verification():
        tests_passed += 1
    
    time.sleep(1)
    
    # Test 7: Fingerprint Capture
    total_tests += 1
    if test_fingerprint_capture():
        tests_passed += 1
    
    time.sleep(1)
    
    # Test 8: Fingerprint Templates
    total_tests += 1
    if test_fingerprint_templates():
        tests_passed += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("🏁 TEST SUMMARY")
    print("=" * 60)
    print(f"✅ Tests passed: {tests_passed}/{total_tests}")
    print(f"❌ Tests failed: {total_tests - tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 ALL TESTS PASSED! Your fingerprint system is working correctly!")
    else:
        print("⚠️  Some tests failed. Check the error messages above for details.")
    
    return tests_passed == total_tests

def interactive_test():
    """Run interactive test mode."""
    print("🎮 Interactive Fingerprint Test Mode")
    print("=" * 40)
    
    while True:
        print("\nAvailable Tests:")
        print("1. 🏥 Server Health Check")
        print("2. 🔑 Get Simulation Credentials")
        print("3. 🔐 Test Login")
        print("4. 🔍 Fingerprint Status")
        print("5. 🖐️  Fingerprint Enrollment")
        print("6. ✅ Fingerprint Verification")
        print("7. 📸 Fingerprint Capture")
        print("8. � Fingerprint Templates")
        print("9. �🚀 Run All Tests")
        print("10. 🚪 Exit")
        
        choice = input("\nEnter your choice (1-10): ").strip()
        
        if choice == "1":
            test_server_health()
        elif choice == "2":
            get_simulation_credentials()
        elif choice == "3":
            creds = get_simulation_credentials()
            if creds:
                # Handle both formats
                users_data = creds.get("users", [])
                if not users_data and "credentials" in creds:
                    users_data = list(creds["credentials"].values())
                
                admin_user = next((u for u in users_data if u["role"] == "Admin"), None)
                if admin_user:
                    login_user(admin_user["username"], admin_user["password"], admin_user["role"])
        elif choice == "4":
            test_fingerprint_status()
        elif choice == "5":
            test_fingerprint_enrollment()
        elif choice == "6":
            test_fingerprint_verification()
        elif choice == "7":
            test_fingerprint_capture()
        elif choice == "8":
            test_fingerprint_templates()
        elif choice == "9":
            run_comprehensive_test()
        elif choice == "10":
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    print("🔍 AstroBSM Fingerprint System Tester")
    print("=" * 40)
    
    if len(sys.argv) > 1 and sys.argv[1] == "--auto":
        # Automatic mode
        run_comprehensive_test()
    else:
        # Interactive mode
        interactive_test()
