from typing import Optional
from app.workflows.base_workflow import BaseWorkflow
from app.core.logging import get_logger

logger = get_logger(__name__)


class WorkflowRegistry:
    def __init__(self):
        self._definitions: list[BaseWorkflow] = []
        self._workflows: dict[str, BaseWorkflow] = {}

    def register(self, workflow: BaseWorkflow) -> None:
        self._definitions.append(workflow)
        logger.info("Workflow registered", name=workflow.name)

    def assign_id(self, name: str, workflow_id: str) -> None:
        for workflow in self._definitions:
            if workflow.name == name:
                workflow.id = workflow_id
                self._workflows[workflow_id] = workflow
                logger.info("Workflow ready", name=name, workflow_id=workflow_id)
                return

    def get_definitions(self) -> list[BaseWorkflow]:
        return self._definitions

    def get(self, workflow_id: str) -> Optional[BaseWorkflow]:
        return self._workflows.get(workflow_id)

    def list_workflows(self) -> list[BaseWorkflow]:
        return list(self._workflows.values())


workflow_registry = WorkflowRegistry()
