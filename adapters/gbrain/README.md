# GBrain Adapter

## 역할

Core의 `GBrainAdapter` 인터페이스를 구현해 조직 장기 기억에 연결한다.

## 현재 제공 구현

- `mock-gbrain-adapter.ts`: 실제 연결 없이 `brain/episodes/*.json`을 읽어 Mock 기억으로 사용

## 실제 GBrain 연결 (Phase 2)

> 조사 근거: [garrytan/gbrain](https://github.com/garrytan/gbrain) 공식 문서 (2026-06).  
> 자세한 결정은 `../digital-operator-core/docs/adr/ADR-002-gbrain-integration.md` 참고.

GBrain은 Markdown-first 장기 기억 엔진이며, **HTTP MCP 서버**로 Claude Code에 직접 도구를 노출한다.
따라서 커스텀 REST adapter 대신 **MCP 직접 연결**을 우선한다 (이 TS adapter는 Mock·테스트용으로 유지).

### 연결 절차 (예정)

```bash
# 1. GBrain 설치 (버전 고정 필요 — ~v0.30 breaking change 있음)
bun install -g github:garrytan/gbrain

# 2. brain/ 를 source로 등록, Supabase로 마이그레이션
gbrain sources add company-a --path ./brain
gbrain migrate --to supabase     # 공유·다중 환경
gbrain sync --all

# 3. HTTP MCP 서버 기동 (OAuth 2.1)
gbrain serve --http --port 3131 --public-url https://brain.company-a.example

# 4. 회사 A scope OAuth 클라이언트 등록
gbrain auth register-client company-a --scopes read,write --source company-a

# 5. Claude Code에 MCP 연결 (.mcp.json 또는 gbrain connect)
gbrain connect https://brain.company-a.example/mcp --token gbrain_xxx --install
```

### 인터페이스 매핑

| `GBrainAdapter` 메서드 | 실제 GBrain MCP tool |
|---|---|
| `queryEpisodes()` | `gbrain search` / `gbrain think` (read scope, LLM 비용 없는 hybrid 검색) |
| `saveEpisode()` | `gbrain capture` / `put_page` (**write scope — 사람 승인 후에만**) |

### 비용 경고

GBrain은 임베딩 제공자가 필요하다 (ZeroEntropy/OpenAI/Voyage/**Ollama 로컬**).
회사 기밀을 외부 임베딩 API로 보내면 `policies/data-access.yaml`에 따라 **사람 승인 필수**이다.
기밀 데이터는 로컬 임베딩(Ollama)을 우선 검토하고, 임베딩 제공자·비용·전송 경로를 연결 전 문서화한다.

### 주의

- GBrain은 SQL 계층에서 cross-source read를 거부한다 — 회사별 격리가 DB로 강제된다. 프롬프트만으로 격리하지 않는다.
- saveEpisode는 실제 운영에서 사람 승인 후에만 호출한다.
- 설치 버전을 고정하고 실제 노출된 MCP tool 이름을 확인한 뒤 구현한다 (추측 금지).
