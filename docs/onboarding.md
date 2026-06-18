# 온보딩 가이드

## 사전 요구사항

- Node.js 18+
- npm 9+
- Claude Code CLI
- Git

## Phase 1 (Mock) 시작

```bash
# 1. 저장소 클론
git clone https://github.com/geonwookim-fitogether/company-a-operator.git
cd company-a-operator

# 2. 의존성 설치
npm install

# 3. Mock Vertical Slice 실행 (실제 인증 불필요)
npm run demo
```

## 실제 Connector 연결 (Phase 2 이후)

```bash
# 1. .env.example을 .env로 복사
cp .env.example .env

# 2. .env에 실제 값 입력 (GBrain API, Google OAuth 등)

# 3. config/connectors.example.yaml에서 adapter를 mock에서 실제로 변경
# adapter: mock → adapter: gbrain-api (GBrain)
# adapter: mock → adapter: oauth (Google Drive)

# 4. 설정 검증
npm run validate
```

## 주요 파일 위치

| 목적 | 파일 |
|---|---|
| 회사 기본 설정 | `company.yaml` |
| 승인 정책 | `policies/approvals.yaml` |
| Connector 설정 | `config/connectors.example.yaml` |
| 예제 Project Brief | `examples/project-brief.json` |
| Mock 실행 | `scripts/run-local.ts` |
| 과거 Episode | `brain/episodes/` |

## 문제 해결

- `runtime/` 폴더가 없으면 `npm run demo` 실행 시 자동 생성된다.
- `.env` 파일이 없으면 Mock 모드로 실행된다.
- GBrain 연결 오류는 `config/connectors.example.yaml`의 adapter 설정을 확인한다.
