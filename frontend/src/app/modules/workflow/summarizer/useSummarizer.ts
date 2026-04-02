import { useState, useEffect, useRef, RefObject } from 'react'
import { useLocation } from 'react-router-dom'
import { workflowService } from '@/app/services/workflow'
import type { Message, SummarizerResult } from './types'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function isSummarizerResult(data: unknown): data is SummarizerResult {
  if (typeof data !== 'object' || data === null) return false
  const o = data as Record<string, unknown>
  return typeof o.final_summary === 'string'
}

export function useSummarizer() {
  const location = useLocation()

  // ✅ Read workflowId from navigation state — no extra API call
  const workflowId: string | null =
    (location.state as { workflowId?: string })?.workflowId ?? null

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null) as RefObject<HTMLDivElement>

  const workflowReady = !!workflowId
  const workflowError = workflowId
    ? ''
    : 'Workflow not found. Please go back to the dashboard and try again.'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = async () => {
    const trimmed = input.trim()
    if (!trimmed || !workflowId || isSubmitting) return

    setMessages((prev) => [...prev, {
      id: generateId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }])
    setInput('')
    setIsSubmitting(true)

    try {
      const res = await workflowService.execute(workflowId, {
        input: { input_text: trimmed },
      })
      const raw = res.data.data
      if (!isSummarizerResult(raw)) throw new Error('Unexpected response from summarizer')

      setMessages((prev) => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: raw.final_summary,
        draftSummary: raw.draft_summary,
        timestamp: new Date(),
      }])
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setMessages((prev) => [...prev, {
        id: generateId(),
        role: 'error',
        content: e.response?.data?.detail || 'Something went wrong. Please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    messages,
    input,
    setInput,
    isSubmitting,
    workflowReady,
    workflowError,
    submit,
    clearMessages: () => setMessages([]),
    bottomRef,
  }
}