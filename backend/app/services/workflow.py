import json
import uuid
from collections.abc import AsyncGenerator
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

    async def stream_workflow(
        self,
        workflow_id: str,
        input_data: dict,
        user_id: uuid.UUID,
        db: AsyncSession,
    ) -> AsyncGenerator[str, None]:
        """Async generator that yields SSE-formatted chunks."""

        def sse(data: dict) -> str:
            return f"data: {json.dumps(data)}\n\n"

        workflow = workflow_registry.get(workflow_id)
        if not workflow:
            yield sse({"error": f"Workflow '{workflow_id}' not found."})
            return

        try:
            workflow.validate_input(input_data)
        except AppException as e:
            yield sse({"error": str(e)})
            return

        # Create DB session
        session = WorkflowSession(
            user_id=user_id,
            workflow_id=uuid.UUID(workflow_id),
            status=SessionStatus.PENDING,
        )
        session_repo = SessionRepository(db)
        session = await session_repo.create(session)

        try:
            async for chunk in workflow.stream(input_data):
                yield sse(chunk)

            session.status = SessionStatus.SUCCESS
            await db.commit()
            logger.info("Streaming workflow successful", workflow_id=workflow_id)

        except Exception as e:
            session.status = SessionStatus.FAILED
            session.error_message = str(e)
            await db.commit()
            logger.exception("Streaming workflow failed", workflow_id=workflow_id)
            yield sse({"error": "Workflow execution failed."})


workflow_service = WorkflowService()