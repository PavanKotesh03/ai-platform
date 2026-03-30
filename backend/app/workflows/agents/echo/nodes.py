from app.workflows.agents.echo.state import EchoState


async def node_echo(state: EchoState) -> dict:
    return {"echo_output": state["input_text"], "error": None}