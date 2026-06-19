# Phase 2 로드맵: 실제 GBrain/Supabase 연결

> **상태**: 진행 중  
> **시작일**: 2026-06-18  
> **Phase 1 완료**: Mock Vertical Slice 전체 루프 증명 완료

---

## 목표

Mock 어댑터를 실제 GBrain HTTP MCP + Supabase로 교체해
실제 조직 기억이 쌓이는 시스템을 만든다.

---

## 단계 1: 임베딩 제공자 결정 및 Ollama 설치 (연결 전 필수)

- [ ] `docs/embedding-provider-decision.md` 검토
- [ ] **Ollama 로컬 임베딩 설치** — `docs/ollama-setup.md` 따라서
- [ ] `ollama pull nomic-embed-text` 완료
- [ ] `curl http://localhost:11434` → `Ollama is running` 확인
- [ ] `.env`에 `GBRAIN_EMBEDDING_PROVIDER=ollama` 설정

## 단계 2: GBrain 연결 준비

- [ ] GBrain 버전 고정: `bun install -g github:garrytan/gbrain@<커밋 SHA>`
- [ ] `brain/` 를 GBrain source로 등록: `gbrain sources add company-a --path ./brain`
- [ ] Supabase 프로젝트 생성 + pgvector 확장 활성화
- [ ] GBrain 마이그레이션: `gbrain migrate --to supabase`
- [ ] 동기화 확인: `gbrain sync --all`

## 단계 3: HTTP MCP 서버 기동

- [ ] `gbrain serve --http --port 3131` 기동
- [ ] **실제 노출된 MCP tool 이름 확인**: `gbrain tools` (또는 `/mcp/tools/list`)
- [ ] `adapters/gbrain/gbrain-mcp-adapter.ts` 내 TODO 상수 업데이트
- [ ] `.env` 설정: `GBRAIN_MCP_URL=http://localhost:3131/mcp`, `GBRAIN_TOKEN`

## 단계 4: 회사 A OAuth 등록

- [ ] `gbrain auth register-client company-a --scopes read,write --source company-a`
- [ ] SQL 계층 격리 확인: 회사 A OAuth 토큰으로 다른 회사 데이터 접근 안 되는지 테스트

## 단계 5: Claude Code MCP 연결

- [ ] `gbrain connect http://localhost:3131/mcp --token gbrain_xxx --install`
- [ ] `.mcp.json` 또는 `.claude/settings.json`에 GBrain MCP 서버 등록
- [ ] 통합 테스트: Mock 데이터로 `npm test` (통과 필수)

## 단계 6: Mock 어댑터 교체

- [ ] `config/connectors.example.yaml`: `adapter: gbrain-mcp`로 전환
- [ ] `scripts/run-local.ts`: `USE_MOCK_ADAPTERS=false` 시 `GBrainMCPAdapter.fromEnv()` 사용
- [ ] `npm test` (실제 GBrain 연결 + `USE_MOCK_ADAPTERS=false`) 통과

## 단계 7: Google Drive 연결 (GBrain 이후)

- [ ] Google Cloud 프로젝트 생성, OAuth 2.0 클라이언트 생성
- [ ] 승인된 폴더 ID `config/connectors.example.yaml`에 등록
- [ ] `adapters/google-drive/`에 `OAuthDriveAdapter` 구현 (읽기 전용)
- [ ] `npm test` (실제 Drive + `USE_MOCK_ADAPTERS=false`) 통과

---

## 완료 조건

- `npm test` (`USE_MOCK_ADAPTERS=false`) 통과
- GBrain에 저장된 Episode를 `gbrain search`로 조회 성공
- Cross-company 접근 거부 로그 확인
- `docs/embedding-provider-decision.md` 검토 완료
