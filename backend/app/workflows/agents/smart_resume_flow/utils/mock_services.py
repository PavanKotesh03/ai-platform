import json
from datetime import datetime
from pathlib import Path


BASE_PATH = Path(__file__).resolve().parent.parent / "mock_data"


def get_job_descriptions():
    with open(BASE_PATH / "job_descriptions.json", encoding="utf-8") as file:
        return json.load(file)


def get_interviewers():
    with open(BASE_PATH / "interviewers.json", encoding="utf-8") as file:
        return json.load(file)


def get_calendar(interviewer_id: str):
    with open(BASE_PATH / "calendars.json", encoding="utf-8") as file:
        calendars = json.load(file)
    return calendars.get(interviewer_id, [])


def get_available_slot(interviewer_id: str):
    slots = get_calendar(interviewer_id)
    for slot in slots:
        if slot["available"] is True:
            return slot
    return None


def send_email_notification(schedule_details: dict):
    email_log_path = BASE_PATH / "email_notifications.json"

    with open(email_log_path, "r", encoding="utf-8") as file:
        emails = json.load(file)

    email_entry = {
        "sent_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "to_candidate": schedule_details["candidate_email"],
        "to_interviewer": schedule_details["interviewer_email"],
        "subject": f"Interview Scheduled - {schedule_details['job_title']}",
        "body": (
            f"Dear {schedule_details['candidate_name']},\n"
            f"Your interview for '{schedule_details['job_title']}' "
            f"has been scheduled on {schedule_details['date']} "
            f"at {schedule_details['time']} "
            f"with {schedule_details['interviewer_name']}.\n\n"
            "Best Regards,\nSmartResumeFlow Team"
        ),
        "status": "SENT",
    }

    emails.append(email_entry)

    with open(email_log_path, "w", encoding="utf-8") as file:
        json.dump(emails, file, indent=4)

    print("\n  Mock Email Sent!")
    print(f"     To Candidate   : {schedule_details['candidate_email']}")
    print(f"     To Interviewer : {schedule_details['interviewer_email']}")
    print(f"     Subject        : Interview Scheduled - {schedule_details['job_title']}")
