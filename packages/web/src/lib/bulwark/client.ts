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
   */
  async getDashboard(): Promise<BulwarkDashboardStats> {
    return this.request<BulwarkDashboardStats>("GET", "/api/v1/dashboard");
  }

  /**
   * Pull audit log entries with optional filtering.
   */
  async getAuditEntries(
    query?: BulwarkAuditQuery
  ): Promise<BulwarkPaginatedResponse<BulwarkAuditEntry>> {
    return this.request<BulwarkPaginatedResponse<BulwarkAuditEntry>>(
      "GET",
      "/api/v1/audit",
      undefined,
      query
        ? {
            start_date: query.startDate,
            end_date: query.endDate,
            user_id: query.userId,
            model: query.model,
            provider: query.provider,
            flagged: query.flagged,
            limit: query.limit,
            offset: query.offset,
          }
        : undefined
    );
  }

  /**
   * Get a single audit entry by ID.
   */
  async getAuditEntry(id: string): Promise<BulwarkAuditEntry> {
    return this.request<BulwarkAuditEntry>("GET", `/api/v1/audit/${id}`);
  }

  /**
   * Pull gateway configuration and settings.
   */
  async getSettings(): Promise<BulwarkSettings> {
    return this.request<BulwarkSettings>("GET", "/api/v1/settings");
  }

  /**
   * Health check — returns true if the gateway is reachable.
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.request<{ status: string }>("GET", "/api/v1/health");
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
