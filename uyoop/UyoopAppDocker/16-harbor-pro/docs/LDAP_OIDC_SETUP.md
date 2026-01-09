# ============================================================================
# Harbor LDAP/OIDC Configuration Guide
# ============================================================================

## LDAP Configuration

To enable LDAP authentication in Harbor:

1. **Update .env file:**
```
LDAP_URL=ldap://ldap.example.com:389
LDAP_SEARCHDN=cn=admin,dc=example,dc=com
LDAP_SEARCH_FILTER=(uid=%s)
LDAP_UID=uid
LDAP_BIND_PASSWORD=your_ldap_password
```

2. **LDAP Connection Parameters:**
- **LDAP_URL**: Full LDAP connection string
- **LDAP_SEARCHDN**: Distinguished name for LDAP search
- **LDAP_SEARCH_FILTER**: Filter pattern (uid, mail, or custom attribute)
- **LDAP_UID**: User identifier attribute (typically: uid, cn, sAMAccountName for AD)
- **LDAP_SCOPE**: Search scope (0=base, 1=onelevel, 2=subtree)
- **LDAP_TIMEOUT**: Connection timeout in seconds
- **LDAP_VERIFY_CERT**: Verify SSL certificate (true/false)

3. **OpenLDAP Example:**
```yaml
LDAP_URL: "ldap://ldap.example.com:389"
LDAP_SEARCHDN: "cn=admin,dc=example,dc=com"
LDAP_SEARCH_FILTER: "(uid=%s)"
LDAP_UID: "uid"
LDAP_BIND_PASSWORD: "admin_password"
```

4. **Active Directory Example:**
```yaml
LDAP_URL: "ldap://ad.example.com:389"
LDAP_SEARCHDN: "CN=ServiceAccount,OU=Users,DC=example,DC=com"
LDAP_SEARCH_FILTER: "(sAMAccountName=%s)"
LDAP_UID: "sAMAccountName"
LDAP_BIND_PASSWORD: "service_account_password"
```

5. **Test LDAP Connection:**
```bash
docker compose exec harbor-core \
  ldapwhoami -h ldap.example.com -D "cn=admin,dc=example,dc=com" -w password
```

## OIDC Configuration

To enable OIDC authentication (OAuth2/OpenID Connect):

1. **Update .env file:**
```
OIDC_NAME=Azure AD
OIDC_ENDPOINT=https://login.microsoftonline.com/common/oauth2/v2.0
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_SCOPE=openid,profile,email
OIDC_USER_CLAIM=name
OIDC_GROUPS_CLAIM=groups
```

2. **OIDC Parameters:**
- **OIDC_NAME**: Display name for OIDC provider
- **OIDC_ENDPOINT**: OpenID Connect endpoint URL
- **OIDC_CLIENT_ID**: Application client ID
- **OIDC_CLIENT_SECRET**: Application client secret
- **OIDC_SCOPE**: Requested scopes (space-separated)
- **OIDC_VERIFY_CERT**: Verify SSL certificate (true/false)
- **OIDC_USER_CLAIM**: Claim attribute for username
- **OIDC_GROUPS_CLAIM**: Claim attribute for groups

3. **Azure AD Configuration:**
```yaml
OIDC_NAME: "Azure AD"
OIDC_ENDPOINT: "https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0"
OIDC_CLIENT_ID: "YOUR_APPLICATION_ID"
OIDC_CLIENT_SECRET: "YOUR_CLIENT_SECRET"
OIDC_SCOPE: "openid profile email"
OIDC_USER_CLAIM: "name"
OIDC_GROUPS_CLAIM: "groups"
```

4. **Keycloak Configuration:**
```yaml
OIDC_NAME: "Keycloak"
OIDC_ENDPOINT: "https://keycloak.example.com/auth/realms/harbor/.well-known/openid-configuration"
OIDC_CLIENT_ID: "harbor"
OIDC_CLIENT_SECRET: "your-client-secret"
OIDC_SCOPE: "openid profile email"
OIDC_USER_CLAIM: "preferred_username"
OIDC_GROUPS_CLAIM: "roles"
```

5. **Google OAuth2 Configuration:**
```yaml
OIDC_NAME: "Google"
OIDC_ENDPOINT: "https://accounts.google.com"
OIDC_CLIENT_ID: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
OIDC_CLIENT_SECRET: "YOUR_GOOGLE_CLIENT_SECRET"
OIDC_SCOPE: "openid profile email"
OIDC_USER_CLAIM: "email"
```

6. **Verify OIDC Configuration:**
- Restart services: `docker compose restart harbor-core`
- Check logs: `docker compose logs harbor-core`
- Test login through web UI with OIDC provider

## RBAC Configuration

### Project-Level RBAC

1. **Built-in Roles:**
   - **Project Admin**: Full project permissions
   - **Repository Admin**: Manage repositories
   - **Developer**: Push and pull images
   - **Guest**: Pull-only access

2. **API-Based RBAC Configuration:**
```bash
# Create project with initial member
curl -X POST http://localhost/api/v2.0/projects \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "my-project",
    "public": false,
    "metadata": {
      "auto_scan": "true",
      "severity": "high"
    }
  }'

# Add member with role
curl -X POST http://localhost/api/v2.0/projects/{project_id}/members \
  -H "Content-Type: application/json" \
  -d '{
    "role_id": 2,
    "member_user": {
      "username": "user@example.com"
    }
  }'
```

3. **Role IDs:**
   - 1: Project Admin
   - 2: Repository Admin
   - 3: Developer
   - 4: Guest

### User Group Management (LDAP/OIDC)

1. **Auto-add LDAP groups:**
```bash
# Map LDAP group to Harbor group
curl -X POST http://localhost/api/v2.0/usergroups \
  -H "Content-Type: application/json" \
  -d '{
    "group_name": "harbor-developers",
    "group_type": 1,
    "ldap_group_dn": "cn=developers,ou=groups,dc=example,dc=com"
  }'
```

2. **Assign group roles:**
```bash
# Add group to project
curl -X POST http://localhost/api/v2.0/projects/{project_id}/members \
  -H "Content-Type: application/json" \
  -d '{
    "role_id": 3,
    "member_group": {
      "group_id": {group_id}
    }
  }'
```

## Security Considerations

1. **SSL/TLS:**
   - Always use HTTPS for LDAP and OIDC endpoints
   - Set `LDAP_VERIFY_CERT: true`
   - Set `OIDC_VERIFY_CERT: true`

2. **Credentials:**
   - Store LDAP bind password in secure vault
   - Use strong OIDC client secret
   - Rotate secrets regularly

3. **Audit:**
   - Enable Harbor audit logging
   - Monitor authentication failures
   - Review RBAC changes regularly

4. **Session Management:**
   - Set appropriate session timeout
   - Enable token refresh
   - Regular session cleanup

## Troubleshooting

1. **LDAP Authentication Failures:**
```bash
# Check LDAP connection
docker compose logs harbor-core | grep -i ldap

# Test LDAP from container
docker compose exec harbor-core bash
ldapsearch -x -H ldap://ldap.example.com:389 \
  -D "cn=admin,dc=example,dc=com" \
  -W -b "dc=example,dc=com" "(uid=testuser)"
```

2. **OIDC Login Issues:**
```bash
# Check OIDC configuration
docker compose logs harbor-core | grep -i oidc

# Verify OIDC endpoint accessibility
curl https://login.microsoftonline.com/common/oauth2/v2.0/.well-known/openid-configuration

# Check redirect URI configuration
# Ensure redirect URI in OIDC provider matches: https://harbor.example.com/c/oidc/callback
```

3. **Group Sync Issues:**
```bash
# Manually trigger group sync
curl -X PUT http://localhost/api/v2.0/system/ldap/test \
  -H "Content-Type: application/json" \
  -d '{"ldap_url": "ldap://ldap.example.com:389"}'
```

## Disaster Recovery

1. **Reset to Local Database Auth:**
```bash
docker compose exec postgres-primary psql -U postgres -d harbor -c \
  "UPDATE admin_job SET deleted = 1 WHERE job_type = 'ldap_sync';"
```

2. **Reset Admin Password:**
```bash
docker compose exec harbor-core \
  curl -X PUT http://localhost:8080/api/v2.0/users/1/password \
  -H "Content-Type: application/json" \
  -d '{"new_password": "new_admin_password"}'
```

## References

- [Harbor LDAP Documentation](https://goharbor.io/docs/edge/administration/configure-authentication/ldap-oidc/)
- [OIDC Specification](https://openid.net/developers/specs/)
- [Azure AD Integration](https://learn.microsoft.com/en-us/azure/active-directory/)
- [Keycloak Docker Setup](https://www.keycloak.org/getting-started/getting-started-docker)
