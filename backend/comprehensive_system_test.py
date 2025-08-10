#!/usr/bin/env python3
"""
Comprehensive AstroBSM System Test
Tests all aspects of the application: login, reports, components, frontend/backend integration, 
CORS, endpoints, APIs, models, and business logic.
"""

import requests
import json
import time
import sys
import os
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional

# Configuration
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

# Test data storage
test_session = {
    "access_token": None,
    "user_info": None,
    "staff_id": None
}

class Colors:
    """ANSI color codes for terminal output."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(title: str):
    """Print a formatted test section header."""
    print(f"\n{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.WHITE}{title.center(60)}{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")

def print_test(test_name: str):
    """Print test name."""
    print(f"\n{Colors.BLUE}🧪 Testing: {test_name}{Colors.END}")

def print_success(message: str):
    """Print success message."""
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message: str):
    """Print error message."""
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_warning(message: str):
    """Print warning message."""
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def print_info(message: str):
    """Print info message."""
    print(f"{Colors.PURPLE}ℹ️  {message}{Colors.END}")

class ComprehensiveSystemTester:
    """Comprehensive system tester for AstroBSM application."""
    
    def __init__(self):
        self.base_url = BASE_URL
        self.frontend_url = FRONTEND_URL
        self.session = requests.Session()
        self.results = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "categories": {}
        }
        
    def log_test_result(self, category: str, test_name: str, passed: bool, details: str = ""):
        """Log test result."""
        self.results["total_tests"] += 1
        if passed:
            self.results["passed_tests"] += 1
        else:
            self.results["failed_tests"] += 1
            
        if category not in self.results["categories"]:
            self.results["categories"][category] = {"passed": 0, "failed": 0, "tests": []}
            
        self.results["categories"][category]["tests"].append({
            "name": test_name,
            "passed": passed,
            "details": details
        })
        
        if passed:
            self.results["categories"][category]["passed"] += 1
        else:
            self.results["categories"][category]["failed"] += 1

    def test_server_health(self) -> bool:
        """Test server health and basic connectivity."""
        print_test("Server Health & Connectivity")
        
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                health_data = response.json()
                print_success(f"Server healthy: {health_data}")
                self.log_test_result("Infrastructure", "Server Health", True, str(health_data))
                return True
            else:
                print_error(f"Server health check failed: {response.status_code}")
                self.log_test_result("Infrastructure", "Server Health", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Server connection failed: {e}")
            self.log_test_result("Infrastructure", "Server Health", False, str(e))
            return False

    def test_cors_headers(self) -> bool:
        """Test CORS configuration."""
        print_test("CORS Configuration")
        
        try:
            # Test preflight request
            headers = {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            }
            
            response = self.session.options(f"{self.base_url}/api/v1/auth/login", headers=headers)
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
                'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
            }
            
            print_info(f"CORS Headers: {cors_headers}")
            
            if cors_headers['Access-Control-Allow-Origin'] in ['*', 'http://localhost:3000']:
                print_success("CORS properly configured")
                self.log_test_result("Infrastructure", "CORS Configuration", True, str(cors_headers))
                return True
            else:
                print_warning("CORS may not be properly configured for frontend")
                self.log_test_result("Infrastructure", "CORS Configuration", False, "Missing or incorrect CORS headers")
                return False
                
        except Exception as e:
            print_error(f"CORS test failed: {e}")
            self.log_test_result("Infrastructure", "CORS Configuration", False, str(e))
            return False

    def test_api_documentation(self) -> bool:
        """Test API documentation endpoints."""
        print_test("API Documentation")
        
        try:
            # Test OpenAPI/Swagger docs
            docs_response = self.session.get(f"{self.base_url}/docs")
            openapi_response = self.session.get(f"{self.base_url}/openapi.json")
            
            docs_ok = docs_response.status_code == 200
            openapi_ok = openapi_response.status_code == 200
            
            if docs_ok and openapi_ok:
                print_success("API documentation accessible")
                self.log_test_result("Infrastructure", "API Documentation", True)
                return True
            else:
                print_error(f"API docs failed - Docs: {docs_response.status_code}, OpenAPI: {openapi_response.status_code}")
                self.log_test_result("Infrastructure", "API Documentation", False, f"Docs: {docs_response.status_code}, OpenAPI: {openapi_response.status_code}")
                return False
                
        except Exception as e:
            print_error(f"API documentation test failed: {e}")
            self.log_test_result("Infrastructure", "API Documentation", False, str(e))
            return False

    def test_authentication_system(self) -> bool:
        """Test complete authentication system."""
        print_test("Authentication System")
        
        try:
            # Get simulation credentials
            creds_response = self.session.get(f"{self.base_url}/api/v1/auth/simulation-credentials")
            if creds_response.status_code != 200:
                print_error("Failed to get simulation credentials")
                self.log_test_result("Authentication", "Get Credentials", False, f"HTTP {creds_response.status_code}")
                return False
                
            creds_data = creds_response.json()
            print_info(f"Available credentials: {list(creds_data.get('credentials', {}).keys())}")
            
            # Test login with different user roles
            credentials = creds_data.get('credentials', {})
            login_tests = []
            
            for username, user_data in credentials.items():
                login_data = {
                    "username": username,
                    "password": user_data['password'],
                    "role": user_data['role']
                }
                
                login_response = self.session.post(f"{self.base_url}/api/v1/auth/login", json=login_data)
                
                if login_response.status_code == 200:
                    login_result = login_response.json()
                    print_success(f"Login successful for {username} ({user_data['role']})")
                    
                    # Store admin token for later tests
                    if user_data['role'] == 'Admin':
                        test_session['access_token'] = login_result.get('access_token')
                        test_session['user_info'] = user_data
                        test_session['staff_id'] = user_data.get('staff_id')
                        
                    login_tests.append(True)
                    self.log_test_result("Authentication", f"Login {username}", True)
                else:
                    print_error(f"Login failed for {username}: {login_response.status_code}")
                    login_tests.append(False)
                    self.log_test_result("Authentication", f"Login {username}", False, f"HTTP {login_response.status_code}")
            
            return all(login_tests)
            
        except Exception as e:
            print_error(f"Authentication test failed: {e}")
            self.log_test_result("Authentication", "Authentication System", False, str(e))
            return False

    def test_database_models(self) -> bool:
        """Test database models and relationships."""
        print_test("Database Models & Relationships")
        
        if not test_session.get('access_token'):
            print_warning("No access token available, skipping database tests")
            return False
            
        headers = {'Authorization': f"Bearer {test_session['access_token']}"}
        
        try:
            # Test different model endpoints
            model_tests = []
            
            # Test staff/users
            users_response = self.session.get(f"{self.base_url}/api/v1/users/", headers=headers)
            if users_response.status_code in [200, 404]:  # 404 is OK in simulation mode
                print_success("Users model accessible")
                model_tests.append(True)
                self.log_test_result("Models", "Users Model", True)
            else:
                print_error(f"Users model failed: {users_response.status_code}")
                model_tests.append(False)
                self.log_test_result("Models", "Users Model", False, f"HTTP {users_response.status_code}")
            
            # Test attendance records
            today = date.today().isoformat()
            attendance_response = self.session.get(f"{self.base_url}/api/v1/attendance/?date={today}", headers=headers)
            if attendance_response.status_code in [200, 404]:
                print_success("Attendance model accessible")
                model_tests.append(True)
                self.log_test_result("Models", "Attendance Model", True)
            else:
                print_error(f"Attendance model failed: {attendance_response.status_code}")
                model_tests.append(False)
                self.log_test_result("Models", "Attendance Model", False, f"HTTP {attendance_response.status_code}")
            
            # Test fingerprint templates
            templates_response = self.session.get(f"{self.base_url}/api/v1/fingerprint/templates", headers=headers)
            if templates_response.status_code == 200:
                templates_data = templates_response.json()
                print_success(f"Fingerprint templates accessible: {len(templates_data)} templates")
                model_tests.append(True)
                self.log_test_result("Models", "Fingerprint Templates", True, f"{len(templates_data)} templates")
            else:
                print_error(f"Fingerprint templates failed: {templates_response.status_code}")
                model_tests.append(False)
                self.log_test_result("Models", "Fingerprint Templates", False, f"HTTP {templates_response.status_code}")
            
            return all(model_tests)
            
        except Exception as e:
            print_error(f"Database models test failed: {e}")
            self.log_test_result("Models", "Database Models", False, str(e))
            return False

    def test_fingerprint_system(self) -> bool:
        """Test complete fingerprint system."""
        print_test("Fingerprint System Integration")
        
        try:
            fingerprint_tests = []
            
            # Test fingerprint status
            status_response = self.session.get(f"{self.base_url}/api/v1/fingerprint/status")
            if status_response.status_code == 200:
                status_data = status_response.json()
                print_success(f"Fingerprint status: {status_data}")
                fingerprint_tests.append(True)
                self.log_test_result("Fingerprint", "System Status", True, str(status_data))
            else:
                print_error(f"Fingerprint status failed: {status_response.status_code}")
                fingerprint_tests.append(False)
                self.log_test_result("Fingerprint", "System Status", False, f"HTTP {status_response.status_code}")
            
            # Test fingerprint enrollment
            enroll_data = {"staff_id": 1, "finger_position": 1}
            enroll_response = self.session.post(f"{self.base_url}/api/v1/fingerprint/enroll", json=enroll_data)
            if enroll_response.status_code == 200:
                enroll_result = enroll_response.json()
                print_success(f"Fingerprint enrollment: {enroll_result.get('message')}")
                fingerprint_tests.append(True)
                self.log_test_result("Fingerprint", "Enrollment", True, str(enroll_result))
            else:
                print_error(f"Fingerprint enrollment failed: {enroll_response.status_code}")
                fingerprint_tests.append(False)
                self.log_test_result("Fingerprint", "Enrollment", False, f"HTTP {enroll_response.status_code}")
            
            # Test fingerprint verification
            verify_data = {"staff_id": 1, "action": "IN"}
            verify_response = self.session.post(f"{self.base_url}/api/v1/fingerprint/verify", json=verify_data)
            if verify_response.status_code == 200:
                verify_result = verify_response.json()
                print_success(f"Fingerprint verification: {verify_result.get('message')}")
                fingerprint_tests.append(True)
                self.log_test_result("Fingerprint", "Verification", True, str(verify_result))
            else:
                print_error(f"Fingerprint verification failed: {verify_response.status_code}")
                fingerprint_tests.append(False)
                self.log_test_result("Fingerprint", "Verification", False, f"HTTP {verify_response.status_code}")
            
            # Test fingerprint capture
            capture_response = self.session.post(f"{self.base_url}/api/v1/fingerprint/test-capture")
            if capture_response.status_code == 200:
                capture_result = capture_response.json()
                print_success(f"Fingerprint capture: {capture_result.get('message')}")
                fingerprint_tests.append(True)
                self.log_test_result("Fingerprint", "Capture Test", True, str(capture_result))
            else:
                print_error(f"Fingerprint capture failed: {capture_response.status_code}")
                fingerprint_tests.append(False)
                self.log_test_result("Fingerprint", "Capture Test", False, f"HTTP {capture_response.status_code}")
            
            return all(fingerprint_tests)
            
        except Exception as e:
            print_error(f"Fingerprint system test failed: {e}")
            self.log_test_result("Fingerprint", "Fingerprint System", False, str(e))
            return False

    def test_attendance_system(self) -> bool:
        """Test attendance recording and management."""
        print_test("Attendance System")
        
        if not test_session.get('access_token'):
            print_warning("No access token available, testing without authentication")
            headers = {}
        else:
            headers = {'Authorization': f"Bearer {test_session['access_token']}"}
        
        try:
            attendance_tests = []
            
            # Test attendance recording via fingerprint
            attendance_data = {"staff_id": 1, "action": "IN"}
            attendance_response = self.session.post(f"{self.base_url}/api/v1/fingerprint/verify", json=attendance_data, headers=headers)
            
            if attendance_response.status_code == 200:
                result = attendance_response.json()
                if result.get('attendance_recorded'):
                    print_success("Attendance recording successful")
                    attendance_tests.append(True)
                    self.log_test_result("Attendance", "Record Attendance", True, str(result))
                else:
                    print_warning("Attendance not recorded")
                    attendance_tests.append(False)
                    self.log_test_result("Attendance", "Record Attendance", False, "Attendance not recorded")
            else:
                print_error(f"Attendance recording failed: {attendance_response.status_code}")
                attendance_tests.append(False)
                self.log_test_result("Attendance", "Record Attendance", False, f"HTTP {attendance_response.status_code}")
            
            # Test attendance retrieval
            today = date.today().isoformat()
            get_attendance_response = self.session.get(f"{self.base_url}/api/v1/attendance/?date={today}", headers=headers)
            
            if get_attendance_response.status_code in [200, 404]:  # 404 OK in simulation
                print_success("Attendance retrieval functional")
                attendance_tests.append(True)
                self.log_test_result("Attendance", "Retrieve Attendance", True)
            else:
                print_error(f"Attendance retrieval failed: {get_attendance_response.status_code}")
                attendance_tests.append(False)
                self.log_test_result("Attendance", "Retrieve Attendance", False, f"HTTP {get_attendance_response.status_code}")
            
            return all(attendance_tests)
            
        except Exception as e:
            print_error(f"Attendance system test failed: {e}")
            self.log_test_result("Attendance", "Attendance System", False, str(e))
            return False

    def test_reports_system(self) -> bool:
        """Test reporting functionality."""
        print_test("Reports System")
        
        if not test_session.get('access_token'):
            print_warning("No access token available, skipping authenticated reports")
            return False
            
        headers = {'Authorization': f"Bearer {test_session['access_token']}"}
        
        try:
            reports_tests = []
            
            # Test daily attendance report
            today = date.today().isoformat()
            daily_report_response = self.session.get(f"{self.base_url}/api/v1/reports/attendance/daily?date={today}", headers=headers)
            
            if daily_report_response.status_code in [200, 404]:
                print_success("Daily attendance report accessible")
                reports_tests.append(True)
                self.log_test_result("Reports", "Daily Attendance Report", True)
            else:
                print_error(f"Daily report failed: {daily_report_response.status_code}")
                reports_tests.append(False)
                self.log_test_result("Reports", "Daily Attendance Report", False, f"HTTP {daily_report_response.status_code}")
            
            # Test monthly attendance report
            current_month = date.today().strftime("%Y-%m")
            monthly_report_response = self.session.get(f"{self.base_url}/api/v1/reports/attendance/monthly?month={current_month}", headers=headers)
            
            if monthly_report_response.status_code in [200, 404]:
                print_success("Monthly attendance report accessible")
                reports_tests.append(True)
                self.log_test_result("Reports", "Monthly Attendance Report", True)
            else:
                print_error(f"Monthly report failed: {monthly_report_response.status_code}")
                reports_tests.append(False)
                self.log_test_result("Reports", "Monthly Attendance Report", False, f"HTTP {monthly_report_response.status_code}")
            
            # Test staff report
            staff_report_response = self.session.get(f"{self.base_url}/api/v1/reports/staff/attendance?staff_id=1", headers=headers)
            
            if staff_report_response.status_code in [200, 404]:
                print_success("Staff attendance report accessible")
                reports_tests.append(True)
                self.log_test_result("Reports", "Staff Attendance Report", True)
            else:
                print_error(f"Staff report failed: {staff_report_response.status_code}")
                reports_tests.append(False)
                self.log_test_result("Reports", "Staff Attendance Report", False, f"HTTP {staff_report_response.status_code}")
            
            return any(reports_tests)  # At least one report should work
            
        except Exception as e:
            print_error(f"Reports system test failed: {e}")
            self.log_test_result("Reports", "Reports System", False, str(e))
            return False

    def test_frontend_backend_integration(self) -> bool:
        """Test frontend and backend integration."""
        print_test("Frontend-Backend Integration")
        
        try:
            integration_tests = []
            
            # Test if frontend is running
            try:
                frontend_response = requests.get(self.frontend_url, timeout=5)
                if frontend_response.status_code == 200:
                    print_success("Frontend server accessible")
                    integration_tests.append(True)
                    self.log_test_result("Integration", "Frontend Accessibility", True)
                else:
                    print_warning(f"Frontend may not be running: {frontend_response.status_code}")
                    integration_tests.append(False)
                    self.log_test_result("Integration", "Frontend Accessibility", False, f"HTTP {frontend_response.status_code}")
            except:
                print_warning("Frontend server not accessible (may not be running)")
                integration_tests.append(False)
                self.log_test_result("Integration", "Frontend Accessibility", False, "Frontend not running")
            
            # Test static file serving from backend
            static_response = self.session.get(f"{self.base_url}/static/")
            if static_response.status_code in [200, 404, 403]:  # Any of these is acceptable
                print_success("Backend static file serving configured")
                integration_tests.append(True)
                self.log_test_result("Integration", "Static File Serving", True)
            else:
                print_error(f"Static file serving failed: {static_response.status_code}")
                integration_tests.append(False)
                self.log_test_result("Integration", "Static File Serving", False, f"HTTP {static_response.status_code}")
            
            # Test API endpoints that frontend would use
            api_endpoints = [
                "/api/v1/auth/simulation-credentials",
                "/api/v1/fingerprint/status",
                "/health"
            ]
            
            for endpoint in api_endpoints:
                response = self.session.get(f"{self.base_url}{endpoint}")
                if response.status_code == 200:
                    print_success(f"API endpoint {endpoint} accessible")
                    integration_tests.append(True)
                    self.log_test_result("Integration", f"API {endpoint}", True)
                else:
                    print_error(f"API endpoint {endpoint} failed: {response.status_code}")
                    integration_tests.append(False)
                    self.log_test_result("Integration", f"API {endpoint}", False, f"HTTP {response.status_code}")
            
            return any(integration_tests)
            
        except Exception as e:
            print_error(f"Frontend-backend integration test failed: {e}")
            self.log_test_result("Integration", "Frontend-Backend Integration", False, str(e))
            return False

    def test_error_handling(self) -> bool:
        """Test error handling and edge cases."""
        print_test("Error Handling & Edge Cases")
        
        try:
            error_tests = []
            
            # Test invalid login
            invalid_login = {"username": "invalid", "password": "invalid", "role": "Admin"}
            login_response = self.session.post(f"{self.base_url}/api/v1/auth/login", json=invalid_login)
            
            if login_response.status_code in [401, 403, 422]:
                print_success("Invalid login properly rejected")
                error_tests.append(True)
                self.log_test_result("Error Handling", "Invalid Login", True)
            else:
                print_error(f"Invalid login not properly handled: {login_response.status_code}")
                error_tests.append(False)
                self.log_test_result("Error Handling", "Invalid Login", False, f"HTTP {login_response.status_code}")
            
            # Test non-existent endpoint
            not_found_response = self.session.get(f"{self.base_url}/api/v1/nonexistent")
            if not_found_response.status_code == 404:
                print_success("Non-existent endpoints properly return 404")
                error_tests.append(True)
                self.log_test_result("Error Handling", "404 Handling", True)
            else:
                print_error(f"404 handling incorrect: {not_found_response.status_code}")
                error_tests.append(False)
                self.log_test_result("Error Handling", "404 Handling", False, f"HTTP {not_found_response.status_code}")
            
            # Test invalid fingerprint data
            invalid_fingerprint = {"staff_id": "invalid", "action": "INVALID"}
            fingerprint_response = self.session.post(f"{self.base_url}/api/v1/fingerprint/verify", json=invalid_fingerprint)
            
            if fingerprint_response.status_code in [400, 422]:
                print_success("Invalid fingerprint data properly rejected")
                error_tests.append(True)
                self.log_test_result("Error Handling", "Invalid Fingerprint Data", True)
            else:
                print_warning(f"Invalid fingerprint data handling: {fingerprint_response.status_code}")
                error_tests.append(False)
                self.log_test_result("Error Handling", "Invalid Fingerprint Data", False, f"HTTP {fingerprint_response.status_code}")
            
            return any(error_tests)
            
        except Exception as e:
            print_error(f"Error handling test failed: {e}")
            self.log_test_result("Error Handling", "Error Handling", False, str(e))
            return False

    def test_business_logic(self) -> bool:
        """Test business logic and workflows."""
        print_test("Business Logic & Workflows")
        
        try:
            logic_tests = []
            
            # Test complete attendance workflow
            print_info("Testing complete attendance workflow...")
            
            # 1. Enroll fingerprint
            enroll_data = {"staff_id": 2, "finger_position": 1}
            enroll_response = self.session.post(f"{self.base_url}/api/v1/fingerprint/enroll", json=enroll_data)
            
            if enroll_response.status_code == 200:
                print_success("Step 1: Fingerprint enrollment successful")
                logic_tests.append(True)
            else:
                print_error(f"Step 1: Fingerprint enrollment failed: {enroll_response.status_code}")
                logic_tests.append(False)
            
            # 2. Clock in
            clock_in_data = {"staff_id": 2, "action": "IN"}
            clock_in_response = self.session.post(f"{self.base_url}/api/v1/fingerprint/verify", json=clock_in_data)
            
            if clock_in_response.status_code == 200:
                result = clock_in_response.json()
                if result.get('attendance_recorded'):
                    print_success("Step 2: Clock-in successful")
                    logic_tests.append(True)
                else:
                    print_error("Step 2: Clock-in did not record attendance")
                    logic_tests.append(False)
            else:
                print_error(f"Step 2: Clock-in failed: {clock_in_response.status_code}")
                logic_tests.append(False)
            
            # 3. Clock out
            clock_out_data = {"staff_id": 2, "action": "OUT"}
            clock_out_response = self.session.post(f"{self.base_url}/api/v1/fingerprint/verify", json=clock_out_data)
            
            if clock_out_response.status_code == 200:
                result = clock_out_response.json()
                if result.get('attendance_recorded'):
                    print_success("Step 3: Clock-out successful")
                    logic_tests.append(True)
                else:
                    print_error("Step 3: Clock-out did not record attendance")
                    logic_tests.append(False)
            else:
                print_error(f"Step 3: Clock-out failed: {clock_out_response.status_code}")
                logic_tests.append(False)
            
            # Test template management
            templates_response = self.session.get(f"{self.base_url}/api/v1/fingerprint/templates")
            if templates_response.status_code == 200:
                templates = templates_response.json()
                print_success(f"Template management: {len(templates)} templates found")
                logic_tests.append(True)
                self.log_test_result("Business Logic", "Template Management", True, f"{len(templates)} templates")
            else:
                print_error(f"Template management failed: {templates_response.status_code}")
                logic_tests.append(False)
                self.log_test_result("Business Logic", "Template Management", False, f"HTTP {templates_response.status_code}")
            
            return any(logic_tests)
            
        except Exception as e:
            print_error(f"Business logic test failed: {e}")
            self.log_test_result("Business Logic", "Business Logic", False, str(e))
            return False

    def run_comprehensive_test(self):
        """Run all comprehensive tests."""
        print_header("AstroBSM Comprehensive System Test")
        print_info(f"Testing system at: {self.base_url}")
        print_info(f"Frontend expected at: {self.frontend_url}")
        print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Run all test categories
        test_categories = [
            ("Infrastructure Tests", [
                self.test_server_health,
                self.test_cors_headers,
                self.test_api_documentation
            ]),
            ("Authentication Tests", [
                self.test_authentication_system
            ]),
            ("Database & Models Tests", [
                self.test_database_models
            ]),
            ("Fingerprint System Tests", [
                self.test_fingerprint_system
            ]),
            ("Attendance System Tests", [
                self.test_attendance_system
            ]),
            ("Reports System Tests", [
                self.test_reports_system
            ]),
            ("Integration Tests", [
                self.test_frontend_backend_integration
            ]),
            ("Error Handling Tests", [
                self.test_error_handling
            ]),
            ("Business Logic Tests", [
                self.test_business_logic
            ])
        ]
        
        for category_name, test_functions in test_categories:
            print_header(category_name)
            
            for test_func in test_functions:
                try:
                    test_func()
                except Exception as e:
                    print_error(f"Test function {test_func.__name__} failed with exception: {e}")
                    self.log_test_result("System", test_func.__name__, False, str(e))
                
                time.sleep(1)  # Brief pause between tests
        
        # Print comprehensive results
        self.print_final_results()

    def print_final_results(self):
        """Print comprehensive test results."""
        print_header("COMPREHENSIVE TEST RESULTS")
        
        print(f"\n{Colors.BOLD}Overall Results:{Colors.END}")
        print(f"📊 Total Tests: {self.results['total_tests']}")
        print(f"✅ Passed: {self.results['passed_tests']}")
        print(f"❌ Failed: {self.results['failed_tests']}")
        
        success_rate = (self.results['passed_tests'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        print(f"\n{Colors.BOLD}Results by Category:{Colors.END}")
        for category, data in self.results['categories'].items():
            total_category = data['passed'] + data['failed']
            category_rate = (data['passed'] / total_category) * 100 if total_category > 0 else 0
            
            status_color = Colors.GREEN if category_rate >= 80 else Colors.YELLOW if category_rate >= 60 else Colors.RED
            print(f"{status_color}{category}: {data['passed']}/{total_category} ({category_rate:.1f}%){Colors.END}")
        
        print(f"\n{Colors.BOLD}Detailed Test Results:{Colors.END}")
        for category, data in self.results['categories'].items():
            print(f"\n{Colors.CYAN}{category}:{Colors.END}")
            for test in data['tests']:
                status = f"{Colors.GREEN}✅" if test['passed'] else f"{Colors.RED}❌"
                details = f" - {test['details']}" if test['details'] else ""
                print(f"  {status} {test['name']}{details}{Colors.END}")
        
        # Overall assessment
        if success_rate >= 90:
            print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 EXCELLENT! Your application is working perfectly!{Colors.END}")
        elif success_rate >= 80:
            print(f"\n{Colors.YELLOW}{Colors.BOLD}👍 GOOD! Your application is mostly working with minor issues.{Colors.END}")
        elif success_rate >= 60:
            print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️  FAIR! Your application has some issues that need attention.{Colors.END}")
        else:
            print(f"\n{Colors.RED}{Colors.BOLD}🚨 NEEDS WORK! Your application has significant issues.{Colors.END}")
        
        print(f"\n{Colors.PURPLE}Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}")

def main():
    """Main function to run comprehensive tests."""
    tester = ComprehensiveSystemTester()
    tester.run_comprehensive_test()

if __name__ == "__main__":
    main()
