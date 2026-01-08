"""
Client HashiCorp Vault pour gestion sécurisée des secrets
"""
import os
import hvac
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class VaultClient:
    """Client singleton pour interactions avec Vault"""
    
    _instance: Optional['VaultClient'] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        self.vault_addr = os.getenv('VAULT_ADDR', 'http://vault-1:8200')
        self.vault_token = os.getenv('VAULT_TOKEN') or os.getenv('VAULT_ROOT_TOKEN')
        # Support both naming conventions
        self.approle_role_id = os.getenv('VAULT_ROLE_ID') or os.getenv('VAULT_APPROLE_ROLE_ID')
        self.approle_secret_id = os.getenv('VAULT_SECRET_ID') or os.getenv('VAULT_APPROLE_SECRET_ID')
        self.vault_cacert = os.getenv('VAULT_CACERT')

        # Configure TLS verification
        verify = True
        if self.vault_cacert:
            verify = self.vault_cacert
        elif os.getenv('VAULT_SKIP_VERIFY') == '1':
            verify = False
            
        self.client = hvac.Client(url=self.vault_addr, verify=verify)

        # Prefer AppRole authentication if provided
        try:
            if self.approle_role_id and self.approle_secret_id:
                self.client.auth.approle.login(
                    role_id=self.approle_role_id,
                    secret_id=self.approle_secret_id,
                )
                logger.info("Authenticated to Vault via AppRole")
            elif self.vault_token:
                self.client.token = self.vault_token
                logger.info("Authenticated to Vault via Token")
            else:
                logger.warning("No Vault credentials provided (VAULT_ROLE_ID/VAULT_SECRET_ID or VAULT_TOKEN)")
        except Exception as e:
            logger.error(f"Vault authentication failed: {e}")
        
        self._initialized = True
        logger.info(f"Vault client initialized: {self.vault_addr}")
    
    def is_authenticated(self) -> bool:
        """Vérifie si le client est authentifié"""
        try:
            return self.client.is_authenticated()
        except Exception as e:
            logger.error(f"Vault authentication check failed: {e}")
            return False
    
    def read_secret(self, path: str) -> Optional[Dict[str, Any]]:
        """Lit un secret depuis Vault KV v2"""
        try:
            response = self.client.secrets.kv.v2.read_secret_version(
                path=path,
                mount_point='secret'
            )
            return response['data']['data']
        except Exception as e:
            logger.error(f"Failed to read secret {path}: {e}")
            return None
    
    def write_secret(self, path: str, data: Dict[str, Any]) -> bool:
        """Écrit un secret dans Vault KV v2"""
        try:
            self.client.secrets.kv.v2.create_or_update_secret(
                path=path,
                secret=data,
                mount_point='secret'
            )
            logger.info(f"Secret written to {path}")
            return True
        except Exception as e:
            logger.error(f"Failed to write secret {path}: {e}")
            return False
    
    def delete_secret(self, path: str) -> bool:
        """Supprime un secret de Vault"""
        try:
            self.client.secrets.kv.v2.delete_metadata_and_all_versions(
                path=path,
                mount_point='secret'
            )
            logger.info(f"Secret deleted: {path}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete secret {path}: {e}")
            return False
    
    # ===== TOTP Methods =====
    
    def totp_create_key(self, key_name: str, issuer: str = "uyoop-cal", account_name: str = None) -> Optional[Dict[str, Any]]:
        """Crée une clé TOTP dans Vault"""
        try:
            # Créer la clé TOTP avec generate=True pour obtenir url et barcode
            response = self.client.write(
                f'totp/keys/{key_name}',
                issuer=issuer,
                account_name=account_name or key_name,
                period=30,
                algorithm='SHA1',
                digits=6,
                generate=True
            )
            
            # La réponse contient directement url et barcode
            if not response or 'data' not in response:
                logger.error(f"Invalid response from Vault for key {key_name}")
                return None
            
            data = response['data']
            return {
                'key_name': key_name,
                'url': data.get('url', ''),
                'barcode': data.get('barcode', '')
            }
        except Exception as e:
            logger.error(f"Failed to create TOTP key {key_name}: {e}")
            return None
    
    def totp_generate_code(self, key_name: str) -> Optional[str]:
        """Génère un code TOTP (pour tests)"""
        try:
            response = self.client.read(f'totp/code/{key_name}')
            return response['data']['code']
        except Exception as e:
            logger.error(f"Failed to generate TOTP code for {key_name}: {e}")
            return None
    
    def totp_validate_code(self, key_name: str, code: str) -> bool:
        """Valide un code TOTP"""
        try:
            response = self.client.write(
                f'totp/code/{key_name}',
                code=code
            )
            return response['data']['valid']
        except Exception as e:
            logger.error(f"Failed to validate TOTP code for {key_name}: {e}")
            return False
    
    def totp_delete_key(self, key_name: str) -> bool:
        """Supprime une clé TOTP"""
        try:
            self.client.delete(f'totp/keys/{key_name}')
            logger.info(f"TOTP key deleted: {key_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete TOTP key {key_name}: {e}")
            return False


# Instance globale
vault_client = VaultClient()
