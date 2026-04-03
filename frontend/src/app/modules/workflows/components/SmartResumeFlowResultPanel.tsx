import Button from '@/app/common/Button'
import type { ExecutionResponse } from '@/app/store/types'
import type { ReviewDecisionState, SmartResumeFlowResultData } from '../types'
import PaginationControls from './PaginationControls'
import ResultSection from './ResultSection'

interface SmartResumeFlowResultPanelProps {
  result: ExecutionResponse | null
  decisionState: ReviewDecisionState
  showDetails: boolean
  currentPage: number
  totalPages: number
  canGoPrevious: boolean
  canGoNext: boolean
  onPreviousPage: () => void
  onNextPage: () => void
  onShowDetails: () => void
}

function renderLine(label: string, value: string | undefined) {
  return (
    <p>
      <span className="font-semibold">{label}:</span> {value || '-'}
    </p>
  )
}

export default function SmartResumeFlowResultPanel({
  result,
  decisionState,
  showDetails,
  currentPage,
  totalPages,
  canGoPrevious,
  canGoNext,
  onPreviousPage,
  onNextPage,
  onShowDetails,
}: SmartResumeFlowResultPanelProps) {
  const resultData = result?.data as SmartResumeFlowResultData | undefined
  const matchedJd = resultData?.matched_jd
  const assignedInterviewer = resultData?.assigned_interviewer
  const scheduleDetails = resultData?.schedule_details
  const matchFound = resultData?.match_found === true
  const hasInterviewer = Boolean(assignedInterviewer)
  const requiresDecision = matchFound && hasInterviewer
  const canRevealDetails =
    decisionState === 'approved' || (matchFound && !hasInterviewer)

  const resultPages = [
    {
      title: 'Candidate Info',
      content: (
        <ResultSection title="Candidate Info">
          {renderLine('Candidate', resultData?.candidate_name)}
          {renderLine('Email', resultData?.candidate_email)}
          {renderLine('Domain', resultData?.extracted_domain)}
          {renderLine(
            'Skills',
            Array.isArray(resultData?.extracted_skills)
              ? resultData.extracted_skills.join(', ')
              : undefined,
          )}
        </ResultSection>
      ),
    },
    {
      title: 'Job Match',
      content: (
        <ResultSection title="Job Match">
          {renderLine('Found', String(resultData?.match_found ?? false))}
          {renderLine('Job', matchedJd?.title)}
          {renderLine('Job ID', matchedJd?.id)}
          {renderLine('Domain', matchedJd?.domain)}
        </ResultSection>
      ),
    },
    {
      title: 'Interviewer',
      content: (
        <ResultSection title="Interviewer">
          {renderLine('Name', assignedInterviewer?.name)}
          {renderLine('Email', assignedInterviewer?.email)}
          {renderLine('Domain', assignedInterviewer?.domain)}
        </ResultSection>
      ),
    },
    {
      title: 'Scheduling',
      content: (
        <ResultSection title="Scheduling">
          {renderLine('Approved', decisionState === 'approved' ? 'true' : 'pending')}
          {renderLine('Scheduled', String(resultData?.scheduled ?? false))}
          {resultData?.review_reason ? renderLine('Review reason', resultData.review_reason) : null}
          {renderLine('Date', scheduleDetails?.date)}
          {renderLine('Time', scheduleDetails?.time)}
          {renderLine('Job title', scheduleDetails?.job_title)}
          {renderLine('Interviewer', scheduleDetails?.interviewer_name)}
          {renderLine('Status', scheduleDetails?.status)}
        </ResultSection>
      ),
    },
  ]

  return (
    <aside className="rounded-2xl border border-[#DDDDDD] bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#002126]">Execution result</h3>

      {!result ? (
        <p className="mt-4 text-sm leading-6 text-[#6D6E6F]">
          Upload a PDF and run the workflow to analyze the candidate profile and interview flow.
        </p>
      ) : !matchFound ? (
        <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          No matching job description was found for this resume.
          {resultData?.review_reason ? ` ${resultData.review_reason}` : ''}
        </div>
      ) : decisionState === 'rejected' ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Scheduling was rejected during human review. Details remain hidden for this run.
        </div>
      ) : !showDetails ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-[#F8F8F8] p-4 text-sm text-[#1E1F21]">
            {requiresDecision ? (
              <p>Workflow finished. Human approval is required before revealing the details.</p>
            ) : (
              <p>Workflow finished. Details are ready to review.</p>
            )}
          </div>

          {canRevealDetails ? (
            <div className="w-full sm:w-36">
              <Button type="button" onClick={onShowDetails}>
                See Details
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4">
          <div className="rounded-lg bg-[#FCEEEE] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#761819]">
            {resultPages[currentPage - 1]?.title}
          </div>

          <div className="mt-4">{resultPages[currentPage - 1]?.content}</div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onPrevious={onPreviousPage}
            onNext={onNextPage}
          />
        </div>
      )}
    </aside>
  )
}
