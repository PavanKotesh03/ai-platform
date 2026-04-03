from abc import ABC, abstractmethod


class BaseWorkflow(ABC):
    id: str = ""
    name: str
    description: str

    def validate_input(self, input_data: dict) -> None:
        """Override in subclasses to validate workflow-specific inputs.
        Raise WorkflowInputException if validation fails.
        Called before the session is created, so no DB record is written on bad input.
        """
        pass

    @abstractmethod
    async def run(self, input_data: dict) -> dict:
        pass