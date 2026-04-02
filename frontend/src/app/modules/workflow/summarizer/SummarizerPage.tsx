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

      <header className="shrink-0 border-b border-[#DDDDDD] bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          {/* ✅ No back arrow — just title */}
          <h1 className="text-sm font-semibold text-[#002126]">Summarizer</h1>

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
      </header>

      {workflowError && (
        <div className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
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