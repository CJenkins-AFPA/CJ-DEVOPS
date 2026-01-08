#!/usr/bin/env python3
"""
Script de test RBAC pour le calendrier DevOps
Teste les permissions de création, modification et suppression d'événements
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://127.0.0.1:8000"

def get_user_by_username(username: str) -> Dict[str, Any]:
    """Récupère un utilisateur par son nom d'utilisateur"""
    response = requests.get(f"{BASE_URL}/users")
    users = response.json()
    for user in users:
        if user['username'] == username:
            return user
    raise ValueError(f"User {username} not found")

def create_event(user_id: int, event_data: Dict[str, Any]) -> tuple[int, Dict]:
    """Crée un événement et retourne (status_code, response)"""
    headers = {"X-User-Id": str(user_id), "Content-Type": "application/json"}
    response = requests.post(f"{BASE_URL}/events", headers=headers, json=event_data)
    try:
        return response.status_code, response.json()
    except:
        return response.status_code, {"error": response.text}

def update_event(user_id: int, event_id: int, event_data: Dict[str, Any]) -> tuple[int, Dict]:
    """Modifie un événement et retourne (status_code, response)"""
    headers = {"X-User-Id": str(user_id), "Content-Type": "application/json"}
    response = requests.put(f"{BASE_URL}/events/{event_id}", headers=headers, json=event_data)
    try:
        return response.status_code, response.json()
    except:
        return response.status_code, {"error": response.text}

def delete_event(user_id: int, event_id: int) -> int:
    """Supprime un événement et retourne le status code"""
    headers = {"X-User-Id": str(user_id)}
    response = requests.delete(f"{BASE_URL}/events/{event_id}", headers=headers)
    return response.status_code

def update_user(user_id: int, target_user_id: int, new_role: str) -> tuple[int, Dict]:
    """Modifie le rôle d'un utilisateur"""
    headers = {"X-User-Id": str(user_id), "Content-Type": "application/json"}
    response = requests.put(f"{BASE_URL}/users/{target_user_id}", headers=headers, 
                           json={"username": "dummy", "role": new_role})
    try:
        return response.status_code, response.json()
    except:
        return response.status_code, {"error": response.text}

def delete_user(user_id: int, target_user_id: int) -> int:
    """Supprime un utilisateur"""
    headers = {"X-User-Id": str(user_id)}
    response = requests.delete(f"{BASE_URL}/users/{target_user_id}", headers=headers)
    return response.status_code

def run_git_action(user_id: int, event_id: int) -> tuple[int, Dict]:
    """Exécute une action Git"""
    headers = {"X-User-Id": str(user_id)}
    response = requests.post(f"{BASE_URL}/git/run/{event_id}", headers=headers)
    try:
        return response.status_code, response.json()
    except:
        return response.status_code, {"error": response.text}

def get_events() -> list:
    """Récupère tous les événements"""
    response = requests.get(f"{BASE_URL}/events")
    return response.json()

def print_test(name: str, expected: bool, actual: bool, details: str = ""):
    """Affiche le résultat d'un test"""
    symbol = "✓" if expected == actual else "✗"
    status = "PASS" if expected == actual else "FAIL"
    print(f"  {symbol} {name}: {status}")
    if details:
        print(f"    {details}")

def main():
    print("=" * 60)
    print("Tests RBAC - Calendrier DevOps")
    print("=" * 60)
    print()

    # Récupération des utilisateurs
    print("1. Récupération des utilisateurs de test...")
    try:
        admin = get_user_by_username("admin_test")
        dev = get_user_by_username("dev_test")
        ops = get_user_by_username("ops_test")
        projet = get_user_by_username("projet_test")
        
        print(f"  - ADMIN (admin_test): ID={admin['id']}")
        print(f"  - DEV (dev_test): ID={dev['id']}")
        print(f"  - OPS (ops_test): ID={ops['id']}")
        print(f"  - PROJET (projet_test): ID={projet['id']}")
        print()
    except Exception as e:
        print(f"  ✗ Erreur lors de la récupération des utilisateurs: {e}")
        return

    # Test 1: DEV ne peut PAS créer un meeting
    print("2. Test: DEV essaie de créer un meeting (doit échouer)...")
    status, resp = create_event(dev['id'], {
        "title": "Test Meeting DEV",
        "start": "2026-01-10T10:00:00",
        "end": "2026-01-10T11:00:00",
        "type": "meeting",
        "extra": {"subtype": "test"}
    })
    print_test("DEV bloqué pour meeting", True, status == 403, 
               f"Status: {status}, Message: {resp.get('detail', '')}")
    print()

    # Test 2: DEV PEUT créer un git_action
    print("3. Test: DEV crée un git_action (doit réussir)...")
    status, resp = create_event(dev['id'], {
        "title": "Test Git Action DEV",
        "start": "2026-01-10T14:00:00",
        "end": "2026-01-10T14:30:00",
        "type": "git_action",
        "extra": {
            "repo_url": "https://github.com/test/repo.git",
            "branch": "develop",
            "action": "clone_or_pull",
            "auto_trigger": False
        }
    })
    dev_git_event_id = resp.get('id') if status == 200 else None
    print_test("DEV peut créer git_action", True, status == 200,
               f"Status: {status}, Event ID: {dev_git_event_id}")
    print()

    # Test 3: OPS ne peut PAS créer un git_action
    print("4. Test: OPS essaie de créer un git_action (doit échouer)...")
    status, resp = create_event(ops['id'], {
        "title": "Test Git Action OPS",
        "start": "2026-01-11T10:00:00",
        "end": "2026-01-11T10:30:00",
        "type": "git_action",
        "extra": {}
    })
    print_test("OPS bloqué pour git_action", True, status == 403,
               f"Status: {status}, Message: {resp.get('detail', '')}")
    print()

    # Test 4: OPS PEUT créer un deployment_window
    print("5. Test: OPS crée un deployment_window (doit réussir)...")
    status, resp = create_event(ops['id'], {
        "title": "Test Deploy OPS",
        "start": "2026-01-11T16:00:00",
        "end": "2026-01-11T17:00:00",
        "type": "deployment_window",
        "extra": {
            "environment": "prod",
            "services": "API, Database",
            "description": "Mise à jour critique",
            "needs_approval": True
        }
    })
    ops_deploy_id = resp.get('id') if status == 200 else None
    print_test("OPS peut créer deployment_window", True, status == 200,
               f"Status: {status}, Event ID: {ops_deploy_id}")
    print()

    # Test 5: OPS ne peut PAS créer un meeting
    print("6. Test: OPS essaie de créer un meeting (doit échouer)...")
    status, resp = create_event(ops['id'], {
        "title": "Test Meeting OPS",
        "start": "2026-01-11T09:00:00",
        "end": "2026-01-11T10:00:00",
        "type": "meeting",
        "extra": {}
    })
    print_test("OPS bloqué pour meeting", True, status == 403,
               f"Status: {status}, Message: {resp.get('detail', '')}")
    print()

    # Test 6: PROJET peut créer tous les types
    print("7. Test: PROJET crée un meeting (doit réussir)...")
    status, resp = create_event(projet['id'], {
        "title": "Test Meeting PROJET",
        "start": "2026-01-12T09:00:00",
        "end": "2026-01-12T10:00:00",
        "type": "meeting",
        "extra": {
            "subtype": "standup",
            "link": "https://meet.example.com/test",
            "notes": "Daily standup"
        }
    })
    projet_meeting_id = resp.get('id') if status == 200 else None
    print_test("PROJET peut créer meeting", True, status == 200,
               f"Status: {status}, Event ID: {projet_meeting_id}")
    print()

    print("8. Test: PROJET crée un deployment_window (doit réussir)...")
    status, resp = create_event(projet['id'], {
        "title": "Test Deploy PROJET",
        "start": "2026-01-12T14:00:00",
        "end": "2026-01-12T15:00:00",
        "type": "deployment_window",
        "extra": {"environment": "staging", "services": "Frontend"}
    })
    print_test("PROJET peut créer deployment_window", True, status == 200,
               f"Status: {status}, Event ID: {resp.get('id')}")
    print()

    # Test 7: ADMIN peut tout créer
    print("9. Test: ADMIN crée un git_action (doit réussir)...")
    status, resp = create_event(admin['id'], {
        "title": "Test Git Action ADMIN",
        "start": "2026-01-13T10:00:00",
        "end": "2026-01-13T10:30:00",
        "type": "git_action",
        "extra": {"repo_url": "https://github.com/admin/repo.git", "branch": "main"}
    })
    print_test("ADMIN peut créer git_action", True, status == 200,
               f"Status: {status}, Event ID: {resp.get('id')}")
    print()

    # Test 8: Vérification de la persistance JSONB
    print("10. Test: Vérifier persistance des données extra JSONB...")
    if projet_meeting_id:
        events = get_events()
        projet_event = next((e for e in events if e['id'] == projet_meeting_id), None)
        if projet_event and projet_event.get('extra'):
            has_subtype = 'subtype' in projet_event['extra']
            has_link = 'link' in projet_event['extra']
            has_notes = 'notes' in projet_event['extra']
            print_test("Données JSONB persistées", True, 
                      has_subtype and has_link and has_notes,
                      f"Extra: {projet_event.get('extra')}")
        else:
            print_test("Données JSONB persistées", True, False,
                      "Event trouvé mais extra manquant")
    else:
        print("  ⚠ Test sauté: pas d'ID de meeting PROJET")
    print()

    # Test 9: Permissions de suppression
    print("11. Test: DEV essaie de supprimer l'événement d'OPS (doit échouer)...")
    if ops_deploy_id:
        status = delete_event(dev['id'], ops_deploy_id)
        print_test("DEV ne peut pas supprimer event d'OPS", True, status == 403,
                   f"Status: {status}")
    else:
        print("  ⚠ Test sauté: pas d'ID de deployment OPS")
    print()

    print("12. Test: OPS peut supprimer son propre événement (doit réussir)...")
    if ops_deploy_id:
        status = delete_event(ops['id'], ops_deploy_id)
        print_test("OPS peut supprimer son event", True, status == 204,
                   f"Status: {status}")
    else:
        print("  ⚠ Test sauté: pas d'ID de deployment OPS")
    print()

    print("13. Test: ADMIN peut supprimer n'importe quel événement...")
    if dev_git_event_id:
        status = delete_event(admin['id'], dev_git_event_id)
        print_test("ADMIN peut supprimer event de DEV", True, status == 204,
                   f"Status: {status}")
    else:
        print("  ⚠ Test sauté: pas d'ID de git_action DEV")
    print()

    print("=" * 60)
    print("Tests terminés - Phase 1")
    print("=" * 60)
    print()
    
    # ==================== PHASE 2: Tests Complémentaires ====================
    print("=" * 60)
    print("PHASE 2: Tests Complémentaires - Cas Limites")
    print("=" * 60)
    print()

    # Test 14: Édition croisée (DEV essaie de modifier meeting de PROJET)
    print("14. Test: DEV essaie de modifier un meeting créé par PROJET (doit échouer)...")
    if projet_meeting_id:
        status, resp = update_event(dev['id'], projet_meeting_id, {
            "title": "Meeting Modifié par DEV",
            "start": "2026-01-12T09:00:00",
            "end": "2026-01-12T10:00:00",
            "type": "meeting",
            "extra": {}
        })
        print_test("DEV ne peut pas modifier meeting de PROJET", True, status == 403,
                   f"Status: {status}, Message: {resp.get('detail', '')}")
    else:
        print("  ⚠ Test sauté: pas d'ID de meeting PROJET")
    print()

    # Test 15: ADMIN peut modifier n'importe quel événement
    print("15. Test: ADMIN modifie un événement créé par PROJET (doit réussir)...")
    if projet_meeting_id:
        status, resp = update_event(admin['id'], projet_meeting_id, {
            "title": "Meeting Modifié par ADMIN",
            "start": "2026-01-12T09:00:00",
            "end": "2026-01-12T10:00:00",
            "type": "meeting",
            "extra": {"subtype": "standup", "link": "", "notes": "Modifié"}
        })
        print_test("ADMIN peut modifier event de PROJET", True, status == 200,
                   f"Status: {status}")
    else:
        print("  ⚠ Test sauté: pas d'ID de meeting PROJET")
    print()

    # Test 16: Permissions sur /users (modification rôle)
    print("16. Test: DEV essaie de changer le rôle d'un utilisateur (doit échouer)...")
    status, resp = update_user(dev['id'], ops['id'], "ADMIN")
    print_test("DEV ne peut pas modifier rôles", True, status == 403,
               f"Status: {status}, Message: {resp.get('detail', '')}")
    print()

    # Test 17: ADMIN peut modifier rôles
    print("17. Test: ADMIN change le rôle d'un utilisateur (doit réussir)...")
    # Créer un user temporaire pour ce test
    temp_user_response = requests.post(f"{BASE_URL}/login", 
                                       json={"username": "temp_test_user", "role": "OPS"})
    temp_user = temp_user_response.json() if temp_user_response.status_code == 200 else {}
    if temp_user.get('id'):
        status, resp = update_user(admin['id'], temp_user['id'], "DEV")
        print_test("ADMIN peut modifier rôles", True, status == 200,
                   f"Status: {status}")
    else:
        print("  ⚠ Test sauté: impossible de créer user temporaire")
    print()

    # Test 18: Permissions sur DELETE /users
    print("18. Test: OPS essaie de supprimer un utilisateur (doit échouer)...")
    if temp_user.get('id'):
        status = delete_user(ops['id'], temp_user['id'])
        print_test("OPS ne peut pas supprimer users", True, status == 403,
                   f"Status: {status}")
    else:
        print("  ⚠ Test sauté: pas de user temporaire")
    print()

    # Test 19: ADMIN peut supprimer users
    print("19. Test: ADMIN supprime un utilisateur (doit réussir)...")
    if temp_user.get('id'):
        status = delete_user(admin['id'], temp_user['id'])
        print_test("ADMIN peut supprimer users", True, status == 204,
                   f"Status: {status}")
    else:
        print("  ⚠ Test sauté: pas de user temporaire")
    print()

    # Test 20: Endpoint Git Actions - OPS bloqué
    print("20. Test: OPS essaie d'exécuter une action Git (doit échouer)...")
    # Créer un git_action pour ce test
    status, git_event = create_event(dev['id'], {
        "title": "Test Git OPS",
        "start": "2026-01-15T10:00:00",
        "end": "2026-01-15T10:30:00",
        "type": "git_action",
        "extra": {"repo_url": "https://github.com/test/test.git", "branch": "main", "action": "clone"}
    })
    if status == 200 and git_event.get('id'):
        status_git, resp_git = run_git_action(ops['id'], git_event['id'])
        print_test("OPS ne peut pas exécuter git actions", True, status_git == 403,
                   f"Status: {status_git}, Message: {resp_git.get('detail', '')}")
        # Nettoyer
        delete_event(dev['id'], git_event['id'])
    else:
        print("  ⚠ Test sauté: impossible de créer git_action")
    print()

    # Test 21: DEV peut exécuter git actions
    print("21. Test: DEV exécute une action Git (validation endpoint)...")
    status, git_event = create_event(dev['id'], {
        "title": "Test Git DEV Execute",
        "start": "2026-01-15T11:00:00",
        "end": "2026-01-15T11:30:00",
        "type": "git_action",
        "extra": {"repo_url": "https://github.com/git/git.git", "branch": "main", "action": "clone"}
    })
    if status == 200 and git_event.get('id'):
        status_git, resp_git = run_git_action(dev['id'], git_event['id'])
        # Note: peut échouer si le repo est inaccessible, on vérifie juste les permissions
        print_test("DEV peut accéder endpoint git actions", True, status_git in [200, 500],
                   f"Status: {status_git} (200=OK, 500=erreur exec mais autorisé)")
        # Nettoyer
        delete_event(dev['id'], git_event['id'])
    else:
        print("  ⚠ Test sauté: impossible de créer git_action")
    print()

    # Test 22: Cas limite - X-User-Id invalide
    print("22. Test: Créer event avec X-User-Id invalide (doit échouer)...")
    headers = {"X-User-Id": "99999", "Content-Type": "application/json"}
    response = requests.post(f"{BASE_URL}/events", headers=headers, 
                           json={"title": "Test", "start": "2026-01-15T10:00:00", 
                                "end": "2026-01-15T11:00:00", "type": "meeting"})
    print_test("X-User-Id invalide rejeté", True, response.status_code == 401,
               f"Status: {response.status_code}")
    print()

    # Test 23: Cas limite - Pas de X-User-Id
    print("23. Test: Créer event sans X-User-Id (doit échouer)...")
    response = requests.post(f"{BASE_URL}/events", 
                           headers={"Content-Type": "application/json"},
                           json={"title": "Test", "start": "2026-01-15T10:00:00", 
                                "end": "2026-01-15T11:00:00", "type": "meeting"})
    print_test("Requête sans X-User-Id rejetée", True, response.status_code == 401,
               f"Status: {response.status_code}")
    print()

    print("=" * 60)
    print("Tests terminés - Phase 2")
    print("=" * 60)

if __name__ == "__main__":
    main()
