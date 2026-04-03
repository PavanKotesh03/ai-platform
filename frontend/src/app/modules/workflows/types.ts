import type { Workflow } from '@/app/store/types'

export type ReviewDecisionState = 'idle' | 'approved' | 'rejected'

export interface WorkflowLocationState {
  workflow?: Workflow
}

export interface SmartResumeFlowMatchedJob {
  id?: string
  title?: string
  domain?: string
}

export interface SmartResumeFlowInterviewer {
  id?: string
  name?: string
  email?: string
  domain?: string
}

export interface SmartResumeFlowScheduleDetails {
  date?: string
  time?: string
  job_title?: string
  interviewer_name?: string
  interviewer_email?: string
  status?: string
}

export interface SmartResumeFlowResultData extends Record<string, unknown> {
  candidate_name?: string
  candidate_email?: string
  extracted_domain?: string
  extracted_skills?: string[]
  match_found?: boolean
  matched_jd?: SmartResumeFlowMatchedJob | null
  assigned_interviewer?: SmartResumeFlowInterviewer | null
  human_approved?: boolean | null
  scheduled?: boolean
  marked_for_review?: boolean
  review_reason?: string | null
  schedule_details?: SmartResumeFlowScheduleDetails | null
}
