#!/usr/bin/env python3
"""
Test script to verify the deployment is working correctly.
Run this after deployment to check all endpoints.
"""

import requests
import sys
import time

def test_deployment(base_url):
    """Test the deployed application endpoints."""
    
    print(f"🧪 Testing deployment at: {base_url}")
    print("=" * 50)
    
    # Test endpoints
    endpoints = [
        ("/", "React Frontend"),
        ("/health", "Health Check"),
        ("/test", "Test Endpoint"),
        ("/docs", "API Documentation"),
        ("/api/v1/auth/health", "Auth Health Check"),
    ]
    
    results = []
    
    for endpoint, description in endpoints:
        url = f"{base_url.rstrip('/')}{endpoint}"
        try:
            print(f"Testing {description}: {url}")
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                print(f"✅ {description}: OK (200)")
                results.append(True)
            else:
                print(f"❌ {description}: Failed ({response.status_code})")
                print(f"   Response: {response.text[:200]}...")
                results.append(False)
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {description}: Connection Error - {e}")
            results.append(False)
        
        time.sleep(1)  # Brief pause between requests
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {sum(results)}/{len(results)} endpoints passed")
    
    if all(results):
        print("🎉 All tests passed! Deployment is successful.")
        return True
    else:
        print("⚠️  Some tests failed. Check the deployment logs.")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_deployment.py <app_url>")
        print("Example: python test_deployment.py https://your-app-name.ondigitalocean.app")
        sys.exit(1)
    
    app_url = sys.argv[1]
    success = test_deployment(app_url)
    sys.exit(0 if success else 1)
