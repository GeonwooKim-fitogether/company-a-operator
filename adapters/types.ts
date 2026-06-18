/**
 * Core 데이터 계약의 TypeScript 타입.
 * digital-operator-core/schemas/*.schema.json과 일치해야 한다.
 * (Phase 1에서는 수동 동기화, 후속에 schema에서 자동 생성 검토)
 */

export interface ProjectBrief {
  id: string;
  companyId: string;
  title: string;
  objective: string;
  completionCriteria: string[];
  constraints: string[];
  priority?: "high" | "medium" | "low";
  deadline?: string;
  requestedAt: string;
  requestedBy?: string;
  tags?: string[];
  relatedProjectIds?: string[];
}

export interface SourceReference {
  id: string;
  type: "google-drive" | "gbrain-episode" | "manual" | "external-url";
  title: string;
  driveFileId?: string;
  driveUrl?: string;
  mimeType?: string;
  modifiedAt?: string;
  author?: string;
  retrievedAt: string;
  relevanceSummary?: string;
  pageRange?: string;
  excerpt?: string;
}

export interface ExecutionTask {
  id: string;
  title: string;
  description: string;
  dependencies?: string[];
  status: "pending" | "in-progress" | "done" | "skipped";
  sourceIds?: string[];
}

export interface ExecutionPlan {
  id: string;
  projectId: string;
  tasks: ExecutionTask[];
  riskFlags: string[];
  pendingDecisions: string[];
  relatedEpisodeIds?: string[];
  createdAt: string;
}

export interface EvaluationFinding {
  dimension: string;
  observation: string;
  severity: "info" | "warning" | "critical";
  revisionsRequired?: string[];
}

export interface Evaluation {
  id: string;
  projectId: string;
  verdict: "pass" | "revise" | "fail";
  overallScore: number;
  scores: Record<string, number>;
  findings: EvaluationFinding[];
  uncertainties?: string[];
  rubricId: string;
  evaluatedAt: string;
}

export interface ProjectEpisode {
  id: string;
  projectId: string;
  companyId: string;
  title: string;
  objective?: string;
  outcome: "success" | "partial" | "failure";
  outcomeDetails?: string;
  whatWorked?: string[];
  whatFailed?: string[];
  rootCauses?: string[];
  falseAssumptions?: string[];
  keyLearnings: string[];
  reusablePatterns?: string[];
  knowledgeGaps?: string[];
  followUpTasks?: string[];
  companySpecific?: boolean;
  sourceReferenceIds: string[];
  evaluationId: string;
  executionPlanId?: string;
  createdAt: string;
}

export interface SkillProposal {
  id: string;
  targetSkillId: string;
  scope: "company" | "core";
  currentProblem: string;
  proposedChange: string;
  diff?: string;
  rationale: string;
  relatedEpisodeIds: string[];
  expectedBenefits?: string[];
  expectedSideEffects?: string[];
  regressionPlan: string;
  requiresApproval: true;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: string;
}

/** Connector Interface — Core가 정의, Company Instance가 구현 */
export interface GBrainAdapter {
  queryEpisodes(query: {
    companyId: string;
    keywords: string[];
    maxResults?: number;
  }): Promise<ProjectEpisode[]>;

  saveEpisode(episode: ProjectEpisode): Promise<{ saved: boolean; id: string }>;
}

export interface DriveSearchResult extends SourceReference {
  contentPreview: string;
}

export interface GoogleDriveAdapter {
  searchDocuments(query: {
    keywords: string[];
    folderId?: string;
    maxResults?: number;
  }): Promise<DriveSearchResult[]>;

  // MVP는 read-only — 쓰기 메서드 없음
}
