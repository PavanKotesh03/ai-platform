// src/app/modules/summarizer/ChatDisplayArea.tsx

import { useState, RefObject } from 'react'
import type { Message } from './types'

interface Props {
  messages: Message[]
  isSubmitting: boolean
  bottomRef: RefObject<HTMLDivElement>
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatDisplayArea({ messages, isSubmitting, bottomRef }: Props) {
  const [openDrafts, setOpenDrafts] = useState<Set<string>>(new Set())

  const toggleDraft = (id: string) => {
    setOpenDrafts((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (messages.length === 0 && !isSubmitting) {
    return (
      <div className="flex flex-1 items-center justify-center text-center px-4">
        <div>
          <p className="text-base font-medium text-[#002126]">Paste any text to summarize</p>
          <p className="mt-1 text-sm text-[#6D6E6F]">Groq drafts · Gemini refines</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[75%]">

              {msg.role === 'user' && (
                <>
                  <div className="rounded-2xl rounded-tr-sm bg-[#761819] px-4 py-3 text-sm text-white whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <p className="mt-1 text-right text-xs text-[#6D6E6F]">{formatTime(msg.timestamp)}</p>
                </>
              )}

              {msg.role === 'assistant' && (
                <>
                  <div className="rounded-2xl rounded-tl-sm border border-[#DDDDDD] bg-white px-4 py-3">
                    <p className="text-xs font-medium text-[#761819] mb-2">Final Summary</p>
                    <p className="text-sm leading-6 text-[#1E1F21] whitespace-pre-wrap">{msg.content}</p>
                    {msg.draftSummary && (
                      <div className="mt-3 border-t border-[#DDDDDD] pt-3">
                        <button
                          onClick={() => toggleDraft(msg.id)}
                          className="text-xs text-[#6D6E6F] hover:text-[#761819]"
                        >
                          {openDrafts.has(msg.id) ? 'Hide draft' : 'Show draft (Groq)'}
                        </button>
                        {openDrafts.has(msg.id) && (
                          <p className="mt-2 text-sm text-[#6D6E6F] whitespace-pre-wrap">{msg.draftSummary}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#6D6E6F]">{formatTime(msg.timestamp)}</p>
                </>
              )}

              {msg.role === 'error' && (
                <div className="rounded-2xl rounded-tl-sm border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">{msg.content}</p>
                  <p className="mt-1 text-xs text-red-400">{formatTime(msg.timestamp)}</p>
                </div>
              )}

            </div>
          </div>
        ))}

        {isSubmitting && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm border border-[#DDDDDD] bg-white px-4 py-3 text-sm text-[#6D6E6F]">
              Summarizing...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}