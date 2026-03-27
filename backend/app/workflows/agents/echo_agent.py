from app.workflows.base_workflow import BaseWorkflow

class EchoAgent(BaseWorkflow):
    name = "echo"
    description = "Echoes input back to verify end-to-end flow"

    async def run(self, input_data: dict) -> dict:
        return {"message": "echo response", "input": input_data}