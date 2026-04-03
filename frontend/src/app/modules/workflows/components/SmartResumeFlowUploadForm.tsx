import Button from '@/app/common/Button'

interface SmartResumeFlowUploadFormProps {
  selectedFileName: string
  fileError: string
  submitError: string
  submitting: boolean
  onFileSelect: (file: File | null) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function SmartResumeFlowUploadForm({
  selectedFileName,
  fileError,
  submitError,
  submitting,
  onFileSelect,
  onSubmit,
}: SmartResumeFlowUploadFormProps) {
  return (
    <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#1E1F21]">Resume PDF</label>
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null
            onFileSelect(nextFile)
          }}
          className="rounded-xl border border-[#DDDDDD] bg-white px-4 py-3 text-sm text-[#1E1F21] file:mr-4 file:rounded-lg file:border-0 file:bg-[#761819] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
        />
        <p className="text-xs text-[#6D6E6F]">
          Upload a PDF resume only. Maximum allowed size is 10MB.
          {selectedFileName ? ` Selected file: ${selectedFileName}` : ''}
        </p>
      </div>

      {fileError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fileError}
        </div>
      ) : null}

      {submitError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      <div className="w-full sm:w-40">
        <Button type="submit" loading={submitting}>
          Run workflow
        </Button>
      </div>
    </form>
  )
}
