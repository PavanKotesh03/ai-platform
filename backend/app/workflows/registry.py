from app.workflows.base_workflow import BaseWorkflow
from app.workflows.agents.echo_agent import EchoAgent
from app.core.logging import get_logger
logger = get_logger(__name__)


class WorkflowRegistry:
    def __init__(self):
        self._workflows: dict[str, BaseWorkflow] = {} 
        self._register_all()

    def _register_all(self):
        workflows = [
            EchoAgent(),
        ]
        for workflow in workflows:
            self._workflows[workflow.id] = workflow  # stored by UUID
            logger.info(f"Workflow registered: name={workflow.name} id={workflow.id}")

    def get(self, id: str) -> BaseWorkflow | None:
        return self._workflows.get(id)

    def list_workflows(self) -> list[BaseWorkflow]:
        return list(self._workflows.values())  # return objects, not just keys

workflow_registry = WorkflowRegistry()