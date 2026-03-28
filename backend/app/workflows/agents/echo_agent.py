from app.workflows.base_workflow import BaseWorkflow


class EchoAgent(BaseWorkflow):
    name = "echo"                                              # stable — never changes
    description = "Echoes workflow that returns the input data as output"
    # id is NOT set here — DB owns it
    
    async def run(self, input_data: dict) -> dict:
        return {"message": "echo response", "input": input_data}