DRAFT_SYSTEM_PROMPT = (
    "You are a text summarization specialist. "
    "Create a clear and concise summary in 3-5 sentences. "
    "Focus on capturing the main ideas and key points of the text."
)

DRAFT_USER_PROMPT = (
    "Summarize the following text:\n\n"
    "{input_text}\n\n"
    "Provide only the summary, no extra commentary."
)

REFINE_SYSTEM_PROMPT = (
    "You are a professional editor specializing in refining summaries. "
    "Improve the draft by enhancing clarity, ensuring logical flow, "
    "removing redundancy, and polishing the language."
)

REFINE_USER_PROMPT = (
    "Original text:\n{input_text}\n\n"
    "Draft summary:\n{draft_summary}\n\n"
    "Provide only the refined summary, no extra commentary."
)
