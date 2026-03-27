from abc import ABC, abstractmethod
from typing import Any
import uuid

class BaseWorkflow(ABC):
    description: str = ""

    def __init__(self):
        self.id: str = str(uuid.uuid4())  
        self.name: str = self.__class__.name  

    @abstractmethod
    async def run(self, input_data: dict[str, Any]) -> dict[str, Any]: ...