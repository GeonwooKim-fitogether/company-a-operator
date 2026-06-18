/**
 * Mock GBrain Adapter
 * 실제 Supabase/GBrain 연결 없이 합성 Episode를 반환한다.
 * 실제 Adapter로 교체해도 인터페이스는 동일하다.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { GBrainAdapter, ProjectEpisode } from "../types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const EPISODES_DIR = join(REPO_ROOT, "brain", "episodes");
const RUNTIME_DIR = join(REPO_ROOT, "runtime", "outputs");

/**
 * brain/episodes/*.json 파일을 읽어 Mock 기억으로 사용한다.
 * Markdown Episode는 사람용, JSON Episode는 기계 조회용.
 */
function loadSeedEpisodes(): ProjectEpisode[] {
  if (!existsSync(EPISODES_DIR)) return [];
  const files = readdirSync(EPISODES_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => JSON.parse(readFileSync(join(EPISODES_DIR, f), "utf-8")) as ProjectEpisode);
}

export class MockGBrainAdapter implements GBrainAdapter {
  private episodes: ProjectEpisode[];

  constructor() {
    this.episodes = loadSeedEpisodes();
  }

  async queryEpisodes(query: {
    companyId: string;
    keywords: string[];
    maxResults?: number;
  }): Promise<ProjectEpisode[]> {
    const max = query.maxResults ?? 5;
    const kw = query.keywords.map((k) => k.toLowerCase());
    const scored = this.episodes
      .filter((e) => e.companyId === query.companyId)
      .map((e) => {
        const haystack = [
          e.title,
          e.objective ?? "",
          ...(e.keyLearnings ?? []),
          ...(e.reusablePatterns ?? []),
        ]
          .join(" ")
          .toLowerCase();
        const score = kw.filter((k) => haystack.includes(k)).length;
        return { e, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, max)
      .map((x) => x.e);
    return scored;
  }

  /**
   * Mock 저장은 runtime/outputs에 기록한다 (Git 제외).
   * 실제 GBrain에서는 Supabase insert로 교체된다.
   * 주의: 실제 운영에서는 사람 승인 후에만 호출되어야 한다.
   */
  async saveEpisode(episode: ProjectEpisode): Promise<{ saved: boolean; id: string }> {
    if (!existsSync(RUNTIME_DIR)) mkdirSync(RUNTIME_DIR, { recursive: true });
    const path = join(RUNTIME_DIR, `saved-episode-${episode.id}.json`);
    writeFileSync(path, JSON.stringify(episode, null, 2), "utf-8");
    return { saved: true, id: episode.id };
  }
}
