from langchain_core.messages import SystemMessage, HumanMessage
from app.workflows.agents.summarizer.state import SummarizerState
from app.workflows.agents.summarizer.prompts import (
    DRAFT_SYSTEM_PROMPT,
    DRAFT_USER_PROMPT,
    REFINE_SYSTEM_PROMPT,
    REFINE_USER_PROMPT,
)
from app.workflows.agents.shared.llm import groq_llm, gemini_llm
from app.core.logging import get_logger

logger = get_logger(__name__)


async def node_draft(state: SummarizerState) -> dict:
    """Calls Groq to produce a first-pass draft summary from input_text."""
    try:
        messages = [
            SystemMessage(content=DRAFT_SYSTEM_PROMPT),
            HumanMessage(content=DRAFT_USER_PROMPT.format(input_text=state["input_text"])),
        ]
        response = await groq_llm.ainvoke(messages)
        logger.info("Draft summary generated")
        return {"draft_summary": response.content}
    except Exception as e:
        logger.exception("Draft summary generation failed")
        return {"draft_summary": "", "error": str(e)}


async def node_refine(state: SummarizerState) -> dict:
    """Calls Gemini to refine and polish the Groq draft."""
    if state.get("error"):
        return {"final_summary": state["draft_summary"]}
    try:
        messages = [
            SystemMessage(content=REFINE_SYSTEM_PROMPT),
            HumanMessage(
                content=REFINE_USER_PROMPT.format(
                    input_text=state["input_text"],
                    draft_summary=state["draft_summary"],
                )
            ),
        ]
        response = await gemini_llm.ainvoke(messages)
        logger.info("Summary refined successfully")
        return {"final_summary": response.content}
    except Exception as e:
        logger.exception("Summary refinement failed")
        return {"final_summary": state["draft_summary"], "error": str(e)}