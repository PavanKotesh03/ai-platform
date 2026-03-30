import json
import os
from datetime import datetime

BASE_PATH = os.path.join(os.path.dirname(__file__), "..", "mock_data")  # DB connection


# --- Load Job Descriptions ---
def get_job_descriptions():
    with open(os.path.join(BASE_PATH, "job_descriptions.json")) as f:
        return json.load(f)


# --- Load Interviewers ---
def get_interviewers():
    with open(os.path.join(BASE_PATH, "interviewers.json")) as f:
        return json.load(f)


# --- Load Calendar for a specific interviewer ---
def get_calendar(interviewer_id: str):
    with open(os.path.join(BASE_PATH, "calendars.json")) as f:
        calendars = json.load(f)
    return calendars.get(interviewer_id, [])


# --- Get first available slot for an interviewer ---
def get_available_slot(interviewer_id: str):
    slots = get_calendar(interviewer_id)
    for slot in slots:
        if slot["available"] is True:
            return slot
    return None


# --- Mock Email Notification ---
def send_email_notification(schedule_details: dict):
    email_log_path = os.path.join(BASE_PATH, "email_notifications.json")

    with open(email_log_path, "r") as f:
        emails = json.load(f)

    email_entry = {
        "sent_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "to_candidate": schedule_details["candidate_email"],
        "to_interviewer": schedule_details["interviewer_email"],
        "subject": f"Interview Scheduled - {schedule_details['job_title']}",
        "body": f"Dear {schedule_details['candidate_name']},\n"
        f"Your interview for '{schedule_details['job_title']}' "
        f"has been scheduled on {schedule_details['date']} "
        f"at {schedule_details['time']} "
        f"with {schedule_details['interviewer_name']}.\n\n"
        f"Best Regards,\nSmartResumeFlow Team",
        "status": "SENT",
    }

    emails.append(email_entry)

    with open(email_log_path, "w") as f:
        json.dump(emails, f, indent=4)

    print(f"\n  📧 Mock Email Sent!")
    print(f"     To Candidate   : {schedule_details['candidate_email']}")
    print(f"     To Interviewer : {schedule_details['interviewer_email']}")
    print(
        f"     Subject        : Interview Scheduled - {schedule_details['job_title']}"
    )
