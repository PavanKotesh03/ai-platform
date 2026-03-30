import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.workflows.registry import workflow_registry
from app.repositories.session import SessionRepository
from app.db.models import WorkflowSession, SessionStatus
from app.core.exceptions import WorkflowNotFoundException, AppException
from app.core.logging import get_logger

logger = get_logger(__name__)


class WorkflowService:
    def list_workflows(self):
        return workflow_registry.list_workflows()

    async def execute_workflow(
        self,
        workflow_id: str,
        input_data: dict,
        user_id: uuid.UUID,
        db: AsyncSession,
    ) -> dict:
        workflow = workflow_registry.get(workflow_id)
        if not workflow:
            raise WorkflowNotFoundException(workflow_id)

        # Validate before creating a DB session — bad input never touches the DB
        workflow.validate_input(input_data)

        session = WorkflowSession(
            user_id=user_id,
            workflow_id=uuid.UUID(workflow_id),
            status=SessionStatus.PENDING,
        )
        session_repo = SessionRepository(db)
        session = await session_repo.create(session)

        try:
            result = await workflow.run(input_data)
            session.status = SessionStatus.SUCCESS
            await db.commit()
            logger.info("Workflow execution successful", workflow_id=workflow_id)
        except AppException:
            # AppException raised inside run() — propagate directly, no DB session update needed
            raise
        except Exception as e:
            session.status = SessionStatus.FAILED
            session.error_message = str(e)
            await db.commit()
            logger.exception("Workflow execution failed", workflow_id=workflow_id)
            raise RuntimeError(f"Execution failed: {str(e)}")

        return {
            "workflow_id": workflow_id,
            "workflow_name": workflow.name,
            "status": SessionStatus.SUCCESS,
            "data": result,
        }


workflow_service = WorkflowService()