// src/app/modules/summarizer/SummarizerPage.tsx

import { useNavigate } from 'react-router-dom'
import { useSummarizer } from './useSummarizer'
import ChatDisplayArea from './ChatDisplayArea'
import ChatTextArea from './ChatTextArea'

export default function SummarizerPage() {
  const navigate = useNavigate()
  const {
    messages,
    input,
    setInput,
    isSubmitting,
    workflowReady,
    workflowError,
    submit,
    clearMessages,
    bottomRef,
  } = useSummarizer()

  return (
    <div className="flex h-screen flex-col bg-[#F8F8F8]">
      {/* Header */}
      <header className="shrink-0 border-b border-[#DDDDDD] bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DDDDDD] text-[#6D6E6F] transition hover:border-[#761819] hover:text-[#761819]"
              aria-label="Back to dashboard"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div>
              <p className="text-xs font-medium text-[#761819]">Agentic AI Platform</p>
              <h1 className="text-lg font-bold text-[#002126] leading-tight">Text Summarizer</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Workflow status badge */}
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
              ${workflowError ? 'bg-red-50 text-red-600' : workflowReady ? 'bg-green-50 text-green-700' : 'bg-[#F8F8F8] text-[#6D6E6F]'}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full
                ${workflowError ? 'bg-red-500' : workflowReady ? 'bg-green-500' : 'bg-[#DDDDDD]'}`}
              />
              {workflowError ? 'Unavailable' : workflowReady ? 'Ready' : 'Loading...'}
            </span>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearMessages}
                className="rounded-lg border border-[#DDDDDD] px-3 py-1.5 text-xs font-medium text-[#6D6E6F] transition hover:border-[#761819] hover:text-[#761819]"
              >
                Clear chat
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Workflow error banner */}
      {workflowError && (
        <div className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {workflowError}
        </div>
      )}

      {/* Scrollable chat display */}
      <ChatDisplayArea
        messages={messages}
        isSubmitting={isSubmitting}
        bottomRef={bottomRef}
      />

      {/* Pinned input */}
      <ChatTextArea
        value={input}
        onChange={setInput}
        onSubmit={submit}
        isSubmitting={isSubmitting}
        disabled={!workflowReady}
      />
    </div>
  )
}