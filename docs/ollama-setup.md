# Ollama 로컬 설치 가이드 (Windows)

> **목적**: GBrain 임베딩 제공자로 Ollama 로컬 모델을 사용하기 위한 설치 가이드
> **결정 근거**: `docs/embedding-provider-decision.md` — `brain/` 기밀 데이터의 외부 전송을 막기 위해 로컬 선택
> **대상 환경**: Windows 10 / 11 (이 컴퓨터 기준)

---

## 사전 조건

- 이 컴퓨터가 GBrain이 동작하는 동안 켜져 있어야 한다
- Windows 10 (1809 이상) 또는 Windows 11
- 인터넷 연결 (최초 설치 + 모델 다운로드 시)
- 약 1GB 여유 디스크 공간

---

## 1단계: Ollama 설치

### 방법 A: 공식 설치 프로그램 (권장)

1. 브라우저에서 https://ollama.com/download/windows 접속
2. `OllamaSetup.exe` 다운로드
3. 다운로드한 파일을 실행하고 설치 마법사를 따라간다
4. 설치가 끝나면 Ollama가 자동으로 시작되고 시스템 트레이(작업 표시줄 오른쪽 아래)에 아이콘이 나타난다

### 방법 B: winget (명령줄)

PowerShell 또는 명령 프롬프트에서:
```powershell
winget install Ollama.Ollama
```

### 설치 확인

PowerShell을 열고:
```powershell
ollama --version
# 출력 예시: ollama version is 0.x.x
```

> `ollama` 명령을 찾을 수 없다고 나오면, PowerShell 창을 닫았다가 다시 열어본다 (PATH 갱신 필요).

---

## 2단계: Ollama 서버 확인

Windows 설치 프로그램으로 설치하면 Ollama 서버가 **자동으로 백그라운드에서 실행**된다 (트레이 아이콘 확인).

서버가 켜졌는지 확인:
```powershell
curl http://localhost:11434
# 출력: Ollama is running
```

> `curl`이 없다는 오류가 나오면 PowerShell에서 다음을 사용한다:
> ```powershell
> Invoke-RestMethod http://localhost:11434
> ```

서버가 꺼져 있으면 시작 메뉴에서 **Ollama**를 검색해 실행한다.

---

## 3단계: 임베딩 모델 다운로드

PowerShell에서:
```powershell
# 권장 모델 (768차원, 빠름, 약 270MB)
ollama pull nomic-embed-text
```

다운로드 완료 후 확인:
```powershell
ollama list
# 출력 예시:
# NAME                    ID              SIZE    MODIFIED
# nomic-embed-text:latest 0a109f422b47    274 MB  ...
```

---

## 4단계: 동작 확인

PowerShell에서 (`Invoke-RestMethod` 사용 권장):
```powershell
Invoke-RestMethod -Uri http://localhost:11434/api/embeddings `
  -Method Post `
  -ContentType 'application/json' `
  -Body '{"model": "nomic-embed-text", "prompt": "테스트"}'
```

또는 `curl`이 있으면:
```powershell
curl http://localhost:11434/api/embeddings -H "Content-Type: application/json" -d "{\"model\": \"nomic-embed-text\", \"prompt\": \"test\"}"
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

프로젝트 루트의 `.env` 파일에 다음을 추가한다:

```bash
# GBrain 임베딩 설정
GBRAIN_EMBEDDING_PROVIDER=ollama
GBRAIN_EMBEDDING_MODEL=nomic-embed-text
GBRAIN_EMBEDDING_BASE_URL=http://localhost:11434
```

`.env` 파일이 없으면 `.env.example`을 복사해서 만든다:
```powershell
copy .env.example .env
```

---

## 자주 발생하는 문제

### `Failed to connect to localhost port 11434` / `연결할 수 없음`

Ollama 서버가 꺼져 있다. 시작 메뉴에서 **Ollama**를 검색해 실행하면 트레이 아이콘이 나타난다.

### `ollama` 명령을 찾을 수 없음

PowerShell/명령 프롬프트 창을 닫았다가 다시 연다 (설치 후 PATH 갱신이 필요).

### `model not found`

모델이 아직 다운로드되지 않았다.
```powershell
ollama pull nomic-embed-text
```

### 컴퓨터 재시작 후 Ollama가 꺼져 있음

Windows 설치 프로그램은 기본적으로 로그인 시 자동 시작되도록 설정한다.
자동 시작이 안 되면: 시작 메뉴 → **시작 프로그램** 설정에서 Ollama를 켠다.
(또는 `Win + R` → `shell:startup` 폴더에 Ollama 바로가기 추가)

### GPU 가속

NVIDIA GPU가 있으면 Ollama가 자동으로 사용한다. CPU만 있어도 `nomic-embed-text`처럼 작은 임베딩 모델은 충분히 빠르게 동작한다.

---

## 이 컴퓨터를 Ollama 서버로 사용할 때 주의사항

| 항목 | 내용 |
|---|---|
| **켜져 있어야 하는 시간** | GBrain이 새 문서를 임베딩할 때만 |
| **전원/절전** | 절전 모드 진입 시 서버 응답 안 됨 — 임베딩 작업 중에는 절전 해제 권장 |
| **디스크 공간** | nomic-embed-text 약 270MB |
| **네트워크** | 로컬(localhost)만 사용 — 외부 인터넷 전송 없음 |
| **포트** | 11434 (기본값) |
| **방화벽** | localhost 통신이므로 별도 방화벽 설정 불필요 |

---

## 다음 단계

Ollama 설치 완료 후 `docs/phase2-roadmap.md`의 단계 1을 체크하고 단계 2(GBrain 버전 고정)로 이동한다.
