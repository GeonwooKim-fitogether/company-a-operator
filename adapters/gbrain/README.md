# GBrain Adapter

## 역할

Core의 `GBrainAdapter` 인터페이스를 구현해 조직 장기 기억에 연결한다.

## 현재 제공 구현

- `mock-gbrain-adapter.ts`: 실제 연결 없이 `brain/episodes/*.json`을 읽어 Mock 기억으로 사용

## 실제 구현 교체 (Phase 2 이후)

실제 GBrain/Supabase 연결은 다음을 확인한 뒤 구현한다.

1. **GBrain 공식 인터페이스 확인** — 추측해서 구현하지 않는다.
2. Supabase 스키마 (episodes, decisions 테이블)
3. 임베딩 API 사용 시 비용과 데이터 전송 경로 문서화

인터페이스(`GBrainAdapter`)는 동일하므로, `MockGBrainAdapter`를 `SupabaseGBrainAdapter`로 교체하면 된다.

## 주의

- saveEpisode는 실제 운영에서 사람 승인 후에만 호출한다.
- GBrain은 Google Drive 원본을 저장하지 않는다 — 학습된 지식만 저장한다.
