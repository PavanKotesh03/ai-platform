import type { ReactNode } from 'react'

interface ResultSectionProps {
  title: string
  children: ReactNode
}

export default function ResultSection({ title, children }: ResultSectionProps) {
  return (
    <div className="rounded-xl bg-[#F8F8F8] p-4">
      <p className="font-semibold text-[#002126]">{title}</p>
      <div className="mt-2 space-y-1 text-sm text-[#1E1F21]">{children}</div>
    </div>
  )
}
