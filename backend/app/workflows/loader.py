from app.workflows.registry import workflow_registry
from app.workflows.agents.echo_agent import EchoAgent
from app.workflows.agents.smart_resume_flow.agent import SmartResumeFlowAgent
from app.workflows.agents.echo.workflow import EchoWorkflow
from app.workflows.agents.summarizer.workflow import SummarizerWorkflow


def register_workflows() -> None:
    """
    Register all workflow agents with the registry.
    Called once during application startup before DB sync.
    To add a new agent: import it here and call workflow_registry.register().
    """
    workflow_registry.register(EchoAgent())
    workflow_registry.register(SmartResumeFlowAgent())
    workflow_registry.register(EchoWorkflow())
    workflow_registry.register(SummarizerWorkflow())