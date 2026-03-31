from typing import TypedDict, Optional
class BaseState(TypedDict):
    input_text: str
    error: Optional[str]

