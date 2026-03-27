from app.workflows.registry import workflow_registry
from app.core.logging import get_logger
logger = get_logger(__name__)

class WorkflowService:

    def list_workflows(self):
        logger.info("Fetching workflow list")
        return workflow_registry.list_workflows()

    def get_workflow(self, id: str):
        logger.info(f"Fetching workflow: {id}")
        workflow = workflow_registry.get(id)
        if not workflow:
            logger.error(f"Workflow not found: {id}")
            raise ValueError(f"Workflow '{id}' not found")
        return workflow

    async def execute_workflow(self, workflow_id: str, input_data: dict) -> dict:
        logger.info(f"Executing workflow: {workflow_id}")
        workflow = workflow_registry.get(workflow_id)
        if not workflow:
            logger.error(f"Workflow not found: {workflow_id}")
            raise ValueError(f"Workflow '{workflow_id}' not found")
        try:
            result = await workflow.run(input_data)
            logger.info(f"Execution successful: {workflow_id}")
        except Exception as e:
            logger.exception("Workflow execution failed")
            raise RuntimeError(f"Execution failed: {str(e)}")
        return {
            "workflow_id": workflow.id,
            "workflow_name": workflow.name,
            "status": "success",
            "data": result
        }

workflow_service = WorkflowService()