from langgraph.graph import END, StateGraph

from app.workflows.agents.smart_resume_flow.nodes.calendar_check import (
    calendar_check_node,
)
from app.workflows.agents.smart_resume_flow.nodes.extractor import extract_resume_node
from app.workflows.agents.smart_resume_flow.nodes.interviewer_assign import (
    assign_interviewer_node,
)
from app.workflows.agents.smart_resume_flow.nodes.matcher import match_jd_node
from app.workflows.agents.smart_resume_flow.nodes.scheduler import scheduler_node
from app.workflows.agents.smart_resume_flow.state import ResumeState


def route_after_matching(state: ResumeState) -> str:
    if state["match_found"]:
        return "assign_interviewer"
    return "mark_for_review"


def mark_for_review_node(state: ResumeState) -> ResumeState:
    print("\n--- Marked for Human Review ---")
    reason = "No matching job description found."
    print(f"Reason    : {reason}")
    print(f"Candidate : {state.get('candidate_name', 'Unknown')}")
    return {**state, "marked_for_review": True, "review_reason": reason}


def build_graph():
    graph = StateGraph(ResumeState)

    graph.add_node("extractor", extract_resume_node)
    graph.add_node("matcher", match_jd_node)
    graph.add_node("assign_interviewer", assign_interviewer_node)
    graph.add_node("calendar_check", calendar_check_node)
    graph.add_node("scheduler", scheduler_node)
    graph.add_node("mark_for_review", mark_for_review_node)

    graph.set_entry_point("extractor")
    graph.add_edge("extractor", "matcher")
    graph.add_conditional_edges(
        "matcher",
        route_after_matching,
        {
            "assign_interviewer": "assign_interviewer",
            "mark_for_review": "mark_for_review",
        },
    )
    graph.add_edge("assign_interviewer", "calendar_check")
    graph.add_edge("calendar_check", "scheduler")
    graph.add_edge("scheduler", END)
    graph.add_edge("mark_for_review", END)

    return graph.compile()
