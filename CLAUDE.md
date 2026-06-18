# CLAUDE.md — company-a-operator

이 파일은 Claude Code가 이 저장소에서 작업할 때 따라야 하는 규칙이다.

## 이 저장소의 역할

회사 A에 배치된 디지털 운영자의 구체적인 업무 환경이다.
공통 능력은 [digital-operator-core](../digital-operator-core)에서 가져오고, 이 저장소는 회사 A 전용 설정·기억·정책·Connector를 담는다.

## 사용자 인터페이스 원칙

**사용자가 상대하는 창구는 Claude Code 하나다.**
Claude Code는 내부적으로 GBrain, Google Drive, 필요한 Agent를 알아서 사용해야 한다.
사용자는 "무슨 목표를 달성할지"에만 집중한다.

## 절대 하지 않을 것

- 회사 A의 기밀을 Core 저장소나 다른 회사 인스턴스로 이동하지 않는다.
- Supabase Secret, Google OAuth, API Key를 커밋하지 않는다.
- `.env`를 커밋하지 않는다 — `.env.example`만 커밋한다.
- `runtime/` 폴더를 커밋하지 않는다.
- `brain/` 폴더에 Google Drive 원본 전체를 복사하지 않는다.
- 운영 Skill을 사람 승인 없이 수정하지 않는다.
- GBrain 명령을 공식 문서 확인 없이 추측해 구현하지 않는다.

## 작업 흐름

목표를 받으면 다음 순서로 처리한다.

1. **기억 조회**: GBrain에서 관련 과거 Episode 조회
2. **원본 확인**: Google Drive에서 관련 문서 조회
3. **계획 수립**: Execution Plan 작성
4. **실행**: 결과물 작성 + Source Manifest 기록
5. **평가**: 독립 관점으로 결과 평가
6. **추출**: Project Episode 생성
7. **제안**: Skill 개선안 생성 (직접 적용 안 함)

## 사람 승인이 필요한 작업

`../digital-operator-core/policies/approval-policy.yaml`을 따른다.
추가로 회사 A 정책은 `policies/approvals.yaml`을 참고한다.

## brain/ 폴더 사용 규칙

- Google Drive 원본 전체를 복사하지 않는다.
- 다음만 기록한다: 결정, 근거, 관련 프로젝트, 결과, Drive 참조, 신뢰도, 재검토 조건
- 실제 GBrain 연결 후 이 폴더의 역할을 재검토한다.

## Mock vs 실제 Connector

현재 Phase 1에서는 Mock Adapter를 사용한다.
실제 연결은 `config/connectors.example.yaml`을 `.env`에 맞게 설정 후 Adapter 교체로 전환한다.
