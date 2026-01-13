import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.git import git_service
from app.models.job import Job
from app.models.run import Run, RunStatus
from app.models.project import Project
from app.models.git_repo import GitRepo
from app.core.db import AsyncSessionLocal

logger = logging.getLogger(__name__)

class ExecutionEngine:
    """
    Orchestrates Job Execution.
    v1: Local Execution (subprocess) or Docker (if configured).
    """

    async def execute_run(self, run_id: int):
        """
        Main entry point for background task execution.
        """
        logger.info(f"Starting execution for Run ID {run_id}")
        
        async with AsyncSessionLocal() as session:
            # 1. Fetch Run & Job & Project
            result = await session.execute(
                select(Run).where(Run.id == run_id)
            )
            run = result.scalars().first()
            if not run:
                logger.error(f"Run {run_id} not found.")
                return

            run.status = RunStatus.running
            run.started_at = datetime.now(timezone.utc)
            await session.commit()
            
            # Re-fetch relationships manually or assume access via basic attributes?
            # Relationships might need Loading.
            # Let's get Job and Project.
            res_job = await session.execute(select(Job).where(Job.id == run.job_id))
            job = res_job.scalars().first()
            
            res_proj = await session.execute(select(Project).where(Project.id == job.project_id))
            project = res_proj.scalars().first()

            # 2. Determine Logic
            # Use 'command' field. If empty, fallback to description or default.
            command = job.command if job.command else (job.description if job.description else "echo 'No command specified'")
            
            log_buffer = []
            exit_code = 0
            
            try:
                # 3. Mock Execution Logic (For Demos)
                if command.startswith("mock:"):
                    mock_type = command.split(":")[1].strip().lower()
                    log_buffer.append(f"Starting Mock Execution: {mock_type}")
                    
                    if mock_type == "ansible":
                        log_buffer.append(f"PLAY [all] *********************************************************************")
                        await asyncio.sleep(1)
                        log_buffer.append(f"TASK [Gathering Facts] *********************************************************")
                        log_buffer.append(f"ok: [localhost]")
                        await asyncio.sleep(1)
                        log_buffer.append(f"TASK [Ensure Nginx is installed] ***********************************************")
                        log_buffer.append(f"changed: [localhost]")
                        await asyncio.sleep(1)
                        log_buffer.append(f"TASK [Deploy Configuration] ****************************************************")
                        log_buffer.append(f"ok: [localhost]")
                        await asyncio.sleep(1)
                        log_buffer.append(f"PLAY RECAP *********************************************************************")
                        log_buffer.append(f"localhost                  : ok=3    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0")
                        exit_code = 0
                        
                    elif mock_type == "terraform":
                         log_buffer.append("Terraform will perform the following actions:")
                         await asyncio.sleep(1)
                         log_buffer.append("  + resource \"aws_instance\" \"web\" {")
                         log_buffer.append("      + ami                          = \"ami-0c55b159cbfafe1f0\"")
                         log_buffer.append("      + instance_type                = \"t2.micro\"")
                         log_buffer.append("      + id                           = (known after apply)")
                         log_buffer.append("    }")
                         await asyncio.sleep(2)
                         log_buffer.append("Plan: 1 to add, 0 to change, 0 to destroy.")
                         exit_code = 0
                    else:
                        log_buffer.append(f"Unknown mock type: {mock_type}")
                        exit_code = 1
                        
                    run.status = RunStatus.success if exit_code == 0 else RunStatus.failed

                else:
                    # 4. Git Operations (Real Execution)
                    # Check if project has a default repo? 
                    # We need a way to link Job to Repo. 
                    # Current Model: Project has repos. Job has linked_commits... 
                    # Let's fetch the FIRST repo of the project for MVP.
                    res_repos = await session.execute(select(GitRepo).where(GitRepo.project_id == project.id))
                    repo = res_repos.scalars().first()
                    
                    work_dir = "/tmp/uhub/execution" # Default
                    
                    if repo:
                        log_buffer.append(f"Using Repo: {repo.name} ({repo.url})")
                        repo_path = await git_service.clone_or_pull(repo.url, f"proj_{project.id}_repo_{repo.id}")
                        # Checkout default branch?
                        await git_service.checkout(repo_path, repo.default_branch)
                        work_dir = str(repo_path)
                        log_buffer.append(f"Workdir set to: {work_dir}")
                    else:
                        log_buffer.append("No Git Repo found for project. Running in ephemeral dir.")
                    
                    # Override working dir if specified in Job
                    if job.working_dir:
                        import os
                        custom_wd = os.path.join(work_dir, job.working_dir)
                        log_buffer.append(f"Changing directory to: {custom_wd}")
                        work_dir = custom_wd

                    # Execution (Local Shell for v1)
                    log_buffer.append(f"Executing: {command}")
                    
                    process = await asyncio.create_subprocess_shell(
                        command,
                        cwd=work_dir,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE
                    )
                    stdout, stderr = await process.communicate()
                    
                    exit_code = process.returncode
                    log_buffer.append("--- STDOUT ---")
                    log_buffer.append(stdout.decode())
                    if stderr:
                        log_buffer.append("--- STDERR ---")
                        log_buffer.append(stderr.decode())
                    
                    if exit_code == 0:
                        run.status = RunStatus.success
                    else:
                        run.status = RunStatus.failed
                
            except Exception as e:
                logger.exception("Execution failed")
                log_buffer.append(f"\nSYSTEM ERROR: {str(e)}")
                run.status = RunStatus.failed
                exit_code = -1

            # 5. Save Results
            run.finished_at = datetime.now(timezone.utc)
            run.exit_code = exit_code
            run.log_content = "\n".join(log_buffer)
            
            session.add(run)
            await session.commit()
            logger.info(f"Run {run_id} completed with status {run.status}")

runner_service = ExecutionEngine()
