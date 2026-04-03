import Button from '@/app/common/Button'

interface DecisionModalProps {
  open: boolean
  title: string
  description: string
  onApprove: () => void
  onReject: () => void
}

export default function DecisionModal({
  open,
  title,
  description,
  onApprove,
  onReject,
}: DecisionModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#002126]/25 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-sm font-medium text-[#761819]">Human Review Required</p>
        <h3 className="mt-2 text-xl font-bold text-[#002126]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#6D6E6F]">{description}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button type="button" onClick={onApprove}>
            Approve
          </Button>
          <Button type="button" variant="ghost" onClick={onReject}>
            Reject
          </Button>
        </div>
      </div>
    </div>
  )
}
