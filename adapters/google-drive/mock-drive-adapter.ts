/**
 * Mock Google Drive Adapter
 * 실제 OAuth 없이 합성 문서를 반환한다 (read-only).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { GoogleDriveAdapter, DriveSearchResult } from "../types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const FIXTURES = join(REPO_ROOT, "adapters", "google-drive", "mock-drive-fixtures.json");

interface MockDriveDoc extends DriveSearchResult {
  keywords: string[];
}

function loadFixtures(): MockDriveDoc[] {
  if (!existsSync(FIXTURES)) return [];
  return JSON.parse(readFileSync(FIXTURES, "utf-8")) as MockDriveDoc[];
}

export class MockGoogleDriveAdapter implements GoogleDriveAdapter {
  private docs: MockDriveDoc[];

  constructor() {
    this.docs = loadFixtures();
  }

  async searchDocuments(query: {
    keywords: string[];
    folderId?: string;
    maxResults?: number;
  }): Promise<DriveSearchResult[]> {
    const max = query.maxResults ?? 5;
    const kw = query.keywords.map((k) => k.toLowerCase());
    return this.docs
      .map((d) => {
        const docKw = d.keywords.map((k) => k.toLowerCase());
        const score = kw.filter((k) => docKw.some((dk) => dk.includes(k) || k.includes(dk))).length;
        return { d, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, max)
      .map(({ d }) => {
        // keywords는 내부 메타 — SourceReference에는 포함하지 않는다
        const { keywords, ...ref } = d;
        return ref;
      });
  }
}
