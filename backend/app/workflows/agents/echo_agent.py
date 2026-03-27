from app.workflows.base_workflow import BaseWorkflow

class EchoAgent(BaseWorkflow):
    name = "echo"
    description = "Echoes workflow that returns the input data as output"

    async def run(self, input_data: dict) -> dict:
        return {"message": "echo response", "input": input_data}