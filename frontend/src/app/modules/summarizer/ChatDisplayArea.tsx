// src/app/modules/summarizer/ChatDisplayArea.tsx

import { useState, RefObject } from 'react'
import type { Message } from './types'

interface ChatDisplayAreaProps {
  messages: Message[]
  isSubmitting: boolean
  bottomRef: RefObject<HTMLDivElement>
}

function DraftToggle({ draft }: { draft: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3 border-t border-[#DDDDDD] pt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs font-medium text-[#6D6E6F] hover:text-[#761819] transition"
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-90' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        {open ? 'Hide draft (Groq)' : 'Show draft (Groq)'}
      </button>
      {open && (
        <p className="mt-2 text-sm leading-6 text-[#6D6E6F] whitespace-pre-wrap">
          {draft}
        </p>
      )}
    </div>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-white border border-[#DDDDDD] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#761819] animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-[#761819] animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-[#761819] animate-bounce [animation-delay:300ms]" />
        </div>
        <p className="mt-1.5 text-xs text-[#6D6E6F]">Summarizing...</p>
      </div>
    </div>
  )
}

export default function ChatDisplayArea({ messages, isSubmitting, bottomRef }: ChatDisplayAreaProps) {
  if (messages.length === 0 && !isSubmitting) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#761819]/10">
          <svg className="h-7 w-7 text-[#761819]" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-[#002126]">Paste any text to summarize</h3>
        <p className="mt-1 max-w-xs text-sm text-[#6D6E6F]">
          Groq produces a draft, then Gemini refines it for clarity and flow.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[75%]">
                  <div className="rounded-2xl rounded-tr-sm bg-[#761819] px-4 py-3 text-sm leading-6 text-white whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <p className="mt-1 text-right text-xs text-[#6D6E6F]">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            )
          }

          if (msg.role === 'error') {
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[75%] rounded-2xl rounded-tl-sm border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-700">{msg.content}</p>
                  <p className="mt-1 text-xs text-red-400">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            )
          }

          // assistant
          return (
            <div key={msg.id} className="flex justify-start">
              <div className="max-w-[75%]">
                <div className="rounded-2xl rounded-tl-sm border border-[#DDDDDD] bg-white px-4 py-3 shadow-sm">
                  <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[#761819]/10 px-2 py-0.5 text-xs font-medium text-[#761819]">
                    ✦ Final Summary
                  </span>
                  <p className="text-sm leading-6 text-[#1E1F21] whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  {msg.draftSummary && <DraftToggle draft={msg.draftSummary} />}
                </div>
                <p className="mt-1 text-xs text-[#6D6E6F]">{formatTime(msg.timestamp)}</p>
              </div>
            </div>
          )
        })}

        {isSubmitting && <ThinkingBubble />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}