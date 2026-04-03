import Button from '@/app/common/Button'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
}

export default function PaginationControls({
  currentPage,
  totalPages,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#DDDDDD] pt-4">
      <div className="w-28">
        <Button type="button" variant="ghost" disabled={!canGoPrevious} onClick={onPrevious}>
          Previous
        </Button>
      </div>

      <p className="text-sm font-medium text-[#6D6E6F]">
        Page {currentPage} of {totalPages}
      </p>

      <div className="w-28">
        <Button type="button" variant="ghost" disabled={!canGoNext} onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
