from enum import Enum
from typing import Optional
from app.models.user import User, UserRole
from app.models.project import Project, EnvironmentType
from app.models.job import Job, JobType
from fastapi import HTTPException, status

class Action(str, Enum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    MANAGE_ENV = "manage_env"

class PermissionService:
    """
    Centralized RBAC logic based on docs/03-rbac-and-workflows.md
    """

    @staticmethod
    def _is_admin(user: User) -> bool:
        return user.role == UserRole.admin

    @staticmethod
    def _is_project_owner(user: User, project: Project) -> bool:
        return user.id == project.owner_id

    # --- Project Permissions ---
    @classmethod
    def check_project_access(cls, user: User, project: Optional[Project], action: Action):
        """
        Check if user can perform action on a project.
        """
        if cls._is_admin(user):
            return True

        if action == Action.READ:
            # v1: All auth users can view all projects
            return True

        if action == Action.CREATE:
            # Strict v1: Only Admin can create projects
            # OR role=projets (if policy allows, let's stick to strict Admin for now based on Plan)
            # Actually doc says: "Projets: Créer de nouveaux projets (dans les limites définies par Admin)."
            # Let's allow 'projets' role to create.
            if user.role == UserRole.projet:
                return True
            raise HTTPException(status_code=403, detail="Only Admin or Projet role can create projects.")

        if project is None:
             raise HTTPException(status_code=404, detail="Project not found")

        is_owner = cls._is_project_owner(user, project)

        if action in [Action.UPDATE, Action.DELETE, Action.MANAGE_ENV]:
            # Admin or Owner
            if is_owner:
                return True
            raise HTTPException(status_code=403, detail="Not enough permissions (Admin or Owner required)")
        
        return False

    # --- Job Permissions ---
    @classmethod
    def check_job_create(cls, user: User, job_type: JobType, env_type: Optional[EnvironmentType]):
        """
        Enforce rules for Job creation based on Role, JobType and Environment.
        """
        if cls._is_admin(user):
            return True

        # Role: PROJET
        if user.role == UserRole.projet:
            # "Projets: Créer... meeting, dev, ops... mais sans exécuter."
            # They manage planning. Allowed types: meeting, ops (planning), dev (tasks)
            # Generally allowed.
            return True

        # Role: DEV
        if user.role == UserRole.dev:
            # "Dev: Créer des jobs de type dev... Pas de jobs start en prod."
            if job_type != JobType.dev:
                raise HTTPException(status_code=403, detail="Devs can only create 'dev' type jobs.")
            
            if env_type == EnvironmentType.prod:
                 raise HTTPException(status_code=403, detail="Devs cannot target Production explicitly for new jobs.")
            return True

        # Role: OPS
        if user.role == UserRole.ops:
            # "Ops: Créer types ops/maintenance/infra."
            # Can touch prod.
            if job_type in [JobType.ops, JobType.maintenance, JobType.infra, JobType.meeting]:
                return True
            # Can they create dev jobs? Maybe not primarily.
            # Let's restrict to their domain for now + meetings.
            if job_type == JobType.dev:
                 raise HTTPException(status_code=403, detail="Ops should create ops/maintenance/infra jobs.")
            return True

        raise HTTPException(status_code=403, detail="Role not authorized to create jobs.")

permission_service = PermissionService()
