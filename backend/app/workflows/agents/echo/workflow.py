from langgraph.graph import StateGraph, END
from app.workflows.base_workflow import BaseWorkflow
from app.workflows.agents.echo.state import EchoState
from app.workflows.agents.echo.nodes import node_echo
from app.core.exceptions import WorkflowInputException


class EchoWorkflow(BaseWorkflow):
    name = "echo"
    description = "Returns the input text as output without modification"

    def __init__(self):
        self._graph = self._build_graph()

    def validate_input(self, input_data: dict) -> None:
        if not input_data.get("input_text", "").strip():
            raise WorkflowInputException("'input_text' is required and cannot be empty")

    def _build_graph(self):
        graph = StateGraph(EchoState)
        graph.add_node("echo", node_echo)
        graph.set_entry_point("echo")
        graph.add_edge("echo", END)
        return graph.compile()

    async def run(self, input_data: dict) -> dict:
        initial_state: EchoState = {
            "input_text": input_data.get("input_text", str(input_data)),
            "error": None,
            "echo_output": "",
        }
        result = await self._graph.ainvoke(initial_state)
        return {
            "echo_output": result["echo_output"],
            "input": input_data,
        }
