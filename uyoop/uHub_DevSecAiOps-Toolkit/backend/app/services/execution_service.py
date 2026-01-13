import asyncio
import logging
from datetime import datetime, timezone
import asyncssh
import hvac
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.job import Job, JobCommandType
from app.models.run import Run, RunStatus

logger = logging.getLogger(__name__)

class ExecutionService:
    def __init__(self):
        self._vault_client = None

    @property
    def vault_client(self):
        if not self._vault_client:
            self._vault_client = hvac.Client(
                url=settings.VAULT_ADDR,
                token=settings.VAULT_TOKEN
            )
        return self._vault_client

    async def get_credential(self, key: str):
        """Fetch credential from Vault kv store"""
        # Path: secret/data/credentials/{key}
        try:
            # Note: hvac is synchronous, but fast enough for v1. 
            # Ideally run in executor if latency is high.
            response = self.vault_client.secrets.kv.v2.read_secret_version(
                path=f"credentials/{key}",
                mount_point="secret"
            )
            # Vault KV v2 returns data in ['data']['data']
            return response['data']['data']
        except Exception as e:
            logger.error(f"Failed to fetch credential {key} from Vault: {e}")
            raise ValueError(f"Credential {key} not found or inaccessible")

    async def run_job(self, db: AsyncSession, job_id: int) -> Run:
        """
        Execute a job (Local Shell or SSH).
        Creates a Run record and updates it.
        """
        # Fetch Job
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalars().first()
        if not job:
            raise ValueError(f"Job {job_id} not found")

        # Create Run (Pending -> Running)
        run = Run(
            job_id=job.id,
            status=RunStatus.running,
            started_at=datetime.now(timezone.utc)
        )
        db.add(run)
        
        # Update Job status
        job.status = "running"
        db.add(job)
        
        await db.commit()
        await db.refresh(run)

        stdout = ""
        stderr = ""
        exit_code = -1

        try:
            if job.command_type == JobCommandType.shell:
                stdout, stderr, exit_code = await self._run_local(job.command, job.working_dir)
            
            elif job.command_type == JobCommandType.ssh:
                stdout, stderr, exit_code = await self._run_ssh(job)
                
            else:
                raise ValueError(f"Unsupported command type: {job.command_type}")

            # Update success/failure
            run.status = RunStatus.success if exit_code == 0 else RunStatus.failed
            job.status = "success" if exit_code == 0 else "failed"

        except Exception as e:
            logger.exception(f"Execution failed for job {job_id}")
            stderr = f"Execution Error: {str(e)}"
            run.status = RunStatus.failed
            job.status = "failed"
        
        # Finalize Run
        run.stdout = stdout
        run.stderr = stderr
        run.exit_code = exit_code
        run.ended_at = datetime.now(timezone.utc)
        
        db.add(run)
        db.add(job)
        await db.commit()
        await db.refresh(run)
        
        return run

    async def _run_local(self, command: str, cwd: str = None):
        """Run command on the container itself"""
        logger.info(f"Running local command: {command}")
        proc = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=cwd
        )
        stdout_bytes, stderr_bytes = await proc.communicate()
        return stdout_bytes.decode(), stderr_bytes.decode(), proc.returncode

    async def _run_ssh(self, job: Job):
        """Run command via SSH using Vault credentials"""
        if not job.credential_key:
            raise ValueError("SSH Job requires credential_key to be set")
        
        creds = await asyncio.to_thread(self.get_credential, job.credential_key)
        
        host = job.target_host
        if not host:
             raise ValueError("SSH Job requires target_host")
             
        username = job.target_user or creds.get('username') or 'root'
        password = creds.get('password')
        private_key = creds.get('private_key')
        
        logger.info(f"Connecting to {username}@{host}...")
        
        # Known Hosts: In production, verify this. For demo/MVP, accept all (Security Risk!)
        # Use known_hosts=None
        
        try:
            async with asyncssh.connect(
                host, 
                username=username, 
                password=password, 
                client_keys=[private_key] if private_key else None,
                known_hosts=None 
            ) as conn:
                result = await conn.run(job.command, check=False)
                return result.stdout, result.stderr, result.exit_status
                
        except (OSError, asyncssh.Error) as e:
            raise RuntimeError(f"SSH Connection Failed: {e}")

execution_service = ExecutionService()
