import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.workflows.registry import workflow_registry
from app.repositories.session import SessionRepository
from app.db.models import Session
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
        db: AsyncSession
    ) -> dict:
        workflow = workflow_registry.get(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow '{workflow_id}' not found")

        session = Session(
            user_id=user_id,
            workflow_id=uuid.UUID(workflow_id),
            status="pending"
        )
        session_repo = SessionRepository(db)
        session = await session_repo.create(session)

        try:
            result = await workflow.run(input_data)
            session.status = "success"
            await db.commit()
            logger.info(f"Execution successful: {workflow_id}")
        except Exception as e:
            session.status = "failed"
            session.error_message = str(e)
            await db.commit()
            logger.exception("Workflow execution failed")
            raise RuntimeError(f"Execution failed: {str(e)}")

        return {
            "workflow_id": workflow_id,
            "workflow_name": workflow.name,
            "status": "success",
            "data": result
        }


workflow_service = WorkflowService()