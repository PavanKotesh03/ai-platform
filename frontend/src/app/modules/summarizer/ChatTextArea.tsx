// src/app/modules/summarizer/ChatTextArea.tsx

import { useRef, KeyboardEvent } from 'react'

interface ChatTextAreaProps {
  value: string
  onChange: (val: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  disabled: boolean
}

export default function ChatTextArea({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  disabled,
}: ChatTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Ctrl+Enter or Cmd+Enter to submit; plain Enter adds newline
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      onSubmit()
    }
  }

  const canSubmit = value.trim().length > 0 && !isSubmitting && !disabled

  return (
    <div className="border-t border-[#DDDDDD] bg-white px-4 py-4">
      <div className="mx-auto max-w-3xl">
        <div
          className={`flex items-end gap-3 rounded-xl border bg-white p-3 transition
            ${disabled
              ? 'border-[#DDDDDD] opacity-60'
              : 'border-[#DDDDDD] focus-within:border-[#761819] focus-within:ring-2 focus-within:ring-[#761819]/20'
            }`}
        >
          <textarea
            ref={textareaRef}
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSubmitting}
            placeholder={
              disabled
                ? 'Summarizer is unavailable...'
                : 'Paste or type text to summarize... (Ctrl+Enter to submit)'
            }
            className="flex-1 resize-none bg-transparent text-sm text-[#1E1F21] placeholder-[#6D6E6F] outline-none disabled:cursor-not-allowed"
          />

          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#761819] text-white transition hover:bg-[#5a1213] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Submit"
          >
            {isSubmitting ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-[#6D6E6F]">
          Ctrl+Enter to submit &nbsp;·&nbsp; Groq drafts, Gemini refines
        </p>
      </div>
    </div>
  )
}