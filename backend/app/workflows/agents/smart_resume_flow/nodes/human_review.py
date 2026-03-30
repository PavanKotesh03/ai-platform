from app.workflows.agents.smart_resume_flow.state import ResumeState


def human_review_node(state: ResumeState) -> ResumeState:
    print("\n--- Node 5: Human Review ---")
    print("=" * 50)
    print("  INTERVIEW SCHEDULING REQUEST")
    print("=" * 50)
    print(f"  Candidate   : {state['candidate_name']}")
    print(f"  Email       : {state['candidate_email']}")
    print(f"  Domain      : {state['extracted_domain']}")
    print(f"  Skills      : {', '.join(state['extracted_skills'])}")
    print("-" * 50)
    print(f"  JD ID       : {state['matched_jd']['id']}")
    print(f"  Matched JD  : {state['matched_jd']['title']}")
   
    print("-" * 50)
    print(f"  Interviewer : {state['assigned_interviewer']['name']}")
    print(f"  Email       : {state['assigned_interviewer']['email']}")
    print("-" * 50)
    print(f"  Date        : {state['available_slot']['date']}")
    print(f"  Time        : {state['available_slot']['time']}")
    print("=" * 50)

    human_approved = state.get("human_approved", True)

    if human_approved:
        print("\n  ✅ Approved! Proceeding to schedule the interview.")
    else:
        print("\n  ❌ Rejected! Interview will not be scheduled.")

    return {**state, "human_approved": human_approved}
