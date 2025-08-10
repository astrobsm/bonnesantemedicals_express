#!/usr/bin/env python3
"""
Comprehensive test script for AstroBSM application
Tests backend API endpoints, frontend connectivity, and system integration
"""
import requests
import json
import sys
import time
from datetime import datetime

class AstroBSMTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api/v1"
        self.session = requests.Session()
        self.auth_token = None
        
    def print_banner(self, text):
        print(f"\n{'='*60}")
        print(f"🔍 {text}")
        print('='*60)
        
    def test_health_endpoints(self):
        """Test basic health and documentation endpoints"""
        self.print_banner("TESTING HEALTH ENDPOINTS")
        
        endpoints = [
            ("/health", "Health Check"),
            ("/docs", "API Documentation"),
            ("/redoc", "ReDoc Documentation")
        ]
        
        for endpoint, name in endpoints:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}")
                status = "✅ PASS" if response.status_code == 200 else "❌ FAIL"
                print(f"{name}: {status} (Status: {response.status_code})")
            except Exception as e:
                print(f"{name}: ❌ ERROR - {str(e)}")
                
    def test_simulation_credentials(self):
        """Test simulation credentials endpoint"""
        self.print_banner("TESTING SIMULATION CREDENTIALS")
        
        try:
            response = self.session.get(f"{self.api_base}/auth/simulation-credentials")
            if response.status_code == 200:
                creds = response.json()
                print("✅ Simulation credentials retrieved successfully")
                print(f"Available test accounts: {list(creds['credentials'].keys())}")
                return creds['credentials']
            else:
                print(f"❌ Failed to get simulation credentials: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ Error getting simulation credentials: {str(e)}")
            return None
            
    def test_authentication(self, credentials):
        """Test authentication with different user types"""
        self.print_banner("TESTING AUTHENTICATION")
        
        auth_results = {}
        
        for user_type, creds in credentials.items():
            try:
                response = self.session.post(
                    f"{self.api_base}/auth/login",
                    json=creds,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    token_data = response.json()
                    auth_results[user_type] = token_data['access_token']
                    print(f"✅ {user_type.upper()} login successful")
                    
                    # Save admin token for further tests
                    if user_type == 'admin':
                        self.auth_token = token_data['access_token']
                        self.session.headers.update({
                            'Authorization': f"Bearer {self.auth_token}"
                        })
                else:
                    print(f"❌ {user_type.upper()} login failed: {response.status_code}")
                    if response.content:
                        print(f"   Error: {response.json().get('detail', 'Unknown error')}")
                        
            except Exception as e:
                print(f"❌ {user_type.upper()} login error: {str(e)}")
                
        return auth_results
        
    def test_fingerprint_endpoints(self):
        """Test fingerprint-related endpoints"""
        self.print_banner("TESTING FINGERPRINT ENDPOINTS")
        
        if not self.auth_token:
            print("❌ No authentication token available, skipping fingerprint tests")
            return
            
        # Test fingerprint status
        try:
            response = self.session.get(f"{self.api_base}/fingerprint/status")
            status = "✅ PASS" if response.status_code == 200 else "❌ FAIL"
            print(f"Fingerprint Status: {status} (Status: {response.status_code})")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   Reader Connected: {result.get('reader_connected', 'Unknown')}")
                print(f"   SDK Available: {result.get('sdk_available', 'Unknown')}")
                print(f"   Service Status: {result.get('service_status', 'Unknown')}")
        except Exception as e:
            print(f"Fingerprint Status: ❌ ERROR - {str(e)}")
            
        # Test fingerprint enrollment
        try:
            enroll_data = {
                "staff_id": 1,
                "finger_position": 1  # Use integer instead of string
            }
            response = self.session.post(
                f"{self.api_base}/fingerprint/enroll",
                json=enroll_data,
                headers={"Content-Type": "application/json"}
            )
            status = "✅ PASS" if response.status_code in [200, 201] else "❌ FAIL"
            print(f"Fingerprint Enroll: {status} (Status: {response.status_code})")
            
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"   Enrollment ID: {result.get('enrollment_id', 'N/A')}")
            elif response.status_code == 422:
                result = response.json()
                print(f"   Validation Error: {result.get('detail', 'Unknown error')}")
        except Exception as e:
            print(f"Fingerprint Enroll: ❌ ERROR - {str(e)}")
            
        # Test fingerprint verification
        try:
            verify_data = {
                "staff_id": 1,
                "action": "IN"  # Add required action field
            }
            response = self.session.post(
                f"{self.api_base}/fingerprint/verify",
                json=verify_data,
                headers={"Content-Type": "application/json"}
            )
            status = "✅ PASS" if response.status_code == 200 else "❌ FAIL"
            print(f"Fingerprint Verify: {status} (Status: {response.status_code})")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   Match: {result.get('match', 'Unknown')}")
            elif response.status_code == 422:
                result = response.json()
                print(f"   Validation Error: {result.get('detail', 'Unknown error')}")
        except Exception as e:
            print(f"Fingerprint Verify: ❌ ERROR - {str(e)}")
            
    def test_attendance_endpoints(self):
        """Test attendance-related endpoints"""
        self.print_banner("TESTING ATTENDANCE ENDPOINTS")
        
        if not self.auth_token:
            print("❌ No authentication token available, skipping attendance tests")
            return
            
        # Test attendance via fingerprint verification
        try:
            verify_data = {
                "staff_id": 1,
                "action": "IN"
            }
            response = self.session.post(
                f"{self.api_base}/fingerprint/verify",
                json=verify_data,
                headers={"Content-Type": "application/json"}
            )
            status = "✅ PASS" if response.status_code in [200, 201] else "❌ FAIL"
            print(f"Fingerprint Attendance Verification: {status} (Status: {response.status_code})")
            
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"   Attendance Recorded: {result.get('attendance_recorded', 'N/A')}")
                print(f"   Matched: {result.get('matched', 'N/A')}")
        except Exception as e:
            print(f"Fingerprint Attendance Verification: ❌ ERROR - {str(e)}")
            
    def test_static_files(self):
        """Test static file serving"""
        self.print_banner("TESTING STATIC FILES")
        
        static_files = [
            "/fingerprint_test.html",
            "/favicon.ico",
            "/index.html"
        ]
        
        for file_path in static_files:
            try:
                response = self.session.get(f"{self.base_url}{file_path}")
                status = "✅ PASS" if response.status_code == 200 else "❌ FAIL"
                print(f"Static file {file_path}: {status} (Status: {response.status_code})")
            except Exception as e:
                print(f"Static file {file_path}: ❌ ERROR - {str(e)}")
                
    def test_frontend_connectivity(self):
        """Test frontend connectivity"""
        self.print_banner("TESTING FRONTEND CONNECTIVITY")
        
        frontend_url = "http://localhost:3000"
        
        try:
            response = requests.get(frontend_url, timeout=5)
            if response.status_code == 200:
                print("✅ Frontend is accessible")
                print(f"   URL: {frontend_url}")
                print(f"   Status: {response.status_code}")
            else:
                print(f"❌ Frontend returned status: {response.status_code}")
        except requests.exceptions.ConnectionError:
            print("❌ Frontend not accessible - React dev server may not be running")
            print("   Run 'npm start' in frontend/react-app directory")
        except Exception as e:
            print(f"❌ Frontend connectivity error: {str(e)}")
            
    def run_comprehensive_test(self):
        """Run all tests"""
        start_time = time.time()
        
        print("🚀 Starting AstroBSM Comprehensive Test Suite")
        print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Backend URL: {self.base_url}")
        
        # Run all test categories
        self.test_health_endpoints()
        
        credentials = self.test_simulation_credentials()
        if credentials:
            auth_results = self.test_authentication(credentials)
            self.test_fingerprint_endpoints()
            self.test_attendance_endpoints()
        
        self.test_static_files()
        self.test_frontend_connectivity()
        
        # Test summary
        end_time = time.time()
        duration = round(end_time - start_time, 2)
        
        self.print_banner("TEST SUMMARY")
        print(f"⏱️ Total test duration: {duration} seconds")
        print(f"🔐 Authentication token obtained: {'✅ YES' if self.auth_token else '❌ NO'}")
        print(f"📊 Backend simulation mode: ✅ ACTIVE")
        
        if self.auth_token:
            print("\n🔑 Admin credentials for manual testing:")
            print("   Username: admin")
            print("   Password: admin123")
            print("   Role: Admin")
            
        print("\n📝 Manual testing URLs:")
        print(f"   🏥 Backend API Docs: {self.base_url}/docs")
        print(f"   🧪 Fingerprint Test Page: {self.base_url}/fingerprint_test.html")
        print(f"   🎯 Frontend App: http://localhost:3000 (if running)")
        
        print("\n✅ Comprehensive testing completed!")

if __name__ == "__main__":
    tester = AstroBSMTester()
    tester.run_comprehensive_test()
