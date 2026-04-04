/**
 * HTTP client for the Comply AI server API.
 */

export interface ApiClientOptions {
  server: string;
  apiKey: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export class ApiClient {
  private server: string;
  private apiKey: string;

  constructor(options: ApiClientOptions) {
    this.server = options.server.replace(/\/+$/, "");
    this.apiKey = options.apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const url = `${this.server}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "User-Agent": "comply-ai-cli/0.1.0",
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const contentType = response.headers.get("content-type") ?? "";
      let data: T | undefined;

      if (contentType.includes("application/json")) {
        data = (await response.json()) as T;
      }

      if (!response.ok) {
        const errorData = data as Record<string, unknown> | undefined;
        return {
          ok: false,
          status: response.status,
          error:
            (errorData?.message as string) ??
            (errorData?.error as string) ??
            `HTTP ${response.status} ${response.statusText}`,
        };
      }

      return { ok: true, status: response.status, data };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown network error";
      return { ok: false, status: 0, error: message };
    }
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>("GET", path);
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("POST", path, body);
  }

  async put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", path, body);
  }

  // ----- Comply AI API methods -----

  async complianceCheck(systemId: string) {
    return this.get<{
      status: "pass" | "fail" | "warning";
      systemId: string;
      riskLevel: string;
      checks: Array<{
        name: string;
        status: "pass" | "fail" | "warning";
        message: string;
      }>;
      timestamp: string;
    }>(`/api/v1/compliance/check?system_id=${encodeURIComponent(systemId)}`);
  }

  async getSystemStatus(systemId: string) {
    return this.get<{
      id: string;
      name: string;
      status: string;
      riskLevel: string;
      complianceScore: number;
      documentsCount: number;
      lastAssessed: string;
      requirements: Array<{
        article: string;
        title: string;
        status: "met" | "unmet" | "partial";
      }>;
    }>(`/api/v1/systems/${encodeURIComponent(systemId)}/status`);
  }

  async registerSystem(data: {
    name: string;
    category: string;
    description?: string;
    provider?: string;
  }) {
    return this.post<{
      id: string;
      name: string;
      category: string;
      riskLevel: string;
      status: string;
      createdAt: string;
    }>("/api/v1/systems/register", data);
  }
}
