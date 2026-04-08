import json

from langchain_groq import ChatGroq

from app.core.config import settings
from app.workflows.agents.smart_resume_flow.state import ResumeState


llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=settings.GROQ_API_KEY)


def extract_resume_node(state: ResumeState) -> ResumeState:
    print("\n--- Node 1: Extracting Resume Content ---")

    resume_text = state["resume_text"]

    prompt = f"""
You are a Senior Technical Recruiter. Your task is to categorize the candidate into exactly ONE of the following primary domains: [Python, Java, Frontend, DevOps, ML]. Analyze the resume below and extract the following information.

### Classification Logic (Strictly prioritized by Experience > Projects > Skills):
1. **Frontend**: The candidate’s primary output is web/mobile interfaces or Full-Stack applications where the UI is a central component (e.g., MERN, React, UI/UX, Web platforms).
2. **ML**: The candidate’s primary focus is data-driven modeling, AI, statistics, or neural networks.
3. **DevOps**: The candidate focuses on infrastructure, CI/CD pipelines, cloud automation, or system reliability.
4. **Python**: The candidate is a generalist/backend developer whose core identity is problem-solving, automation, or backend logic specifically using Python, without a heavy UI focus.
5. **Java**: The candidate focuses on enterprise-level backend services or Android ecosystems where Java is the foundational tool.

### Instructions:
- Evaluate the "Core Identity" of the candidate based on where they have applied the most effort in their Internships and Projects.
- If a candidate has a mix of skills, choose the domain that represents their most recent or most complex project work.

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
