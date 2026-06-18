# Google Drive Adapter

## 역할

Core의 `GoogleDriveAdapter` 인터페이스를 구현해 회사 원본 자료에 read-only로 연결한다.

## 현재 제공 구현

- `mock-drive-adapter.ts`: `mock-drive-fixtures.json`의 합성 문서를 반환
- 모든 fixture는 `[합성 데이터]`로 표시되며 실제 회사 정보가 아니다.

## 실제 구현 교체 (Phase 2 이후)

1. Google OAuth 2.0 (refresh token 기반)
2. Drive API v3 files.list / files.get (read-only scope)
3. 승인된 폴더만 접근 (`policies/data-access.yaml` approved_folders)
4. 원본을 복사하지 않고 SourceReference 메타데이터만 보존

## 주의

- MVP는 read-only. 쓰기 메서드는 제공하지 않는다.
- Drive 전체를 색인하지 않고, 필요한 문서만 조회한다.
- driveFileId, driveUrl, modifiedAt를 SourceReference에 반드시 보존한다.
