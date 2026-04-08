import Button from '@/app/common/Button'

interface JobMatch {
  title?: string | null
  id?: string | null
}

interface InterviewerInfo {
  name?: string | null
  email?: string | null
}

interface ScheduleInfo {
  date?: string | null
  time?: string | null
}

interface WorkflowResultData {
  candidate_name?: string | null
  candidate_email?: string | null
  extracted_domain?: string | null
  matched_jd?: JobMatch
  assigned_interviewer?: InterviewerInfo
  schedule_details?: ScheduleInfo
  human_approved?: boolean | string | null
  scheduled?: boolean
  match_found?: boolean
  review_reason?: string | null
}

interface ResultsPanelProps {
  resultData: WorkflowResultData | undefined
  executionStep: 'upload' | 'results' | 'decision_saved'
  approvalDecision: 'approve' | 'reject' | null
  savingDecision: boolean
  decisionMessage: string
  onApprovalDecision: (decision: 'approve' | 'reject') => Promise<void>
  onReset: () => void
}

export default function ResultsPanel({
  resultData,
  executionStep,
  approvalDecision,
  savingDecision,
  decisionMessage,
  onApprovalDecision,

}: ResultsPanelProps) {
  const matchedJd = resultData?.matched_jd
  const assignedInterviewer = resultData?.assigned_interviewer
  const scheduleDetails = resultData?.schedule_details

  return (
    <aside className="rounded-2xl border border-[#DDDDDD] bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#002126]">Execution result</h3>
      <div className="mt-4 flex flex-col gap-4 text-sm text-[#1E1F21]">
        <div className="rounded-xl bg-[#F8F8F8] p-4">
          <p><span className="font-semibold">Candidate:</span> {String(resultData?.candidate_name ?? '-')}</p>
          <p><span className="font-semibold">Email:</span> {String(resultData?.candidate_email ?? '-')}</p>
          <p><span className="font-semibold">Domain:</span> {String(resultData?.extracted_domain ?? '-')}</p>
        </div>
        <div className="rounded-xl bg-[#F8F8F8] p-4">
          <p className="font-semibold text-[#002126]">Match</p>
          <p className="mt-2">Found: {String(resultData?.match_found ?? false)}</p>
          <p>Job: {String(matchedJd?.title ?? '-')}</p>
          <p>Job ID: {String(matchedJd?.id ?? '-')}</p>
        </div>
        <div className="rounded-xl bg-[#F8F8F8] p-4">
          <p className="font-semibold text-[#002126]">Interviewer</p>
          <p className="mt-2">Name: {String(assignedInterviewer?.name ?? '-')}</p>
          <p>Email: {String(assignedInterviewer?.email ?? '-')}</p>
        </div>
        <div className="rounded-xl bg-[#F8F8F8] p-4">
          <p className="font-semibold text-[#002126]">Review and scheduling</p>
          <p className="mt-2">Human approved: {String(resultData?.human_approved ?? 'pending')}</p>
          <p>Scheduled: {String(resultData?.scheduled ?? false)}</p>
          {(resultData?.review_reason ?? '') ? (
            <p>Review reason: {String(resultData?.review_reason)}</p>
          ) : null}
          <p>Date: {String(scheduleDetails?.date ?? '-')}</p>
          <p>Time: {String(scheduleDetails?.time ?? '-')}</p>
        </div>

        {executionStep !== 'decision_saved' && approvalDecision === null ? (
          <div className="rounded-xl border border-[#DDDDDD] p-4">
            <p className="text-sm font-semibold text-[#002126]">Approval decision</p>
            <p className="mt-1 text-sm text-[#6D6E6F]">
              Approve or reject this scheduling request to save the final decision.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                loading={savingDecision}
                disabled={savingDecision}
                onClick={() => void onApprovalDecision('approve')}
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={savingDecision}
                onClick={() => void onApprovalDecision('reject')}
              >
                Reject
              </Button>
            </div>
          </div>
        ) : null}

        {executionStep === 'decision_saved' ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <p className="font-semibold">{decisionMessage || 'Decision saved successfully.'}</p>
            <p className="mt-1">
              Final decision: {approvalDecision === 'approve' ? 'Approved' : 'Rejected'}
            </p>
           
          </div>
        ) : null}
      </div>
    </aside>
  )
}
