from datetime import datetime, timedelta

# Données de test
MEETING_DATA = {
    "title": "Test Meeting",
    "start": datetime.utcnow().isoformat(),
    "end": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
    "type": "meeting",
    "extra": {"subtype": "daily"}
}

DEPLOYMENT_DATA = {
    "title": "Test Deployment",
    "start": datetime.utcnow().isoformat(),
    "end": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
    "type": "deployment_window",
    "extra": {"environment": "prod"}
}

GIT_ACTION_DATA = {
    "title": "Test Git Action",
    "start": datetime.utcnow().isoformat(),
    "end": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
    "type": "git_action",
    "extra": {
        "repo_url": "https://github.com/example/repo.git", 
        "branch": "main",
        "action": "clone"
    }
}

def get_headers(tokens, role):
    return {"Authorization": f"Bearer {tokens[role]}"}

# --- TESTS ADMIN ---

def test_admin_can_do_everything(client, auth_tokens):
    headers = get_headers(auth_tokens, "ADMIN")
    
    # Create Meeting
    res = client.post("/events", json=MEETING_DATA, headers=headers)
    assert res.status_code == 200
    meeting_id = res.json()["id"]

    # Create Deployment
    res = client.post("/events", json=DEPLOYMENT_DATA, headers=headers)
    assert res.status_code == 200
    
    # Create Git Action
    res = client.post("/events", json=GIT_ACTION_DATA, headers=headers)
    assert res.status_code == 200
    git_id = res.json()["id"]
    
    # Delete (cleanup) - Expect 204 No Content
    res = client.delete(f"/events/{meeting_id}", headers=headers)
    assert res.status_code == 204
    res = client.delete(f"/events/{git_id}", headers=headers)
    assert res.status_code == 204


# --- TESTS PROJET ---

def test_projet_can_create_all_events(client, auth_tokens):
    headers = get_headers(auth_tokens, "PROJET")
    
    # Meeting
    res = client.post("/events", json=MEETING_DATA, headers=headers)
    assert res.status_code == 200
    
    # Deployment
    res = client.post("/events", json=DEPLOYMENT_DATA, headers=headers)
    assert res.status_code == 200
    
    # Git
    res = client.post("/events", json=GIT_ACTION_DATA, headers=headers)
    assert res.status_code == 200

def test_projet_cannot_delete_others_event(client, auth_tokens):
    admin_headers = get_headers(auth_tokens, "ADMIN")
    projet_headers = get_headers(auth_tokens, "PROJET")
    
    # Admin crée un event
    res = client.post("/events", json=MEETING_DATA, headers=admin_headers)
    event_id = res.json()["id"]
    
    # Projet essaie de le supprimer
    res = client.delete(f"/events/{event_id}", headers=projet_headers)
    assert res.status_code == 403

# --- TESTS DEV ---

def test_dev_permissions(client, auth_tokens):
    headers = get_headers(auth_tokens, "DEV")
    
    # Cannot create Meeting
    res = client.post("/events", json=MEETING_DATA, headers=headers)
    assert res.status_code == 403
    
    # Cannot create Deployment
    res = client.post("/events", json=DEPLOYMENT_DATA, headers=headers)
    assert res.status_code == 403
    
    # CAN create Git Action
    res = client.post("/events", json=GIT_ACTION_DATA, headers=headers)
    assert res.status_code == 200

# --- TESTS OPS ---

def test_ops_permissions(client, auth_tokens):
    headers = get_headers(auth_tokens, "OPS")
    
    # Cannot create Meeting
    res = client.post("/events", json=MEETING_DATA, headers=headers)
    assert res.status_code == 403
    
    # CAN create Deployment
    res = client.post("/events", json=DEPLOYMENT_DATA, headers=headers)
    assert res.status_code == 200
    
    # Cannot create Git Action
    res = client.post("/events", json=GIT_ACTION_DATA, headers=headers)
    assert res.status_code == 403

# --- TESTS CROSS-ROLES (Portage des cas limites) ---

def test_dev_cannot_modify_projet_meeting(client, auth_tokens):
    projet_headers = get_headers(auth_tokens, "PROJET")
    dev_headers = get_headers(auth_tokens, "DEV")
    
    # Projet crée meeting
    res = client.post("/events", json=MEETING_DATA, headers=projet_headers)
    assert res.status_code == 200
    event_id = res.json()["id"]
    
    # Dev essaie de modifier
    res = client.put(f"/events/{event_id}", json=MEETING_DATA, headers=dev_headers)
    assert res.status_code == 403

def test_admin_can_modify_projet_meeting(client, auth_tokens):
    projet_headers = get_headers(auth_tokens, "PROJET")
    admin_headers = get_headers(auth_tokens, "ADMIN")
    
    # Projet crée meeting
    res = client.post("/events", json=MEETING_DATA, headers=projet_headers)
    event_id = res.json()["id"]
    
    # Admin modifie
    new_data = MEETING_DATA.copy()
    new_data["title"] = "Modified by Admin"
    res = client.put(f"/events/{event_id}", json=new_data, headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["title"] == "Modified by Admin"

def test_admin_can_change_user_role(client, auth_tokens):
    admin_headers = get_headers(auth_tokens, "ADMIN")
    
    # On récupère l'ID du user DEV (créé par fixture)
    # Dans conftest, DEV a ID 2
    res = client.put("/users/2", json={"username": "dev_test", "role": "OPS", "password": "x"}, headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["role"] == "OPS"

def test_dev_cannot_change_user_role(client, auth_tokens):
    dev_headers = get_headers(auth_tokens, "DEV")
    res = client.put("/users/3", json={"username": "ops_test", "role": "ADMIN", "password": "x"}, headers=dev_headers)
    assert res.status_code == 403
