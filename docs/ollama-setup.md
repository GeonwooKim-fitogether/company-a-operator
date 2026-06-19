# Ollama 로컬 설치 가이드

> **목적**: GBrain 임베딩 제공자로 Ollama 로컬 모델을 사용하기 위한 설치 가이드  
> **결정 근거**: `docs/embedding-provider-decision.md` — `brain/` 기밀 데이터의 외부 전송을 막기 위해 로컬 선택

---

## 사전 조건

- 이 가이드를 실행할 컴퓨터가 GBrain이 동작하는 동안 켜져 있어야 한다
- macOS 또는 Linux 환경
- 인터넷 연결 (최초 모델 다운로드 시)

---

## 1단계: Ollama 설치

### macOS

```bash
# 방법 A: 공식 설치 스크립트 (권장)
curl -fsSL https://ollama.com/install.sh | sh

# 방법 B: Homebrew
brew install ollama
```

설치 확인:
```bash
ollama --version
# 출력 예시: ollama version 0.x.x
```

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

설치 후 서비스 시작:
```bash
sudo systemctl enable ollama
sudo systemctl start ollama
```

---

## 2단계: Ollama 서버 실행

macOS에서는 앱으로 설치 시 자동 시작된다. 수동으로 시작하려면:

```bash
# 포그라운드 실행 (터미널 창 유지)
ollama serve

# 또는 백그라운드 실행 (macOS)
brew services start ollama
```

서버가 켜졌는지 확인:
```bash
curl http://localhost:11434
# 출력: Ollama is running
```

---

## 3단계: 임베딩 모델 다운로드

```bash
# 권장 모델 (768차원, 빠름, 270MB)
ollama pull nomic-embed-text
```

다운로드 완료 후 확인:
```bash
ollama list
# 출력 예시:
# NAME                    ID              SIZE    MODIFIED
# nomic-embed-text:latest 0a109f422b47    274 MB  ...
```

---

## 4단계: 동작 확인

```bash
curl http://localhost:11434/api/embeddings \
  -H 'Content-Type: application/json' \
  -d '{"model": "nomic-embed-text", "prompt": "테스트"}'
```

정상 응답 예시:
```json
{
  "embedding": [0.1234, -0.5678, ...]
}
```

숫자 배열이 반환되면 정상이다.

---

## 5단계: .env 설정

project 루트의 `.env` 파일에 다음을 추가한다:

```bash
# GBrain 임베딩 설정
GBRAIN_EMBEDDING_PROVIDER=ollama
GBRAIN_EMBEDDING_MODEL=nomic-embed-text
GBRAIN_EMBEDDING_BASE_URL=http://localhost:11434
```

`.env` 파일이 없으면 `.env.example`을 복사해서 만든다:
```bash
cp .env.example .env
```

---

## 자주 발생하는 문제

### `curl: Failed to connect to localhost port 11434`

Ollama 서버가 꺼져 있다.
```bash
# macOS
brew services start ollama
# 또는
ollama serve
```

### `model not found`

모델이 아직 다운로드되지 않았다.
```bash
ollama pull nomic-embed-text
```

### macOS 재시작 후 Ollama가 꺼져 있음

자동 시작 설정:
```bash
brew services start ollama
```

또는 macOS 앱으로 설치한 경우 시스템 환경설정 > 일반 > 로그인 항목에서 Ollama 확인.

---

## 컴퓨터를 Ollama 서버로 사용할 때 주의사항

| 항목 | 내용 |
|---|---|
| **켜져 있어야 하는 시간** | GBrain이 새 문서를 임베딩할 때만 |
| **배터리** | 모델 추론 시 CPU/GPU 사용 — 충전 중 실행 권장 |
| **디스크 공간** | nomic-embed-text 약 270MB |
| **네트워크** | 로컬만 사용 — 외부 인터넷 전송 없음 |
| **포트** | 11434 (기본값, 변경 가능) |

---

## 다음 단계

Ollama 설치 완료 후 `docs/phase2-roadmap.md`의 단계 1을 체크하고 단계 2로 이동한다.
