/**
 * GBrain HTTP MCP Adapter (Phase 2 스켈레톤)
 *
 * ADR-002 결정: 커스텀 REST 대신 GBrain HTTP MCP에 직접 연결.
 * 이 파일은 실제 gbrain serve --http 인스턴스가 준비된 뒤 완성한다.
 *
 * 사용 전 체크리스트:
 *   [ ] gbrain serve --http 기동 확인
 *   [ ] 실제 노출된 MCP tool 이름 확인 (gbrain tools 명령으로)
 *   [ ] OAuth 토큰 발급 완료
 *   [ ] docs/embedding-provider-decision.md 검토 완료
 *   [ ] GBRAIN_MCP_URL, GBRAIN_TOKEN 환경변수 설정
 */

import type { GBrainAdapter } from '../types.js';
import type { ProjectEpisode } from '../types.js';

interface GBrainMCPConfig {
  mcpUrl: string;    // e.g. http://localhost:3131/mcp
  token: string;     // OAuth token — .env에서 주입, 절대 커밋 금지
  companyId: string;
  timeoutMs?: number;
}

interface MCPToolCallRequest {
  tool: string;
  input: Record<string, unknown>;
}

interface MCPToolCallResponse {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
}

/**
 * GBrain HTTP MCP 서버에 직접 연결하는 프로덕션 어댑터.
 * Mock 어댑터와 동일한 GBrainAdapter 인터페이스를 구현한다.
 *
 * TODO: gbrain serve 기동 후 실제 tool 이름을 확인하고 아래 상수를 업데이트할 것.
 * 추측으로 구현하지 않는다 (CLAUDE.md 규칙).
 */
export class GBrainMCPAdapter implements GBrainAdapter {
  private readonly config: GBrainMCPConfig;

  // TODO: 실제 gbrain tools 명령으로 확인 후 업데이트
  private static readonly TOOL_SEARCH = 'TODO_VERIFY_SEARCH_TOOL_NAME';
  private static readonly TOOL_CAPTURE = 'TODO_VERIFY_CAPTURE_TOOL_NAME';

  constructor(config: GBrainMCPConfig) {
    if (!config.mcpUrl || !config.token) {
      throw new Error('GBrainMCPAdapter: mcpUrl and token are required. Set GBRAIN_MCP_URL and GBRAIN_TOKEN in .env');
    }
    this.config = config;
  }

  static fromEnv(): GBrainMCPAdapter {
    const mcpUrl = process.env.GBRAIN_MCP_URL;
    const token = process.env.GBRAIN_TOKEN;
    const companyId = process.env.COMPANY_ID ?? 'company-a';

    if (!mcpUrl || !token) {
      throw new Error(
        'GBrainMCPAdapter.fromEnv(): GBRAIN_MCP_URL and GBRAIN_TOKEN must be set in .env\n' +
        'See .env.example and docs/embedding-provider-decision.md'
      );
    }

    return new GBrainMCPAdapter({ mcpUrl, token, companyId });
  }

  async queryEpisodes(query: {
    companyId: string;
    keywords: string[];
    maxResults?: number;
  }): Promise<ProjectEpisode[]> {
    if (query.companyId !== this.config.companyId) {
      throw new Error(`Cross-company query denied: expected ${this.config.companyId}, got ${query.companyId}`);
    }

    // TODO: GBrain tool 이름 확인 후 구현
    // GBrain은 SQL 계층에서 source scope을 강제하므로 별도 필터 불필요
    const _response = await this.callMCPTool({
      tool: GBrainMCPAdapter.TOOL_SEARCH,
      input: {
        query: query.keywords.join(' '),
        limit: query.maxResults ?? 5,
        // source scope은 OAuth token에 바인딩됨 — 추가 필터 없음
      },
    });

    // TODO: GBrain 응답 형식 확인 후 ProjectEpisode 변환 구현
    throw new Error(
      'GBrainMCPAdapter.queryEpisodes(): NOT IMPLEMENTED\n' +
      'GBrain tool name and response format must be verified before implementation.\n' +
      'Run: gbrain tools  (after gbrain serve --http)'
    );
  }

  async saveEpisode(episode: ProjectEpisode): Promise<{ saved: boolean; id: string }> {
    // 이 메서드는 반드시 사람 승인 후에만 호출된다 (policies/approvals.yaml)
    if (!episode.evaluationId) {
      throw new Error('saveEpisode: evaluationId is required before saving to GBrain');
    }
    if (episode.companyId !== this.config.companyId) {
      throw new Error(`Cross-company save denied: expected ${this.config.companyId}, got ${episode.companyId}`);
    }

    // TODO: GBrain tool 이름 확인 후 구현
    const _response = await this.callMCPTool({
      tool: GBrainMCPAdapter.TOOL_CAPTURE,
      input: {
        // TODO: GBrain 입력 형식 확인 후 매핑
        title: episode.id,
        content: JSON.stringify(episode, null, 2),
      },
    });

    // TODO: 응답에서 실제 저장된 ID 추출
    throw new Error(
      'GBrainMCPAdapter.saveEpisode(): NOT IMPLEMENTED\n' +
      'Verify gbrain capture tool name and input format first.'
    );
  }

  private async callMCPTool(request: MCPToolCallRequest): Promise<MCPToolCallResponse> {
    const url = `${this.config.mcpUrl}/tools/call`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.token}`,
      },
      body: JSON.stringify({
        name: request.tool,
        arguments: request.input,
      }),
      signal: AbortSignal.timeout(this.config.timeoutMs ?? 30_000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`GBrain MCP call failed: ${response.status} ${response.statusText}\n${body}`);
    }

    return response.json() as Promise<MCPToolCallResponse>;
  }
}
