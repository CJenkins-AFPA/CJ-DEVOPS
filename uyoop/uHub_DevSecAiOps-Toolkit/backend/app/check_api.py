import requests
import sys

# Internal URL inside container
BASE_URL = "http://localhost:8000/api/v1"

def test_flow():
    # 1. Login
    print("Logging in...")
    try:
        resp = requests.post(f"{BASE_URL}/login/access-token", data={"username": "demo-admin", "password": "demo-admin"})
        if resp.status_code != 200:
            print(f"Login Failed: {resp.status_code} {resp.text}")
            sys.exit(1)
        token = resp.json()["access_token"]
        print("Login OK.")
    except Exception as e:
        print(f"Login Exception: {e}")
        sys.exit(1)

    # 2. Create Project
    print("Creating Project...")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"name": "Internal Test Project", "description": "Created from internal script", "status": "active"}
    
    # Try with trailing slash
    resp = requests.post(f"{BASE_URL}/projects/", json=payload, headers=headers)
    
    if resp.status_code == 200:
        print(f"Project Created OK: {resp.json()}")
    else:
        print(f"Create Failed: {resp.status_code} {resp.text}")
        # Try without slash to see redirect
        resp2 = requests.post(f"{BASE_URL}/projects", json=payload, headers=headers)
        print(f"Retry without slash: {resp2.status_code}")

if __name__ == "__main__":
    test_flow()
