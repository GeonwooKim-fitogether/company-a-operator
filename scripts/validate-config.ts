/**
 * 설정 파일 유효성 검사
 * - 필수 설정 파일 존재 확인
 * - .env가 실수로 커밋되지 않았는지 확인
 * - JSON 예제 파일이 유효한지 확인
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const required = [
  "company.yaml",
  ".env.example",
  "config/connectors.example.yaml",
  "policies/approvals.yaml",
  "examples/project-brief.json",
  "brain/episodes/EP-001-market-analysis.json",
  "adapters/types.ts",
];

const errors: string[] = [];
const warnings: string[] = [];

for (const f of required) {
  if (!existsSync(join(ROOT, f))) errors.push(`필수 파일 누락: ${f}`);
}

// .env가 커밋되면 안 됨 (존재해도 경고만 — 로컬은 가능)
if (existsSync(join(ROOT, ".env"))) {
  warnings.push(".env 파일이 존재합니다. .gitignore에 포함되어 있는지 확인하세요.");
}

// JSON 예제 유효성
const jsonFiles = ["examples/project-brief.json", "brain/episodes/EP-001-market-analysis.json"];
for (const f of jsonFiles) {
  const p = join(ROOT, f);
  if (existsSync(p)) {
    try {
      JSON.parse(readFileSync(p, "utf-8"));
    } catch (e) {
      errors.push(`JSON 파싱 실패: ${f}`);
    }
  }
}

console.log("설정 검증 결과");
console.log("-".repeat(40));
if (warnings.length > 0) {
  warnings.forEach((w) => console.log(`⚠️  ${w}`));
}
if (errors.length > 0) {
  errors.forEach((e) => console.error(`❌ ${e}`));
  process.exit(1);
}
console.log("✅ 모든 필수 설정 파일이 유효합니다.");
