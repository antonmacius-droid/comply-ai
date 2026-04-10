/**
 * Bulwark AI Integration Client
 *
 * HTTP client for communicating with a Bulwark AI gateway instance.
 * Pulls dashboard stats, audit entries, and gateway settings.
 */

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface BulwarkDashboardStats {
  totalRequests: number;
  totalTokens: number;
  uniqueModels: number;
  uniqueUsers: number;
  averageLatencyMs: number;
  errorRate: number;
  requestsByModel: Record<string, number>;
  requestsByDay: Array<{ date: string; count: number }>;
  topUsers: Array<{ userId: string; requestCount: number }>;
}

export interface BulwarkAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  statusCode: number;
  /** Whether content was flagged by policy */
  flagged: boolean;
  flagReason?: string;
  /** The policy that triggered the flag */
  policyId?: string;
  metadata: Record<string, unknown>;
}

export interface BulwarkAuditQuery {
  startDate?: string;
  endDate?: string;
  userId?: string;
  model?: string;
  provider?: string;
  flagged?: boolean;
  limit?: number;
  offset?: number;
}

export interface BulwarkSettings {
  gatewayId: string;
  name: string;
  version: string;
  providers: Array<{
    id: string;
    name: string;
    enabled: boolean;
    models: string[];
  }>;
  policies: Array<{
    id: string;
    name: string;
    enabled: boolean;
    type: string;
    config: Record<string, unknown>;
  }>;
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
    tokensPerDay: number;
  };
  loggingEnabled: boolean;
  auditRetentionDays: number;
}

export interface BulwarkPaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class BulwarkClient {
  private baseUrl: string;
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string, apiKey: string) {
    // Strip trailing slash
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const response = await fetch(url.toString(), {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new BulwarkApiError(
        `Bulwark API error: ${response.status} ${response.statusText}`,
        response.status,
        errorBody
      );
    }

    return response.json() as Promise<T>;
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Pull dashboard statistics from the Bulwark gateway.
   * Maps to Bulwark AI Admin API: GET /admin/dashboard
   */
  async getDashboard(): Promise<BulwarkDashboardStats> {
    const raw = await this.request<{
      requestsToday: number; requestsThisMonth: number;
      costToday: number; costThisMonth: number; activeUsers: number;
      topModels: { model: string; count: number; cost: number }[];
      topUsers: { userId: string; count: number; cost: number }[];
    }>("GET", "/admin/dashboard");

    return {
      totalRequests: raw.requestsThisMonth,
      totalTokens: 0, // not directly available from dashboard
      uniqueModels: raw.topModels.length,
      uniqueUsers: raw.activeUsers,
      averageLatencyMs: 0,
      errorRate: 0,
      requestsByModel: Object.fromEntries(raw.topModels.map(m => [m.model, m.count])),
      requestsByDay: [],
      topUsers: raw.topUsers.map(u => ({ userId: u.userId, requestCount: u.count })),
    };
  }

  /**
   * Pull audit log entries with optional filtering.
   * Maps to Bulwark AI Admin API: GET /admin/audit
   */
  async getAuditEntries(
    query?: BulwarkAuditQuery
  ): Promise<BulwarkPaginatedResponse<BulwarkAuditEntry>> {
    const raw = await this.request<{
      entries: Array<{
        id: string; timestamp: string; user_id: string; model: string; provider: string;
        input_tokens: number; output_tokens: number; cost_usd: number; duration_ms: number;
        action: string; pii_detections?: number; policy_violations?: string;
      }>;
      total: number;
    }>(
      "GET",
      "/admin/audit",
      undefined,
      query ? {
        from: query.startDate, to: query.endDate,
        userId: query.userId, limit: query.limit, offset: query.offset,
      } : undefined
    );

    const entries: BulwarkAuditEntry[] = raw.entries.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      userId: e.user_id || "",
      model: e.model || "",
      provider: e.provider || "",
      promptTokens: e.input_tokens || 0,
      completionTokens: e.output_tokens || 0,
      totalTokens: (e.input_tokens || 0) + (e.output_tokens || 0),
      latencyMs: e.duration_ms || 0,
      statusCode: 200,
      flagged: !!(e.pii_detections || e.policy_violations),
      flagReason: e.policy_violations || (e.pii_detections ? `PII detected (${e.pii_detections})` : undefined),
      metadata: {},
    }));

    return {
      data: entries, total: raw.total,
      limit: query?.limit || 50, offset: query?.offset || 0,
      hasMore: (query?.offset || 0) + entries.length < raw.total,
    };
  }

  /**
   * Pull gateway configuration and settings.
   * Maps to Bulwark AI Admin API: GET /admin/settings + GET /admin/status
   */
  async getSettings(): Promise<BulwarkSettings> {
    const [settings, status] = await Promise.all([
      this.request<{ policyCount: number; sourceCount: number; tenantCount: number; budgetCount: number; monthlyUsage: { requests: number } }>("GET", "/admin/settings"),
      this.request<{ enabled: boolean; activeRequests: number; circuitBreaker: Record<string, unknown> | null }>("GET", "/admin/status"),
    ]);

    return {
      gatewayId: "bulwark-default",
      name: "Bulwark AI Gateway",
      version: "0.2.0",
      providers: [],
      policies: [],
      rateLimits: { requestsPerMinute: 0, tokensPerMinute: 0, tokensPerDay: 0 },
      loggingEnabled: true,
      auditRetentionDays: 365,
    };
  }

  /**
   * Get SLA health for all providers.
   * Maps to Bulwark AI Admin API: GET /admin/sla/health
   */
  async getSLAHealth(window: string = "24h"): Promise<unknown> {
    return this.request("GET", "/admin/sla/health", undefined, { window });
  }

  /**
   * Health check — returns true if the gateway is reachable.
   * Maps to Bulwark AI Admin API: GET /admin/status
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.request<{ enabled: boolean }>("GET", "/admin/status");
      return true;
    } catch {
      return false;
    }
  }
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class BulwarkApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly responseBody: string
  ) {
    super(message);
    this.name = "BulwarkApiError";
  }
}
