import os
import logging
import hvac
from app.core.config import settings

logger = logging.getLogger(__name__)

class VaultService:
    def __init__(self):
        self.client = None
        self.connect()

    def connect(self):
        url = os.getenv("VAULT_ADDR", settings.VAULT_ADDR)
        token = os.getenv("VAULT_TOKEN") # In Prod: AppRole or K8s Auth
        
        if not token:
            logger.warning("VAULT_TOKEN not found. Dynamic secrets will fail.")
            return

        try:
            self.client = hvac.Client(url=url, token=token)
            if self.client.is_authenticated():
                 logger.info(f"Connected to Vault at {url}")
            else:
                 logger.error("Vault authentication failed.")
        except Exception as e:
            logger.error(f"Could not connect to Vault: {e}")

    def get_database_credentials(self):
        """
        Fetches dynamic postgres credentials from Vault.
        Returns (username, password)
        """
        if not self.client:
            self.connect()
            if not self.client:
                raise Exception("Vault not connected")
        
        logger.info("Fetching dynamic database credentials...")
        try:
            # path should match setup-vault.sh: database/creds/uhub-backend
            response = self.client.read('database/creds/uhub-backend')
            if response and 'data' in response:
                username = response['data']['username']
                password = response['data']['password']
                logger.info(f"Generated dynamic creds for user: {username}")
                return username, password
            else:
                raise Exception("No data in Vault response")
        except Exception as e:
            logger.error(f"Error fetching DB creds: {e}")
            raise

vault_service = VaultService()
