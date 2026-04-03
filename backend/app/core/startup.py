from sqlalchemy import delete, select
from sqlalchemy.exc import SQLAlchemyError
from app.db.session import engine, AsyncSessionFactory
from app.db.models import Base, Workflow, WorkflowSession   # ← correct name
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
            registry_workflows = workflow_registry.get_definitions()
            registry_names = {workflow.name for workflow in registry_workflows}

            # Step 1: Find obsolete workflow IDs
            result = await session.execute(
                select(Workflow.workflow_id, Workflow.workflow_name).where(
                    Workflow.workflow_name.not_in(registry_names)
                )
            )
            obsolete = result.fetchall()

            if obsolete:
                obsolete_ids = [row.workflow_id for row in obsolete]
                obsolete_names = [row.workflow_name for row in obsolete]

                logger.info(
                    "Removing obsolete workflows and their sessions",
                    workflows=obsolete_names,
                )

                # Step 2: Delete child sessions first
                await session.execute(
                    delete(WorkflowSession).where(
                        WorkflowSession.workflow_id.in_(obsolete_ids)
                    )
                )

                # Step 3: Now safe to delete parent workflows
                await session.execute(
                    delete(Workflow).where(
                        Workflow.workflow_id.in_(obsolete_ids)
                    )
                )

            # Step 4: Upsert currently registered workflows
            for workflow in registry_workflows:
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

            # Step 5: Assign DB IDs back to registry
            for workflow in registry_workflows:
                result = await session.execute(
                    select(Workflow).where(Workflow.workflow_name == workflow.name)
                )
                db_workflow = result.scalar_one_or_none()

                if not db_workflow:
                    raise RuntimeError(
                        f"Workflow '{workflow.name}' missing after commit — sync failed"
                    )

                workflow_registry.assign_id(workflow.name, str(db_workflow.workflow_id))

            logger.info("Workflow sync complete", registered=list(registry_names))

    except SQLAlchemyError as e:
        logger.exception("Failed to sync workflows with database")
        raise RuntimeError("Workflow sync failed") from e