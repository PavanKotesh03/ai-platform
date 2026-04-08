import type { FormEvent, RefObject } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/app/common/Button'
import type { Workflow } from '@/app/store/types'
import ResumeUploadForm from './ResumeUploadForm'

interface WorkflowSectionProps {
  workflowLoading: boolean
  workflow: Workflow | null
  workflowError: string
  executionStep: 'upload' | 'results' | 'decision_saved'
  resumeFile: File | null
  submitting: boolean
  uploadError: string
  resultsError: string
  fileInputRef: RefObject<HTMLInputElement>
  fileInputKey: number
  onFileChange: (file: File | null) => void
  onFileAction: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onClearUploadError: () => void
  onReset: () => void
}

export default function WorkflowSection({
  workflowLoading,
  workflow,
  workflowError,
  executionStep,
  resumeFile,
  submitting,
  uploadError,
  resultsError,
  fileInputRef,
  fileInputKey,
  onFileChange,
  onFileAction,
  onSubmit,
  onClearUploadError,
  onReset,
}: WorkflowSectionProps) {
  return (
    <section className="rounded-2xl border border-[#DDDDDD] bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-medium text-[#761819]">
          <Link to="/" className="hover:underline">Back to dashboard</Link>
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[#002126]">Run Smart Resume Flow</h2>
      </div>

      {workflowLoading ? (
        <div className="mt-6 rounded-xl border border-[#DDDDDD] bg-[#F8F8F8] p-4 text-sm text-[#6D6E6F]">
          Loading workflow details...
        </div>
      ) : !workflow ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {workflowError || 'Workflow not found. Please go back to the dashboard and try again.'}
        </div>
      ) : executionStep === 'upload' ? (
        <ResumeUploadForm
          resumeFile={resumeFile}
          submitting={submitting}
          error={uploadError}
          fileInputRef={fileInputRef}
          fileInputKey={fileInputKey}
          onFileChange={onFileChange}
          onFileAction={onFileAction}
          onSubmit={onSubmit}
          clearError={onClearUploadError}
        />
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          <div className="rounded-xl bg-[#F8F8F8] p-4 text-sm text-[#1E1F21]">
            <p className="font-semibold text-[#002126]">Uploaded resume</p>
            <p className="mt-2 text-[#6D6E6F]">
              {resumeFile?.name ? `File: ${resumeFile.name}` : 'Resume uploaded successfully.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="w-full sm:w-40">
              <Button type="button" variant="ghost" onClick={onReset}>
                Reset
              </Button>
            </div>
            {executionStep === 'decision_saved' ? (
              <div className="w-full sm:w-48">
                <Button type="button" onClick={onReset}>
                  New Request
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {executionStep !== 'upload' && resultsError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {resultsError}
        </div>
      ) : null}
    </section>
  )
}
