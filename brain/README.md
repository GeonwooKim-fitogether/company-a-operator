# brain/ — 회사 A 조직 기억

이 폴더는 회사 A의 프로젝트 경험과 판단을 기록한다.

## 원칙

- **Google Drive 원본을 복사하지 않는다.** 원본은 Drive가 Source of Truth다.
- 여기에는 조직의 판단과 경험만 기록한다: 결정, 근거, 관련 프로젝트, 결과, Drive 참조, 신뢰도, 재검토 조건.
- 실제 GBrain 연결 후 이 폴더의 역할을 재검토한다.

## 구조

```
brain/
├─ projects/         # 프로젝트별 요약
├─ decisions/        # 의사결정 기록
├─ episodes/         # Project Episode (JSON = 기계 조회용, MD = 사람용)
├─ playbooks/        # 검증된 재사용 절차
└─ source-manifests/ # 프로젝트별 Source 목록
```

## Episode 파일 형식

- `*.json`: `project-episode.schema.json` 준수. Mock GBrain Adapter가 조회한다.
- `*.md`: 사람이 읽는 요약 (`examples/episode-example.md` 참고)

## 주의

- `episodes/`의 승인된 Episode는 `.claude/settings.json`에서 쓰기 제한된다 — 사람 검토 후 수정.
