import json
from asyncio import to_thread
from datetime import datetime
from pathlib import Path

from app.core.exceptions import WorkflowInputException
from app.workflows.agents.smart_resume_flow.graph import build_graph
from app.workflows.agents.smart_resume_flow.nodes.human_review import human_review_node
from app.workflows.agents.smart_resume_flow.utils.mock_services import send_email_notification
from app.workflows.agents.smart_resume_flow.utils.pdf_reader import read_pdf
from app.workflows.base_workflow import BaseWorkflow


class SmartResumeWorkflow(BaseWorkflow):
    name = "smart_resume_flow"
    description = "Analyzes resume input and schedules interview"

    def __init__(self):
        self._graph = build_graph()
        self._processed_resumes_path = (
            Path(__file__).resolve().parent / "mock_data" / "processed_resumes.json"
        )

    def validate_input(self, input_data: dict) -> None:
        has_resume_path = bool(str(input_data.get("resume_path", "")).strip())
        if not has_resume_path:
            raise WorkflowInputException(
                "'resume_path' is required for smart_resume_flow. Upload a PDF resume."
            )

    def _load_processed_resumes(self) -> list[dict]:
        if not self._processed_resumes_path.exists():
            return []
        with open(self._processed_resumes_path, "r", encoding="utf-8") as file:
            return json.load(file)

    def _save_processed_resume(self, entry: dict) -> None:
        resumes = self._load_processed_resumes()
        resumes.append(entry)
        with open(self._processed_resumes_path, "w", encoding="utf-8") as file:
            json.dump(resumes, file, indent=4)

    async def run(self, input_data: dict) -> dict:
        resume_path = str(input_data.get("resume_path", "")).strip()
        resume_text = await to_thread(read_pdf, resume_path)

        initial_state = {
            "resume_text": resume_text,
            "candidate_name": None,
            "candidate_email": None,
            "extracted_skills": None,
            "extracted_domain": None,
            "matched_jd": None,
            "match_found": None,
            "assigned_interviewer": None,
            "available_slot": None,
            "human_approved": input_data.get("human_approved"),
            "scheduled": None,
            "schedule_details": None,
            "marked_for_review": None,
            "review_reason": None,
        }

        final_state = await to_thread(self._graph.invoke, initial_state)

        if final_state.get("match_found"):
            final_state = human_review_node(
                final_state,
                human_approved=input_data.get("human_approved"),
            )

        scheduled = False
        marked_for_review = final_state.get("marked_for_review")
        review_reason = final_state.get("review_reason")

        if final_state.get("match_found"):
            if final_state.get("human_approved") is True:
                scheduled = True
                marked_for_review = None
                review_reason = None
            elif final_state.get("human_approved") is False:
                scheduled = False
                marked_for_review = True
                review_reason = "Human reviewer rejected the schedule."
            else:
                scheduled = False
                marked_for_review = True
                review_reason = "Human review decision is pending."

        final_state["scheduled"] = scheduled
        final_state["marked_for_review"] = marked_for_review
        final_state["review_reason"] = review_reason

        if scheduled and final_state.get("schedule_details"):
            await to_thread(send_email_notification, final_state["schedule_details"])

        entry = {
            "id": datetime.now().strftime("%Y%m%d%H%M%S"),
            "processed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "candidate_name": final_state.get("candidate_name"),
            "candidate_email": final_state.get("candidate_email"),
            "domain": final_state.get("extracted_domain"),
            "skills": final_state.get("extracted_skills"),
            "match_found": final_state.get("match_found"),
            "matched_jd": (
                final_state.get("matched_jd", {}).get("title")
                if final_state.get("matched_jd")
                else None
            ),
            "interviewer": (
                final_state.get("assigned_interviewer", {}).get("name")
                if final_state.get("assigned_interviewer")
                else None
            ),
            "scheduled": scheduled,
            "marked_for_review": marked_for_review,
            "review_reason": review_reason,
            "schedule_details": final_state.get("schedule_details"),
        }
        await to_thread(self._save_processed_resume, entry)

        return final_state
