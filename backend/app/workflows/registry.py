from app.workflows.base_workflow import BaseWorkflow
from app.workflows.agents.echo_agent import EchoAgent
from app.core.logging import get_logger
from typing import Optional

logger = get_logger(__name__)


class WorkflowRegistry:
    def __init__(self):
        self._definitions: list[BaseWorkflow] = [EchoAgent()]
        self._workflows: dict[str, BaseWorkflow] = {} 

    def assign_id(self, name: str, workflow_id: str) -> None:
        """Called during startup — assigns DB UUID to workflow object."""
        for workflow in self._definitions:
            if workflow.name == name:
                workflow.id = workflow_id
                self._workflows[workflow_id] = workflow
                logger.info(f"Workflow ready: {name} ({workflow_id})")
                return

    def get_definitions(self) -> list[BaseWorkflow]:
        """Used by startup to know which workflows need DB entries."""
        return self._definitions

    def get(self, id: str) -> Optional[BaseWorkflow]:
        return self._workflows.get(id)

    def list_workflows(self) -> list[BaseWorkflow]:
        return list(self._workflows.values())


workflow_registry = WorkflowRegistry()