from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.workflow_repository import workflow_repo
from app.workflows.registry import workflow_registry
from app.core.logging import get_logger

logger = get_logger(__name__)


async def seed_workflows(db: AsyncSession) -> None:
    for wf in workflow_registry.list_workflows():
        persisted = await workflow_repo.upsert(
            db,
            workflow_id=wf.id,
            workflow_name=wf.name,
            description=wf.description,
        )

        if persisted.workflow_id != wf.id:
            logger.info(
                f"UUID sync for '{wf.name}': {wf.id} → {persisted.workflow_id}"
            )
            wf.id = persisted.workflow_id

    await db.commit()
    logger.info("Workflow seeding complete.")

