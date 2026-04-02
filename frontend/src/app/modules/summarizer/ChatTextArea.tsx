// src/app/modules/summarizer/ChatTextArea.tsx

import { KeyboardEvent } from 'react'

interface Props {
  value: string
  onChange: (val: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  disabled: boolean
}

export default function ChatTextArea({ value, onChange, onSubmit, isSubmitting, disabled }: Props) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="border-t border-[#DDDDDD] bg-white px-4 py-4">
      <div className="mx-auto max-w-3xl flex items-end gap-2 rounded-xl border border-[#DDDDDD] bg-white p-3 focus-within:border-[#761819]">
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSubmitting}
          placeholder="Paste or type text to summarize... (Enter to submit)"
          className="flex-1 resize-none bg-transparent text-sm text-[#1E1F21] placeholder-[#6D6E6F] outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim() || isSubmitting || disabled}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#761819] text-white hover:bg-[#5a1213] disabled:opacity-40"
          aria-label="Submit"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <p className="mt-1.5 text-center text-xs text-[#6D6E6F]">Enter to submit · Shift+Enter for new line</p>
    </div>
  )
}