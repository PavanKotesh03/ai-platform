import { useState, useEffect, useRef, RefObject } from 'react'
import { useLocation } from 'react-router-dom'
import type { Message } from './types'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useSummarizer() {
  const location = useLocation()

  const workflowId: string | null =
    (location.state as { workflow?: { id: string } } | null)?.workflow?.id ?? null

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

    const assistantId = generateId()
    setMessages((prev) => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      status: '',
      streaming: true,
      timestamp: new Date(),
    }])

    try {
      const response = await fetch(
        `/api/v1/workflows/${workflowId}/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          credentials: 'include',
          body: JSON.stringify({ input: { input_text: trimmed } }),
        }
      )

      if (!response.ok || !response.body) throw new Error('Stream failed')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })

        for (const line of text.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw) continue

          let chunk: Record<string, unknown>
          try { chunk = JSON.parse(raw) } catch { continue }

          if (chunk.error) {
            setMessages((prev) => prev.map((m) =>
              m.id === assistantId
                ? { ...m, role: 'error' as const, content: String(chunk.error), streaming: false, status: '' }
                : m
            ))
            break
          }

          if (chunk.status) {
            setMessages((prev) => prev.map((m) =>
              m.id === assistantId ? { ...m, status: String(chunk.status) } : m
            ))
          }

          if (chunk.token) {
            setMessages((prev) => prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + String(chunk.token), status: '' }
                : m
            ))
          }

          if (chunk.done) {
            setMessages((prev) => prev.map((m) =>
              m.id === assistantId
                ? { ...m, streaming: false, status: '', draftSummary: String(chunk.draft_summary ?? '') }
                : m
            ))
          }
        }
      }
    } catch {
      setMessages((prev) => prev.map((m) =>
        m.id === assistantId
          ? { ...m, role: 'error' as const, content: 'Something went wrong. Please try again.', streaming: false, status: '' }
          : m
      ))
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