from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from app.db.session import engine, AsyncSessionFactory
from app.db.models import Base, Workflow
from app.workflows.registry import workflow_registry
from app.core.logging import get_logger

logger = get_logger(__name__)


async def create_tables():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables ready")
    except SQLAlchemyError as e:
        logger.exception("Failed to create database tables")
        raise RuntimeError("Database initialization failed") from e


async def sync_workflows():
    try:
        async with AsyncSessionFactory() as session:
            for workflow in workflow_registry.get_definitions():
                result = await session.execute(
                    select(Workflow).where(Workflow.workflow_name == workflow.name)
                )
                db_workflow = result.scalar_one_or_none()

                if not db_workflow:
                    db_workflow = Workflow(
                        workflow_name=workflow.name,
                        description=workflow.description,
                    )
                    session.add(db_workflow)
                    logger.info("New workflow queued for sync", name=workflow.name)

            await session.commit()

            for workflow in workflow_registry.get_definitions():
                result = await session.execute(
                    select(Workflow).where(Workflow.workflow_name == workflow.name)
                )
                db_workflow = result.scalar_one_or_none()

                if not db_workflow:
                    raise RuntimeError(
                        f"Workflow '{workflow.name}' missing after commit — sync failed"
                    )

                workflow_registry.assign_id(workflow.name, str(db_workflow.workflow_id))

    except SQLAlchemyError as e:
        logger.exception("Failed to sync workflows with database")
        raise RuntimeError("Workflow sync failed") from e