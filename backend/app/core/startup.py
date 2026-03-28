from sqlalchemy import select
from app.db.session import engine, AsyncSessionFactory
from app.db.models import Base, Workflow
from app.workflows.registry import workflow_registry
from app.core.logging import get_logger

logger = get_logger(__name__)


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ready")


async def sync_workflows():
    async with AsyncSessionFactory() as session:
        for workflow in workflow_registry.get_definitions():
            result = await session.execute(
                select(Workflow).where(Workflow.workflow_name == workflow.name)
            )
            db_workflow = result.scalar_one_or_none()

            if not db_workflow:
                db_workflow = Workflow(
                    workflow_name=workflow.name,
                    description=workflow.description
                )
                session.add(db_workflow)
                logger.info(f"New workflow queued: {workflow.name}")

        await session.commit()

        for workflow in workflow_registry.get_definitions():
            result = await session.execute(
                select(Workflow).where(Workflow.workflow_name == workflow.name)
            )
            db_workflow = result.scalar_one_or_none()
            workflow_registry.assign_id(workflow.name, str(db_workflow.workflow_id))
            logger.info(f"Workflow ready: {workflow.name} → {db_workflow.workflow_id}")