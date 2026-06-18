# 운영 모델

## 워크플로우

```
사용자가 목표 입력
        ↓
  Claude Code (오케스트레이터)
        ↓
  [1] GBrain 과거 Episode 조회
  [2] Google Drive 관련 문서 조회
        ↓
  [3] Execution Plan 수립
        ↓
  [4] 작업 실행 + Source Manifest 기록
        ↓
  [5] 독립 Evaluation 실행
        ↓
  [6] Project Episode 생성
        ↓
  [7] Skill Proposal 생성
        ↓
  사람 검토 → (승인 시) Episode 저장 + Skill 반영
```

## 자동화 범위

| 단계 | 자동화 | 사람 개입 |
|---|---|---|
| 기억 조회 | ✅ | |
| 문서 조회 | ✅ | |
| 계획 수립 | ✅ | 검토 권장 |
| 결과물 작성 | ✅ | 최종 승인 |
| 평가 | ✅ | 검토 권장 |
| Episode 생성 | ✅ | 검토 후 저장 |
| Skill Proposal | ✅ (제안만) | 승인 필수 |
| Skill 반영 | ❌ | 직접 수정 |
| 외부 공유 | ❌ | 승인 필수 |

## Episode 재사용 원칙

모든 새 프로젝트는 시작 전 관련 Episode를 조회한다.
이전 프로젝트의 실패 패턴을 반복하지 않는다.
