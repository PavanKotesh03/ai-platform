from app.workflows.agents.smart_resume_flow.state import ResumeState
from app.workflows.agents.smart_resume_flow.utils.mock_services import (
    get_available_slot,
)


def calendar_check_node(state: ResumeState) -> ResumeState:
    print("\n--- Node 4: Checking Calendar Availability ---")

    assigned_interviewer = state["assigned_interviewer"]
    if not assigned_interviewer:
        print("No interviewer assigned. Skipping calendar check.")
        return {**state, "available_slot": None}

    interviewer_id = assigned_interviewer["id"]
    name = assigned_interviewer["name"]

    available_slot = get_available_slot(interviewer_id)

    if available_slot:
        print(f"Interviewer  : {name}")
        print(f"Available On : {available_slot['date']}")
        print(f"Time Slot    : {available_slot['time']}")
    else:
        print(f"No available slots found for {name}")

    return {**state, "available_slot": available_slot}
