import json

from langchain_groq import ChatGroq

from app.core.config import settings
from app.workflows.agents.smart_resume_flow.state import ResumeState


llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=settings.GROQ_API_KEY)


def extract_resume_node(state: ResumeState) -> ResumeState:
    print("\n--- Node 1: Extracting Resume Content ---")

    resume_text = state["resume_text"]

    prompt = f"""
You are an expert HR assistant. Analyze the resume below and extract the following information.

Return ONLY a valid JSON object with these exact keys:
- "candidate_name": full name of the candidate
- "candidate_email": email address of the candidate
- "extracted_skills": a list of technical skills found (e.g. ["Python", "Django", "SQL"])
- "extracted_domain": the single primary technical domain (choose ONLY one from: Python, Java, Frontend, DevOps, ML)

Resume:
{resume_text}

Return ONLY the JSON. No explanation. No extra text.
"""

    response = llm.invoke(prompt)
    raw = response.content.strip()

    if raw.startswith("```"):
        raw = raw.strip("```").strip()
        if raw.startswith("json"):
            raw = raw[4:].strip()

    extracted = json.loads(raw)

    print(f"Candidate  : {extracted.get('candidate_name')}")
    print(f"Email      : {extracted.get('candidate_email')}")
    print(f"Domain     : {extracted.get('extracted_domain')}")
    print(f"Skills     : {extracted.get('extracted_skills')}")

    return {
        **state,
        "candidate_name": extracted.get("candidate_name"),
        "candidate_email": extracted.get("candidate_email"),
        "extracted_skills": extracted.get("extracted_skills"),
        "extracted_domain": extracted.get("extracted_domain"),
    }
