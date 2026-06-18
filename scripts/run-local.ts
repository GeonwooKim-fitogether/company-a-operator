/**
 * Mock Vertical Slice 오케스트레이터
 *
 * 실제 인증 없이 Execute → Evaluate → Extract → Refine 전체 흐름을
 * 한 번 실행한다.
 *
 * 실행: npm run demo
 * 검증: npm run test   (--assert 플래그로 완료조건 검사)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MockGBrainAdapter } from "../adapters/gbrain/mock-gbrain-adapter.ts";
import { MockGoogleDriveAdapter } from "../adapters/google-drive/mock-drive-adapter.ts";
import type {
  ProjectBrief,
  ExecutionPlan,
  Evaluation,
  ProjectEpisode,
  SkillProposal,
  SourceReference,
  ProjectEpisode as Episode,
} from "../adapters/types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const OUTPUT_DIR = join(REPO_ROOT, "runtime", "outputs");

const RUBRIC_ID = "company-a-rubric";
const RUBRIC_WEIGHTS: Record<string, number> = {
  "objective-achievement": 0.25,
  "source-traceability": 0.2,
  "factual-accuracy": 0.2,
  completeness: 0.15,
  reusability: 0.1,
  "policy-compliance": 0.1,
};

function log(step: string, msg: string) {
  console.log(`[${step}] ${msg}`);
}

function writeOutput(name: string, data: unknown) {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(join(OUTPUT_DIR, name), JSON.stringify(data, null, 2), "utf-8");
}

function nowIso(): string {
  return new Date().toISOString();
}

function extractKeywords(brief: ProjectBrief): string[] {
  const text = [brief.title, brief.objective, ...brief.tags ?? []].join(" ");
  // 간단한 키워드 추출 — 실제로는 임베딩으로 교체 가능
  return ["웨어러블", "시장", "고객", "제품", ...brief.tags ?? []];
}

// ---------------------------------------------------------------------------
// EXECUTE
// ---------------------------------------------------------------------------
async function execute(
  brief: ProjectBrief,
  gbrain: MockGBrainAdapter,
  drive: MockGoogleDriveAdapter
): Promise<{ plan: ExecutionPlan; deliverable: string; sources: SourceReference[]; relatedEpisodes: Episode[] }> {
  log("EXECUTE", `목표 명확화: ${brief.objective}`);

  const keywords = extractKeywords(brief);

  // 과거 경험 조회
  const relatedEpisodes = await gbrain.queryEpisodes({
    companyId: brief.companyId,
    keywords,
    maxResults: 5,
  });
  log("EXECUTE", `GBrain에서 과거 Episode ${relatedEpisodes.length}개 조회`);

  // 원본 자료 조회
  const driveResults = await drive.searchDocuments({ keywords, maxResults: 5 });
  log("EXECUTE", `Google Drive에서 문서 ${driveResults.length}개 조회`);

  const sources: SourceReference[] = driveResults.map((r) => {
    const { contentPreview, ...ref } = r;
    return ref;
  });

  // 과거 Episode의 교훈을 계획에 반영
  const learnedPatterns = relatedEpisodes.flatMap((e) => e.reusablePatterns ?? []);
  const knownFailures = relatedEpisodes.flatMap((e) => e.whatFailed ?? []);

  const plan: ExecutionPlan = {
    id: `PLAN-${brief.id}`,
    projectId: brief.id,
    tasks: [
      {
        id: "T1",
        title: "시장 규모·경쟁사 현황 요약",
        description: "DRIVE-001 시장 보고서 기반 요약",
        status: "done",
        sourceIds: ["DRIVE-001"],
      },
      {
        id: "T2",
        title: "자사 제품 라인업 적합성 분석",
        description: "DRIVE-002 라인업과 시장 적합성 교차 분석",
        dependencies: ["T1"],
        status: "done",
        sourceIds: ["DRIVE-002"],
      },
      {
        id: "T3",
        title: "고객 피드백 기반 리스크 식별",
        description: "과거 Episode 교훈(고객 관점 초기 포함)을 반영해 DRIVE-003 피드백 분석",
        dependencies: ["T1"],
        status: "done",
        sourceIds: ["DRIVE-003"],
      },
    ],
    riskFlags: [
      "합성 데이터 기반 — 실제 시장 수치는 재검증 필요",
      ...(knownFailures.length > 0 ? [`과거 실패 패턴 주의: ${knownFailures[0]}`] : []),
    ],
    pendingDecisions: ["보고서를 외부에 공유할지 여부 (사람 승인 필요)"],
    relatedEpisodeIds: relatedEpisodes.map((e) => e.id),
    createdAt: nowIso(),
  };

  // 결과물 작성 (과거 교훈 반영: 고객 관점을 초기에 포함)
  const deliverable = [
    `# 신규 웨어러블 제품 시장 진입 검토 보고서 (내부 초안)`,
    ``,
    `## 1. 시장 현황`,
    `2025년 국내 웨어러블 시장은 전년 대비 12% 성장. 주요 플레이어 A사(35%), B사(22%), C사(15%). [출처: DRIVE-001]`,
    ``,
    `## 2. 자사 제품 적합성`,
    `자사 라인업은 보급·중간·프리미엄(3만~15만원)으로 구성. 스마트워치 성장세와 일치. [출처: DRIVE-002]`,
    ``,
    `## 3. 고객 피드백 기반 리스크 (과거 교훈 반영)`,
    `- 리스크 1: 고객은 배터리 수명과 앱 연동 안정성을 가장 중시 — 제품 기술 완성도 필요. [출처: DRIVE-003]`,
    `- 리스크 2: 시장 규모만으로 제품 적합성을 판단하면 과대평가 위험 (EP-001 교훈). [출처: EP-001]`,
    ``,
    `## 4. 결론`,
    `시장 성장성은 긍정적이나, 고객이 중시하는 제품 안정성 확보가 진입 전제조건이다.`,
  ].join("\n");

  return { plan, deliverable, sources, relatedEpisodes };
}

// ---------------------------------------------------------------------------
// EVALUATE (Executor와 독립된 로직)
// ---------------------------------------------------------------------------
function evaluate(
  brief: ProjectBrief,
  plan: ExecutionPlan,
  deliverable: string,
  sources: SourceReference[]
): Evaluation {
  log("EVALUATE", "독립 관점으로 결과 평가 시작");

  const findings: Evaluation["findings"] = [];

  // 완료조건 대조
  const criteriaMet = brief.completionCriteria.filter((c) => {
    if (c.includes("시장 규모")) return deliverable.includes("성장");
    if (c.includes("라인업")) return deliverable.includes("라인업");
    if (c.includes("리스크")) return (deliverable.match(/리스크 \d/g) ?? []).length >= 2;
    if (c.includes("출처")) return deliverable.includes("[출처:");
    return false;
  });
  const objectiveScore = Math.round((criteriaMet.length / brief.completionCriteria.length) * 5) || 1;
  if (criteriaMet.length < brief.completionCriteria.length) {
    findings.push({
      dimension: "objective-achievement",
      observation: `완료조건 ${brief.completionCriteria.length}개 중 ${criteriaMet.length}개 충족`,
      severity: "warning",
      revisionsRequired: brief.completionCriteria.filter((c) => !criteriaMet.includes(c)),
    });
  }

  // 출처 추적성
  const sourceCitations = (deliverable.match(/\[출처:/g) ?? []).length;
  const traceScore = sourceCitations >= 4 ? 5 : sourceCitations >= 2 ? 3 : 1;
  if (sources.length === 0) {
    findings.push({
      dimension: "source-traceability",
      observation: "Source Manifest가 비어있음",
      severity: "critical",
    });
  }

  // 정책 준수: 합성 데이터 명시 확인
  const policyScore = deliverable.includes("외부") && plan.pendingDecisions.some((d) => d.includes("승인"))
    ? 5
    : 4;

  const scores: Record<string, number> = {
    "objective-achievement": objectiveScore,
    "source-traceability": traceScore,
    "factual-accuracy": 4,
    completeness: criteriaMet.length === brief.completionCriteria.length ? 5 : 3,
    reusability: plan.relatedEpisodeIds && plan.relatedEpisodeIds.length > 0 ? 4 : 3,
    "policy-compliance": policyScore,
  };

  const overallScore = Math.round(
    Object.entries(scores).reduce((sum, [dim, s]) => sum + (s / 5) * (RUBRIC_WEIGHTS[dim] ?? 0), 0) * 100
  );

  let verdict: Evaluation["verdict"];
  if (overallScore >= 75 && policyScore >= 4) verdict = "pass";
  else if (overallScore >= 50) verdict = "revise";
  else verdict = "fail";

  log("EVALUATE", `verdict=${verdict}, score=${overallScore}`);

  return {
    id: `EVAL-${brief.id}`,
    projectId: brief.id,
    verdict,
    overallScore,
    scores,
    findings,
    uncertainties: ["합성 데이터 기반이므로 실제 시장 수치는 미검증"],
    rubricId: RUBRIC_ID,
    evaluatedAt: nowIso(),
  };
}

// ---------------------------------------------------------------------------
// EXTRACT
// ---------------------------------------------------------------------------
function extract(
  brief: ProjectBrief,
  plan: ExecutionPlan,
  evaluation: Evaluation,
  sources: SourceReference[],
  relatedEpisodes: Episode[]
): ProjectEpisode {
  log("EXTRACT", "Project Episode 생성");

  const reusedPast = relatedEpisodes.length > 0;

  const episode: ProjectEpisode = {
    id: `EP-${brief.id}`,
    projectId: brief.id,
    companyId: brief.companyId,
    title: brief.title,
    objective: brief.objective,
    outcome: evaluation.verdict === "pass" ? "success" : evaluation.verdict === "revise" ? "partial" : "failure",
    outcomeDetails: `Evaluation verdict=${evaluation.verdict}, score=${evaluation.overallScore}`,
    whatWorked: [
      "시장·제품·고객 3각 교차 구조로 보고서 작성",
      ...(reusedPast ? ["과거 Episode의 '고객 관점 초기 포함' 교훈을 실제 반영"] : []),
    ],
    whatFailed: evaluation.findings
      .filter((f) => f.severity !== "info")
      .map((f) => f.observation),
    rootCauses: evaluation.findings.filter((f) => f.severity === "critical").map((f) => f.dimension),
    falseAssumptions: [],
    keyLearnings: [
      "시장 분석은 고객 피드백을 초기 단계에 포함해야 과대평가를 피한다 (EP-001 재확인)",
      "합성 데이터 기반 보고서는 외부 공유 전 실제 수치 재검증이 필요하다",
    ],
    reusablePatterns: ["시장·경쟁사·고객 3각 교차 검토 프레임워크"],
    knowledgeGaps: evaluation.uncertainties ?? [],
    followUpTasks: plan.pendingDecisions,
    companySpecific: false,
    sourceReferenceIds: [...sources.map((s) => s.id), ...relatedEpisodes.map((e) => e.id)],
    evaluationId: evaluation.id,
    executionPlanId: plan.id,
    createdAt: nowIso(),
  };

  return episode;
}

// ---------------------------------------------------------------------------
// REFINE (제안만 — 직접 적용 금지)
// ---------------------------------------------------------------------------
function refine(episode: ProjectEpisode, relatedEpisodes: Episode[]): SkillProposal | null {
  log("REFINE", "Skill 개선안 가치 평가");

  // 채택 기준: 2개 이상 Episode에서 반복된 패턴인가
  const pattern = "시장 분석 시 고객 피드백을 초기 단계에 포함";
  const appearsInCurrent = episode.keyLearnings.some((l) => l.includes("고객 피드백"));
  const appearsInPast = relatedEpisodes.some((e) =>
    (e.keyLearnings ?? []).some((l) => l.includes("고객 피드백"))
  );

  if (!(appearsInCurrent && appearsInPast)) {
    log("REFINE", "반복 패턴 미확인 — Skill 개선안 생성하지 않음");
    return null;
  }

  const proposal: SkillProposal = {
    id: `PROP-${episode.projectId}`,
    targetSkillId: "run-project",
    scope: "core",
    currentProblem:
      "run-project Skill의 데이터 조회 단계가 시장 데이터를 우선하고 고객 관점 조회를 명시적으로 요구하지 않는다.",
    proposedChange:
      "4단계(Drive 원본 조회)에 '고객/수요 관점 소스를 반드시 포함한다'는 체크를 추가한다.",
    diff: [
      "  ### 4단계: Google Drive 원본 조회",
      "  - 승인된 폴더에서 관련 문서 검색",
      "+ - 시장/경쟁사 자료뿐 아니라 고객/수요 관점 소스를 반드시 포함한다 (EP-001, EP-PROJ-2026-001 교훈)",
      "  - Drive 파일 ID, URL, 수정시각을 Source Reference에 기록",
    ].join("\n"),
    rationale: `두 개 이상의 Episode(${[episode.id, ...relatedEpisodes.map((e) => e.id)].join(", ")})에서 고객 관점 누락이 반복 리스크로 확인됨.`,
    relatedEpisodeIds: [episode.id, ...relatedEpisodes.map((e) => e.id)],
    expectedBenefits: ["시장 분석 프로젝트의 과대평가 리스크 감소", "동일 실패 반복 방지"],
    expectedSideEffects: ["고객 데이터가 없는 경우 Knowledge Gap이 늘어날 수 있음"],
    regressionPlan: "evals/regression-cases/example-case.yaml를 실행해 기존 흐름이 유지되는지 확인",
    requiresApproval: true,
    approvalStatus: "pending",
    createdAt: nowIso(),
  };

  log("REFINE", `Skill 개선안 생성 (scope=${proposal.scope}, 승인 대기)`);
  return proposal;
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
async function main() {
  const assertMode = process.argv.includes("--assert");
  const briefPath = join(REPO_ROOT, "examples", "project-brief.json");
  const brief = JSON.parse(readFileSync(briefPath, "utf-8")) as ProjectBrief;

  console.log("=".repeat(70));
  console.log("Mock Vertical Slice: Execute → Evaluate → Extract → Refine");
  console.log("=".repeat(70));
  log("INPUT", `Project Brief: ${brief.title}`);

  const gbrain = new MockGBrainAdapter();
  const drive = new MockGoogleDriveAdapter();

  // EXECUTE
  const { plan, deliverable, sources, relatedEpisodes } = await execute(brief, gbrain, drive);
  writeOutput("execution-plan.json", plan);
  writeOutput("deliverable.md", deliverable);
  writeOutput("source-manifest.json", sources);

  // EVALUATE
  const evaluation = evaluate(brief, plan, deliverable, sources);
  writeOutput("evaluation.json", evaluation);

  // EXTRACT
  const episode = extract(brief, plan, evaluation, sources, relatedEpisodes);
  writeOutput("project-episode.json", episode);

  // REFINE
  const proposal = refine(episode, relatedEpisodes);
  if (proposal) writeOutput("skill-proposal.json", proposal);

  console.log("=".repeat(70));
  log("DONE", `출력 저장 위치: runtime/outputs/`);
  log("DONE", `verdict=${evaluation.verdict}, Episode=${episode.id}, Proposal=${proposal ? proposal.id : "없음"}`);

  if (assertMode) {
    const errors: string[] = [];
    if (plan.tasks.length === 0) errors.push("Execution Plan tasks가 비어있음");
    if (!["pass", "revise", "fail"].includes(evaluation.verdict)) errors.push("잘못된 verdict");
    if (Object.keys(evaluation.scores).length === 0) errors.push("scores가 비어있음");
    if (episode.keyLearnings.length === 0) errors.push("Episode keyLearnings가 비어있음");
    if (episode.sourceReferenceIds.length === 0) errors.push("Episode sourceReferenceIds가 비어있음");
    if (episode.evaluationId !== evaluation.id) errors.push("Episode와 Evaluation이 연결되지 않음");
    if (relatedEpisodes.length === 0) errors.push("과거 Episode 재사용 안 됨 (EP-001 조회 실패)");
    if (proposal && proposal.requiresApproval !== true) errors.push("Skill Proposal이 승인을 우회함");

    if (errors.length > 0) {
      console.error("\n❌ 검증 실패:");
      errors.forEach((e) => console.error(`  - ${e}`));
      process.exit(1);
    }
    console.log("\n✅ 모든 검증 항목 통과 (Execute→Evaluate→Extract→Refine 완료)");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
