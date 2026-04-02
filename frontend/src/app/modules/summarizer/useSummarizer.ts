// src/app/modules/summarizer/useSummarizer.ts

import { useState, useEffect, useRef, RefObject } from 'react'
import { workflowService } from '@/app/services/workflow'
import type { Message, SummarizerResult } from './types'

const WORKFLOW_NAME = 'summarizer'

let idCounter = 0
function generateId() {
  return `msg-${++idCounter}`
}

export function useSummarizer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [workflowId, setWorkflowId] = useState<string | null>(null)
  const [workflowReady, setWorkflowReady] = useState(false)
  const [workflowError, setWorkflowError] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null) as RefObject<HTMLDivElement>

  useEffect(() => {
    workflowService.list().then((res) => {
      const found = res.data.workflows.find(
        (w) => w.name.toLowerCase() === WORKFLOW_NAME
      )
      if (!found) {
        setWorkflowError('Summarizer is not available.')
        return
      }
      setWorkflowId(found.id)
      setWorkflowReady(true)
    }).catch(() => {
      setWorkflowError('Failed to load. Please refresh.')
    })
  }, [])

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
      const data = res.data.data as unknown as SummarizerResult
      setMessages((prev) => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: data.final_summary,
        draftSummary: data.draft_summary,
        timestamp: new Date(),
      }])
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setMessages((prev) => [...prev, {
        id: generateId(),
        role: 'error',
        content: e.response?.data?.detail || 'Something went wrong.',
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