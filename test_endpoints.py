import requests
import json

# Test the server endpoints
base_url = "http://localhost:8080"

print("🧪 Testing server endpoints...")

# Test 1: Root endpoint (should serve React app)
try:
    response = requests.get(f"{base_url}/")
    print(f"✅ Root endpoint: {response.status_code}")
    if "AstroBSM-Oracle IVANSTAMAS" in response.text:
        print("✅ React app title found in response")
    else:
        print("⚠️  React app title not found")
except Exception as e:
    print(f"❌ Root endpoint failed: {e}")

# Test 2: API Status
try:
    response = requests.get(f"{base_url}/api/status")
    print(f"✅ API Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Status: {data.get('status')}")
except Exception as e:
    print(f"❌ API Status failed: {e}")

# Test 3: Health check
try:
    response = requests.get(f"{base_url}/health")
    print(f"✅ Health check: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Health: {data.get('status')}")
        print(f"   Static files exist: {data.get('static_files_exist')}")
except Exception as e:
    print(f"❌ Health check failed: {e}")

# Test 4: Static file (JS)
try:
    response = requests.get(f"{base_url}/static/static/js/main.4ad325a9.js")
    print(f"✅ JavaScript file: {response.status_code}")
    if response.status_code == 200 and len(response.text) > 1000:
        print("✅ JavaScript file content looks good")
    else:
        print("⚠️  JavaScript file may be corrupted or empty")
except Exception as e:
    print(f"❌ JavaScript file failed: {e}")

# Test 5: Static file (CSS)
try:
    response = requests.get(f"{base_url}/static/static/css/main.d02d60bb.css")
    print(f"✅ CSS file: {response.status_code}")
    if response.status_code == 200 and len(response.text) > 100:
        print("✅ CSS file content looks good")
    else:
        print("⚠️  CSS file may be corrupted or empty")
except Exception as e:
    print(f"❌ CSS file failed: {e}")

# Test 6: Service Worker
try:
    response = requests.get(f"{base_url}/static/service-worker.js")
    print(f"✅ Service Worker: {response.status_code}")
except Exception as e:
    print(f"❌ Service Worker failed: {e}")

# Test 7: Manifest
try:
    response = requests.get(f"{base_url}/static/manifest.json")
    print(f"✅ Manifest: {response.status_code}")
except Exception as e:
    print(f"❌ Manifest failed: {e}")

print("\n🎉 Test completed!")
