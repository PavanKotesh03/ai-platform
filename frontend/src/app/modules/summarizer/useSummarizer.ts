import { useState, useEffect, useRef, RefObject } from 'react'  
import { workflowService } from '@/app/services/workflow'
import type { Message, SummarizerResult } from './types'
const WORKFLOW_NAME = 'summarizer'
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
interface UseSummarizerReturn {
  messages: Message[]
  input: string
  setInput: (val: string) => void
  isSubmitting: boolean
  workflowReady: boolean
  workflowError: string
  submit: () => Promise<void>
  clearMessages: () => void
  bottomRef: RefObject<HTMLDivElement>   
}
export function useSummarizer(): UseSummarizerReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [workflowId, setWorkflowId] = useState<string | null>(null)
  const [workflowReady, setWorkflowReady] = useState(false)
  const [workflowError, setWorkflowError] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null) as RefObject<HTMLDivElement>

  useEffect(() => {
    workflowService
      .list()
      .then((res) => {
        const found = res.data.workflows.find(
          (w) => w.name.toLowerCase() === WORKFLOW_NAME
        )
        if (!found) {
          setWorkflowError(
            'Summarizer workflow is not registered in the backend. Please contact your administrator.'
          )
          return
        }
        setWorkflowId(found.id)
        setWorkflowReady(true)
      })
      .catch(() => {
        setWorkflowError('Failed to load workflows. Please refresh the page.')
      })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  const submit = async () => {
    const trimmed = input.trim()
    if (!trimmed || !workflowId || isSubmitting) return

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsSubmitting(true)
    try {
      const res = await workflowService.execute(workflowId, {
        input: { input_text: trimmed },
      })
      const data = res.data.data as unknown as SummarizerResult
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.final_summary,
        draftSummary: data.draft_summary,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { detail?: string } } }
      const errorMessage: Message = {
        id: generateId(),
        role: 'error',
        content:
          apiErr.response?.data?.detail ||
          'Something went wrong. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsSubmitting(false)
    }
  }
  const clearMessages = () => setMessages([])
  return {
    messages,
    input,
    setInput,
    isSubmitting,
    workflowReady,
    workflowError,
    submit,
    clearMessages,
    bottomRef,
  }
}