import type { FormEvent, RefObject } from 'react'
import Button from '@/app/common/Button'

interface ResumeUploadFormProps {
  resumeFile: File | null
  submitting: boolean
  error: string
  fileInputRef: RefObject<HTMLInputElement>
  fileInputKey: number
  onFileChange: (file: File | null) => void
  onFileAction: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  clearError: () => void
}

export default function ResumeUploadForm({
  resumeFile,
  submitting,
  error,
  fileInputRef,
  fileInputKey,
  onFileChange,
  onFileAction,
  onSubmit,
  clearError,
}: ResumeUploadFormProps) {
  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event)
      }}
      className="mt-5 flex flex-col gap-4"
    >
      <p className="text-sm leading-6 text-[#6D6E6F]">
        Upload a PDF resume and execute the workflow to extract candidate details, match roles,
        and review interviewer assignment.
      </p>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#1E1F21]">Resume PDF</label>
        <input
          ref={fileInputRef}
          key={fileInputKey}
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => {
            onFileChange(event.target.files?.[0] ?? null)
            clearError()
          }}
          className="hidden"
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-40">
            <Button type="button" onClick={onFileAction}>
              {resumeFile ? 'Preview' : 'Choose file'}
            </Button>
          </div>
          <p className="text-sm text-[#6D6E6F]">
            {resumeFile?.name || 'No file selected'}
          </p>
        </div>
      </div>

      <div className="w-full sm:w-40">
        <Button
          type="submit"
          loading={submitting}
          disabled={!resumeFile || submitting}
        >
          execute
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </form>
  )
}
