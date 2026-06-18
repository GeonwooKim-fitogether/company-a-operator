# Core 와 Company Instance 경계

이 문서는 company-a-operator와 digital-operator-core의 경계를 설명한다.

## 한 줄 요약

- **Core**: 회사에 종속되지 않는 공통 능력 (Agent, Skill, Schema, 정책, 평가 Framework)
- **Company Instance (이 저장소)**: 회사 A의 기억·정책·권한·Connector 구현

## 무엇이 어디에 있는가

| 항목 | Core | Company A (이곳) |
|---|---|---|
| Agent 정의 | `agents/*.md` | 상속 (필요 시 `.claude/agents/`에 확장) |
| Skill 정의 | `skills/*/SKILL.md` | 상속 + `.claude/skills/company-specific/` |
| JSON Schema | `schemas/*.json` | TypeScript 타입으로 동기화 (`adapters/types.ts`) |
| 평가 Rubric | `evals/rubrics/default-rubric.yaml` | `evals/rubrics/company-a-rubric.yaml` (상속) |
| 승인 정책 | `policies/approval-policy.yaml` | `policies/approvals.yaml` (상속 + 추가) |
| Connector Interface | `adapters/types.ts` (개념) | `adapters/*/` 구현 |
| Project Episode | ❌ (있으면 안 됨) | `brain/episodes/` |
| 회사 기밀 | ❌ | `.env` (Git 제외) |

## 의존 방향

```
company-a-operator  ──implements──>  digital-operator-core
```

Company Instance는 Core를 참조하지만, Core는 Company Instance를 알지 못한다.
이 단방향 의존 덕분에 회사 B, C가 추가돼도 Core를 복사하지 않고 재사용한다.

## Mock vs 실제

Phase 1은 Mock Adapter로 동작한다. 인터페이스(`GBrainAdapter`, `GoogleDriveAdapter`)는 동일하므로, 실제 Connector로 교체해도 오케스트레이션 로직은 변하지 않는다.

## 공통 능력 승격

회사 A에서 검증된 패턴을 Core로 올릴 때는 `scope: core` Skill Proposal을 생성하고,
회사명·고객명·수치를 제거한 뒤 사람 승인을 거쳐 Core에 반영한다.
