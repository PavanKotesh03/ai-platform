from app.workflows.registry import workflow_registry
from app.workflows.agents.smart_resume_flow.workflow import SmartResumeWorkflow
from app.workflows.agents.summarizer.workflow import SummarizerWorkflow


def register_workflows() -> None:
    """
    Register all workflow agents with the registry.
    Called once during application startup before DB sync.
    To add a new agent: import it here and call workflow_registry.register().
    """
    workflow_registry.register(SmartResumeWorkflow())
    workflow_registry.register(SummarizerWorkflow())
