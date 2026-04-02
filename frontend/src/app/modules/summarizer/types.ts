// src/app/modules/summarizer/types.ts

export type MessageRole = 'user' | 'assistant' | 'error'

export interface Message {
  id: string
  role: MessageRole
  content: string          // user: raw input | assistant: final_summary | error: message
  draftSummary?: string    // only on assistant messages — collapsible
  timestamp: Date
}

export interface SummarizerResult {
  draft_summary: string
  final_summary: string
}