# company-a-operator

회사 A에 배치되는 디지털 운영자의 구체적인 업무 환경.

[digital-operator-core](../digital-operator-core)의 공통 능력을 기반으로, 회사 A의 목표·정책·기억·Connector를 제공한다.

## 이 저장소의 역할

- 회사 A의 목표, 역할, KPI 정의
- 회사 전용 Skill과 평가 기준
- GBrain 및 Google Drive Connector 설정
- 프로젝트 경험(Episode) 관리 구조
- Core와 결합되는 회사별 Extension

## 구조

```
company-a-operator/
├─ .claude/             # Claude Code 설정 및 회사 전용 Agent·Rule·Skill
├─ config/              # Connector·Memory·Runtime 설정 예시
├─ policies/            # 회사별 승인·접근·리스크·보존 정책
├─ evals/               # 회사 KPI, 평가 Rubric, 회귀 사례
├─ brain/               # 프로젝트 경험, 의사결정, Episode, Playbook
├─ adapters/            # GBrain·Google Drive Connector 구현
├─ docs/                # 회사 컨텍스트, 운영 모델, 온보딩
├─ scripts/             # 설정 검증, 로컬 실행 스크립트
├─ examples/            # 예제 Project Brief 및 기대 출력
└─ runtime/             # Git 제외 — 실행 중 생성 파일
```

## 빠른 시작

```bash
npm install
npm run demo          # Mock Vertical Slice 실행 (인증 불필요)
npm run validate      # 설정 파일 유효성 검사
```

## Core와의 관계

이 저장소는 `digital-operator-core`를 Fork하지 않는다.
Core의 Connector Interface를 구현해 회사 A에 특화된 환경을 제공한다.

## 관련 문서

- [회사 컨텍스트](docs/company-context.md)
- [운영 모델](docs/operating-model.md)
- [온보딩 가이드](docs/onboarding.md)
- [Core 저장소](https://github.com/geonwookim-fitogether/digital-operator-core)
