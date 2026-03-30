from langchain_groq import ChatGroq
from dotenv import load_dotenv
from app.workflows.agents.smart_resume_flow.state import ResumeState
from app.workflows.agents.smart_resume_flow.utils.mock_services import get_job_descriptions

JOB_DESCRIPTIONS = get_job_descriptions()
import json

load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile")


def match_jd_node(state: ResumeState) -> ResumeState:
    print("\n--- Node 2: Matching Against Job Descriptions ---")

    extracted_skills = state["extracted_skills"]
    extracted_domain = state["extracted_domain"]

    prompt = f"""
You are an expert HR recruitment assistant.

A candidate has the following profile:
- Domain : {extracted_domain}
- Skills : {extracted_skills}

Below are the active Job Descriptions:
{json.dumps(JOB_DESCRIPTIONS, indent=2)}

Your task:
1. Find the BEST matching job description based on domain and skills overlap.
2. A match is valid if the candidate's domain matches the JD domain AND at least 2 skills overlap.
3. If a valid match is found, return the matched JD.
4. If no valid match is found, return null for matched_jd.

Return ONLY a valid JSON object with these exact keys:
- "match_found": true or false
- "matched_jd": the full matched JD object, or null if no match

Return ONLY the JSON. No explanation. No extra text.
"""

    response = llm.invoke(prompt)
    raw = response.content.strip()

    # Clean markdown if present
    if raw.startswith("```"):
        raw = raw.strip("```").strip()
        if raw.startswith("json"):
            raw = raw[4:].strip()

    result = json.loads(raw)

    match_found = result.get("match_found", False)
    matched_jd = result.get("matched_jd", None)

    if match_found:
        print(f"Match Found : YES")
        print(f"Matched JD  : {matched_jd['title']} ({matched_jd['id']})")
        print(f"JD Domain   : {matched_jd['domain']}")
    else:
        print("Match Found : NO — Will be marked for human review")

    return {
        **state,
        "match_found": match_found,
        "matched_jd": matched_jd,
    }
