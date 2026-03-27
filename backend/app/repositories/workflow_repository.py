from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.workflow import Workflow
from app.core.logging import get_logger

logger = get_logger(__name__)


class WorkflowRepository:

    async def upsert(
        self,
        db: AsyncSession,
        *,
        workflow_id: str,
        workflow_name: str,
        description: str | None,
    ) -> Workflow:
        result = await db.execute(
            select(Workflow).where(Workflow.workflow_name == workflow_name)
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.description = description
            await db.flush()
            logger.info(f"Workflow upserted (existing): {workflow_name}")
            return existing
        else:
            workflow = Workflow(
                workflow_id=workflow_id,
                workflow_name=workflow_name,
                description=description,
                is_active=True,
            )
            db.add(workflow)
            await db.flush()
            logger.info(f"Workflow upserted (new): name={workflow_name} id={workflow_id}")
            return workflow

    async def get_by_id(
        self, db: AsyncSession, workflow_id: str
    ) -> Workflow | None:
        result = await db.execute(
            select(Workflow).where(Workflow.workflow_id == workflow_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(
        self, db: AsyncSession, workflow_name: str
    ) -> Workflow | None:
        result = await db.execute(
            select(Workflow).where(Workflow.workflow_name == workflow_name)
        )
        return result.scalar_one_or_none()

    async def list_active(self, db: AsyncSession) -> list[Workflow]:
        result = await db.execute(
            select(Workflow).where(Workflow.is_active == True)
        )
        return list(result.scalars().all())


workflow_repo = WorkflowRepository()