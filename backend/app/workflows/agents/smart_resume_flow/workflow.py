from app.workflows.base_workflow import BaseWorkflow


class SmartResumeWorkflow(BaseWorkflow):
    name = "smart_resume_flow"
    description = "Analyzes resume input and schedules interview"

    def validate_input(self, input_data: dict) -> None:
        return None

    async def run(self, input_data: dict) -> dict:
        return {
            "message": "smart_resume_flow is registered and ready for the next implementation step.",
            "input": input_data,
        }
