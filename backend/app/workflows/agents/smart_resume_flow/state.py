from typing import TypedDict, Optional


class ResumeState(TypedDict):
    # --- Input ---
    resume_text: str  # Raw text extracted from the resume

    # --- Extraction Node Output ---
    candidate_name: Optional[str]  # Candidate's name
    candidate_email: Optional[str]  # Candidate's email
    extracted_skills: Optional[list]  # List of skills found in resume
    extracted_domain: Optional[str]  # Primary domain (e.g., Python, Java)

    # --- Matcher Node Output ---
    matched_jd: Optional[dict]  # The matched Job Description
    match_found: Optional[bool]  # True if a JD match was found

    # --- Interviewer Assignment Node Output ---
    assigned_interviewer: Optional[dict]  # Interviewer assigned for the domain

    # --- Calendar Check Node Output ---
    available_slot: Optional[dict]  # Available time slot from interviewer's calendar

    # --- Human Review Node Output ---
    human_approved: Optional[bool]  # True if human approves the scheduling

    # --- Scheduler Node Output ---
    scheduled: Optional[bool]  # True if interview was successfully scheduled
    schedule_details: Optional[dict]  # Final schedule details

    # --- Fallback ---
    marked_for_review: Optional[bool]  # True if no JD match found
    review_reason: Optional[str]  # Reason why it was marked for review
