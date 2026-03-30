from app.workflows.agents.shared.base_state import BaseState


class SummarizerState(BaseState):
    draft_summary: str
    final_summary: str
