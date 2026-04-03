export type MessageRole = 'user' | 'assistant' | 'error'

export interface Message {
  id: string
  role: MessageRole
  content: string
  draftSummary?: string
  timestamp: Date
}

export interface SummarizerResult {
  draft_summary: string
  final_summary: string
}