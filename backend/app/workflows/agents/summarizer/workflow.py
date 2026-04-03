from langgraph.graph import StateGraph, END
from app.workflows.base_workflow import BaseWorkflow
from app.workflows.agents.summarizer.state import SummarizerState
from app.workflows.agents.summarizer.nodes import node_draft, node_refine
from app.core.exceptions import WorkflowInputException
from app.core.logging import get_logger

logger = get_logger(__name__)


class SummarizerWorkflow(BaseWorkflow):
    name = "summarizer"
    description ="Summarizes the text"

    def __init__(self):
        self._graph = self._build_graph()

    def validate_input(self, input_data: dict) -> None:
        if not input_data.get("input_text", "").strip():
            raise WorkflowInputException(
                "'input_text' is required and cannot be empty. "
                "Send: {\"input\": {\"input_text\": \"your text here\"}}"
            )

    def _build_graph(self):
        graph = StateGraph(SummarizerState)
        graph.add_node("draft", node_draft)
        graph.add_node("refine", node_refine)
        graph.set_entry_point("draft")
        graph.add_edge("draft", "refine")
        graph.add_edge("refine", END)
        return graph.compile()

    async def run(self, input_data: dict) -> dict:
        initial_state: SummarizerState = {
            "input_text": input_data.get("input_text", ""),
            "error": None,
            "draft_summary": "",
            "final_summary": "",
        }
        result = await self._graph.ainvoke(initial_state)

        if result.get("error"):
            raise RuntimeError(result["error"])

        return {
            "draft_summary": result["draft_summary"],
            "final_summary": result["final_summary"],
        }
