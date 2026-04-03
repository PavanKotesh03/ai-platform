import json

from langchain_groq import ChatGroq

from app.core.config import settings
from app.workflows.agents.smart_resume_flow.state import ResumeState
from app.workflows.agents.smart_resume_flow.utils.mock_services import get_interviewers


INTERVIEWERS = get_interviewers()
llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=settings.GROQ_API_KEY)


def assign_interviewer_node(state: ResumeState) -> ResumeState:
    print("\n--- Node 3: Assigning Interviewer ---")

    matched_jd = state["matched_jd"]
    if not matched_jd:
        print("No matched JD found. Skipping interviewer assignment.")
        return {**state, "assigned_interviewer": None}

    jd_domain = matched_jd["domain"]
    jd_title = matched_jd["title"]

    prompt = f"""
You are an expert HR coordinator.

A candidate has been matched to the following Job Description:
- Title  : {jd_title}
- Domain : {jd_domain}

Below is the list of available interviewers with their domains:
{json.dumps(INTERVIEWERS, indent=2)}

Your task:
1. Find the BEST matching interviewer whose domain is most relevant to the JD domain.
2. The domain names may not match exactly - use your intelligence to find the closest match.
   For example: "ML/NLP" matches "Machine Learning - NLP (Transformers & LLMs)"
3. Return ONLY one interviewer - the best match.
4. If absolutely no relevant interviewer is found, return null.

Return ONLY a valid JSON object with these exact keys:
- "assigned_interviewer": the full interviewer object from the list, or null if none found

Return ONLY the JSON. No explanation. No extra text.
"""

    response = llm.invoke(prompt)
    raw = response.content.strip()

    if raw.startswith("```"):
        raw = raw.strip("```").strip()
        if raw.startswith("json"):
            raw = raw[4:].strip()

    result = json.loads(raw)
    assigned = result.get("assigned_interviewer")

    if assigned:
        print(f"Interviewer Assigned : {assigned['name']}")
        print(f"Interviewer Domain   : {assigned['domain']}")
        print(f"Interviewer Email    : {assigned['email']}")
    else:
        print("No suitable interviewer found.")

    return {**state, "assigned_interviewer": assigned}
