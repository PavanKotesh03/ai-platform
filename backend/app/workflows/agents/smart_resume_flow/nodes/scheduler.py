from app.workflows.agents.smart_resume_flow.state import ResumeState


def scheduler_node(state: ResumeState) -> ResumeState:
    print("\n--- Node 6: Preparing Schedule Details ---")

    if not state["assigned_interviewer"] or not state["matched_jd"] or not state["available_slot"]:
        return {**state, "scheduled": False, "schedule_details": None}

    schedule_details = {
        "candidate_name": state["candidate_name"],
        "candidate_email": state["candidate_email"],
        "interviewer_name": state["assigned_interviewer"]["name"],
        "interviewer_email": state["assigned_interviewer"]["email"],
        "job_title": state["matched_jd"]["title"],
        "job_id": state["matched_jd"]["id"],
        "date": state["available_slot"]["date"],
        "time": state["available_slot"]["time"],
        "status": "PENDING_APPROVAL",
    }

    print(f"  Schedule prepared for : {state['candidate_name']}")
    print("  Status                : PENDING_APPROVAL")

    return {**state, "scheduled": False, "schedule_details": schedule_details}
