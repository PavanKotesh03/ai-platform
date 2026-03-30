from app.workflows.base_workflow import BaseWorkflow
from app.workflows.agents.smart_resume_flow.graph import build_graph
from app.workflows.agents.smart_resume_flow.utils.pdf_reader import read_pdf
from app.workflows.agents.smart_resume_flow.utils.mock_services import send_email_notification
from app.workflows.agents.smart_resume_flow.nodes.human_review import human_review_node
from datetime import datetime
import os
import json

class SmartResumeFlowAgent(BaseWorkflow):
    name = "smart_resume_flow"
    description = "An AI workflow agent that processes resumes, matches them with JDs, assigns interviewers, and schedules interviews."

    async def run(self, input_data: dict) -> dict:
        resume_text = input_data.get("resume_text", "")
        resume_path = input_data.get("resume_path")
        
        if resume_path and os.path.exists(resume_path):
            resume_text = read_pdf(resume_path)

        if not resume_text:
            return {"error": "No resume text or valid resume path provided."}

        # Build initial state
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
            "human_approved": input_data.get("human_approved", True), # default to True for automation
            "scheduled": None,
            "schedule_details": None,
            "marked_for_review": None,
            "review_reason": None,
        }

        # Build and invoke graph
        workflow = build_graph()
        final_state = workflow.invoke(initial_state)

        # Post-graph processing (Human review & email) as defined in main.py
        if final_state.get("match_found"):
            final_state = human_review_node(final_state)
            
        scheduled = False
        marked_for_review = final_state.get("marked_for_review")
        review_reason = final_state.get("review_reason")

        if final_state.get("match_found"):
            if final_state.get("human_approved"):
                scheduled = True
                marked_for_review = None
                review_reason = None
            else:
                scheduled = False
                marked_for_review = True
                review_reason = "HR rejected the schedule."

        final_state["scheduled"] = scheduled
        final_state["marked_for_review"] = marked_for_review
        final_state["review_reason"] = review_reason

        if scheduled and final_state.get("schedule_details"):
            try:
                send_email_notification(final_state["schedule_details"])
            except Exception as e:
                print(f"Mock email sending failed: {e}")

        # Summary logging
        print("\n" + "=" * 50)
        print("  📋 WORKFLOW FINAL SUMMARY")
        print("=" * 50)
        print(f"  Candidate       : {final_state.get('candidate_name')}")
        print(f"  Domain          : {final_state.get('extracted_domain')}")
        print(f"  Match Found     : {final_state.get('match_found')}")
        print(f"  Human Approved  : {final_state.get('human_approved')}")
        print(f"  Scheduled       : {scheduled}")
        print(f"  Marked Review   : {marked_for_review}")
        if review_reason:
            print(f"  Review Reason   : {review_reason}")
        print("=" * 50)

        # Return the final state dictionary as standard for BaseWorkflow output
        return final_state
