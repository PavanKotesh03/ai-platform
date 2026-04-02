// src/app/modules/summarizer/SummarizerPage.tsx

import { useNavigate } from 'react-router-dom'
import { useSummarizer } from './useSummarizer'
import ChatDisplayArea from './ChatDisplayArea'
import ChatTextArea from './ChatTextArea'

export default function SummarizerPage() {
  const navigate = useNavigate()
  const { messages, input, setInput, isSubmitting, workflowReady, workflowError, submit, clearMessages, bottomRef } = useSummarizer()

  return (
    <div className="flex h-screen flex-col bg-[#F8F8F8]">

      <header className="shrink-0 border-b border-[#DDDDDD] bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DDDDDD] text-[#6D6E6F] hover:border-[#761819] hover:text-[#761819]"
              aria-label="Back"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-sm font-semibold text-[#002126]">Summarizer</h1>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-xs text-[#6D6E6F] hover:text-[#761819] border border-[#DDDDDD] rounded-lg px-3 py-1.5"
            >
              Clear chat
            </button>
          )}
        </div>
      </header>
      {workflowError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-center text-sm text-red-600">
          {workflowError}
        </div>
      )}


      <ChatDisplayArea messages={messages} isSubmitting={isSubmitting} bottomRef={bottomRef} />

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