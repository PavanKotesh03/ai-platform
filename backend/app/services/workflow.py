from app.workflows.registry import workflow_registry
from app.core.logging import get_logger
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.session_repository import session_repo
logger = get_logger(__name__)

class WorkflowService:

    def list_workflows(self):
        logger.info("Fetching workflow list")
        return workflow_registry.list_workflows()

    def get_workflow(self, workflow_id: str):
        workflow = workflow_registry.get(workflow_id)
        if not workflow:
            logger.error(f"Workflow not found: {workflow_id}")
            raise ValueError(f"Workflow '{workflow_id}' not found")
        return workflow

    async def execute_workflow(
        self,
        workflow_id: str,
        user_id: str,
        input_data: dict,
        db: AsyncSession,
    ) -> dict:
        from app.repositories.workflow_repository import workflow_repo
        
        db_workflow = await workflow_repo.get_by_id(db, workflow_id)
        if not db_workflow:
            raise ValueError(f"Workflow '{workflow_id}' not found")
            
        workflow_name = db_workflow.workflow_name
        
        # Call as requested, with fallback to list_workflows if the registry is actually keyed by UUID
        workflow = workflow_registry.get(workflow_name)
        if not workflow:
            # Fallback because registry is currently keyed by internal UUID initialized on startup
            workflow = next((w for w in workflow_registry.list_workflows() if w.name == workflow_name), None)
            
        if not workflow:
            raise ValueError(f"Workflow '{workflow_name}' not found in registry")

        run = await session_repo.create(
            db,
            user_id=user_id,
            workflow_id=workflow_id,
        )

        await session_repo.mark_running(db, run)

        try:
            result = await workflow.run(input_data)
            logger.info(f"Execution successful: workflow={workflow_id}")
        except Exception as e:
            await session_repo.mark_failed(db, run, error_message=str(e))
            logger.exception("Workflow execution failed")
            raise RuntimeError(f"Execution failed: {str(e)}")

        await session_repo.mark_success(db, run)

        return {
            "session_id":    run.session_id,
            "workflow_id":   workflow.id,
            "workflow_name": workflow.name,
            "status":        "success",
            "data":          result,
        }
    async def get_sessions_by_workflow(
        self,
        workflow_id: str,
        db: AsyncSession,
        limit: int = 20,
        offset: int = 0,
    ) -> list:
        return await session_repo.list_by_workflow(
            db, workflow_id=workflow_id, limit=limit, offset=offset
        )

    async def get_sessions_by_user(
        self,
        user_id: str,
        db: AsyncSession,
        limit: int = 20,
        offset: int = 0,
    ) -> list:
        return await session_repo.list_by_user(
            db, user_id=user_id, limit=limit, offset=offset
        )


workflow_service = WorkflowService()