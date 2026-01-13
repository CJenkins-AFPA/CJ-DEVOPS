import asyncio
import logging
import os
import shutil
from pathlib import Path

# V1: Use subprocess. Later: GitPython or Dulwich if needed.
# Subprocess gives us control over the environment and ssh keys easier.

logger = logging.getLogger(__name__)

class GitService:
    def __init__(self, base_workdir: str = "/tmp/uhub/repos"):
        self.base_workdir = Path(base_workdir)
        self.base_workdir.mkdir(parents=True, exist_ok=True)

    async def _run_git(self, cwd: Path, args: list[str]) -> tuple[int, str, str]:
        """
        Run a git command in the given directory.
        """
        cmd = ["git"] + args
        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=str(cwd),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        return process.returncode, stdout.decode().strip(), stderr.decode().strip()

    async def clone_or_pull(self, repo_url: str, repo_name: str) -> Path:
        """
        Clones the repo if not exists, or fetches if it does.
        Returns the path to the repo.
        """
        # Security Note: In production, we must sanitize repo_name to avoid directory traversal
        # Assuming database IDs or safe names are used.
        target_dir = self.base_workdir / repo_name

        if target_dir.exists() and (target_dir / ".git").exists():
            logger.info(f"Repo {repo_name} exists. Fetching updates.")
            code, out, err = await self._run_git(target_dir, ["fetch", "--all"])
            if code != 0:
                logger.error(f"Git fetch failed: {err}")
                raise Exception(f"Git fetch failed: {err}")
            # Reset to origin/HEAD? Or just fetch? 
            # For execution, we usually want to checkout a specific ref later.
            # But let's pull to be typically up to date with default branch.
            # code, out, err = await self._run_git(target_dir, ["pull"])
        else:
            logger.info(f"Cloning {repo_url} to {target_dir}")
            # If dir exists but effectively empty or corrupt, clean it
            if target_dir.exists():
                shutil.rmtree(target_dir)
            
            # Need to run clone from parent dir
            code, out, err = await self._run_git(self.base_workdir, ["clone", repo_url, repo_name])
            if code != 0:
                 logger.error(f"Git clone failed: {err}")
                 raise Exception(f"Git clone failed: {err}")
        
        return target_dir

    async def checkout(self, repo_path: Path, ref: str):
        """
        Checkout a specific ref (branch, tag, commit).
        """
        logger.info(f"Checking out {ref} in {repo_path}")
        code, out, err = await self._run_git(repo_path, ["checkout", ref])
        if code != 0:
             # Try creating branch if it's remote?
             # For now simple checkout.
             logger.error(f"Git checkout failed: {err}")
             raise Exception(f"Git checkout failed: {err}")
        
        # Pull to ensure we have latest of that branch if it is a branch
        # Not creating strict logic for detached HEAD vs branch yet.
        # code, out, err = await self._run_git(repo_path, ["pull"]) # Might fail if detached

git_service = GitService()
