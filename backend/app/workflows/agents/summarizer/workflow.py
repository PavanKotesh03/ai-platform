from langgraph.graph import StateGraph, END
from app.workflows.base_workflow import BaseWorkflow
from app.workflows.agents.summarizer.state import SummarizerState
from app.workflows.agents.summarizer.nodes import node_draft, node_refine
from app.core.exceptions import WorkflowInputException
from app.core.logging import get_logger

logger = get_logger(__name__)


class SummarizerWorkflow(BaseWorkflow):
    name = "summarizer"
    description = "Summarizes the text"

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

    async def stream(self, input_data: dict):
        """Async generator — yields status + token chunks for SSE."""
        from langchain_core.messages import SystemMessage, HumanMessage
        from app.workflows.agents.summarizer.prompts import (
            DRAFT_SYSTEM_PROMPT, DRAFT_USER_PROMPT,
            REFINE_SYSTEM_PROMPT, REFINE_USER_PROMPT,
        )
        from app.workflows.agents.shared.llm import groq_llm, gemini_llm

        input_text = input_data.get("input_text", "")

        # Step 1 — Groq draft (no streaming, fast enough)
        yield {"status": "Drafting initial summary..."}
        draft_messages = [
            SystemMessage(content=DRAFT_SYSTEM_PROMPT),
            HumanMessage(content=DRAFT_USER_PROMPT.format(input_text=input_text)),
        ]
        draft_response = await groq_llm.ainvoke(draft_messages)
        draft_summary = draft_response.content

        # Step 2 — Gemini refine with token streaming
        yield {"status": "Refining response..."}
        refine_messages = [
            SystemMessage(content=REFINE_SYSTEM_PROMPT),
            HumanMessage(content=REFINE_USER_PROMPT.format(
                input_text=input_text,
                draft_summary=draft_summary,
            )),
        ]

        final_summary = ""
        async for chunk in gemini_llm.astream(refine_messages):
            token = chunk.content
            if token:
                final_summary += token
                yield {"token": token}

        # Done — send full data for storage/reference
        yield {"done": True, "draft_summary": draft_summary, "final_summary": final_summary}