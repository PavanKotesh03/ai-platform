from abc import ABC, abstractmethod
from typing import Any, Optional


class BaseWorkflow(ABC):
    name: str = ""           # stable identifier — defined in code
    description: str = ""    # defined in code
    id: Optional[str] = None # assigned FROM DB at startup — not hardcoded

    @abstractmethod
    async def run(self, input_data: dict[str, Any]) -> dict[str, Any]: ...