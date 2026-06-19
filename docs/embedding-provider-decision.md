# 임베딩 제공자 결정 문서

> **상태**: Phase 2 연결 전 필수 검토 항목  
> **작성일**: 2026-06-18  
> **근거 정책**: `policies/data-access.yaml` — 회사 기밀을 외부 API로 전송하기 전에 사람 승인 필수

---

## 1. 필요 배경

GBrain은 `brain/` 폴더의 Markdown 문서를 Postgres+pgvector에 임베딩해 저장한다.  
임베딩 생성 시 텍스트를 임베딩 제공자 API로 전송하게 된다.

`brain/` 에는 회사 A의 의사결정 기록, Episode, Playbook이 저장되므로 **기밀 데이터**에 해당한다.

---

## 2. 제공자 옵션 비교

| 제공자 | 유형 | 비용 (1M tokens 기준) | 데이터 전송 경로 | 기밀성 위험 |
|---|---|---|---|---|
| **Ollama (로컬)** | 로컬 실행 | 인프라 비용만 (API 과금 없음) | 외부 전송 없음 | **없음** ✅ |
| OpenAI `text-embedding-3-small` | 외부 API | ~$0.02 | OpenAI 서버로 전송 | **있음** ⚠️ |
| OpenAI `text-embedding-3-large` | 외부 API | ~$0.13 | OpenAI 서버로 전송 | **있음** ⚠️ |
| Voyage AI `voyage-3-lite` | 외부 API | ~$0.02 | Voyage 서버로 전송 | **있음** ⚠️ |

---

## 3. 데이터 전송 경로 상세

### 로컬 Ollama (권장)
```
brain/*.md → GBrain → Ollama HTTP (localhost:11434) → 벡터 생성 → Supabase pgvector
                                   ↑
                          외부 네트워크 경유 없음
```

### 외부 API (OpenAI 예시)
```
brain/*.md → GBrain → OpenAI API (api.openai.com) → 벡터 생성 → Supabase pgvector
                              ↑
                     기밀 텍스트 외부 전송 ← 사람 승인 필요
```

---

## 4. 비용 추산 (회사 A 초기)

- `brain/` 초기 문서량: ~100 Markdown 파일, 파일당 평균 1,000 tokens → **약 100K tokens**
- 월 업데이트 추가량: ~10K tokens
- Ollama 로컬 사용 시: **API 과금 0원** (서버 인프라 비용만)
- OpenAI 사용 시: 초기 ~$0.002, 월 ~$0.0002 (소액이나 기밀 전송 문제 있음)

---

## 5. 권장 결정

**Phase 2 초기: Ollama 로컬 임베딩 사용**

이유:
1. 회사 기밀 텍스트가 외부로 나가지 않는다
2. `policies/data-access.yaml` 위반 없이 사람 승인 절차 없이 연결 가능
3. 비용 0원
4. 권장 모델: `nomic-embed-text` (768dim, 빠름)

**외부 제공자로 전환 조건:**
- 로컬 인프라 운영이 불가한 경우
- 그 경우 이 문서에 추가 기록 + **사람 승인**을 받은 뒤 전환한다

---

## 6. 설치 방법

자세한 설치 가이드: `docs/ollama-setup.md`

```bash
# 빠른 확인
ollama pull nomic-embed-text
curl http://localhost:11434/api/embeddings \
  -d '{"model": "nomic-embed-text", "prompt": "test"}'
```

---

## 7. 승인 기록

| 항목 | 내용 |
|---|---|
| 결정 | Ollama 로컬 임베딩 사용 |
| 외부 전송 여부 | 없음 |
| 사람 승인 필요 | 불필요 (외부 전송 없으므로) |
| 외부 전환 시 승인 | 필수 (이 문서에 기록) |
