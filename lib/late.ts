export interface LateClientConfig {
  apiKey: string;
  baseUrl: string;
}

export interface LateAccount {
  id?: string;
  accountId?: string;
  username?: string;
  name?: string;
  connectedAt?: string;
  profileId?: string;
  platform?: string;
}

export interface LateProfile {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
  createdAt?: string;
}

export class LateClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: LateClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? "https://getlate.dev/api";
  }

  private get defaultHeaders(): HeadersInit {
    if (!this.apiKey) {
      throw new Error("Late API key not configured");
    }
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async listProfiles(): Promise<{ profiles: LateProfile[] }> {
    const res = await fetch(`${this.baseUrl}/v1/profiles`, {
      headers: this.defaultHeaders,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Late API error ${res.status}: ${text}`);
    }
    return res.json();
  }

  async createProfile(payload: Partial<LateProfile>): Promise<any> {
    const res = await fetch(`${this.baseUrl}/v1/profiles`, {
      method: "POST",
      headers: this.defaultHeaders,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Late API error ${res.status}: ${text}`);
    }
    return res.json();
  }

  async listAccounts(profileId: string): Promise<{ accounts: LateAccount[] }> {
    const res = await fetch(
      `${this.baseUrl}/v1/accounts?profileId=${profileId}`,
      {
        headers: this.defaultHeaders,
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Late API error ${res.status}: ${text}`);
    }
    return res.json();
  }

  buildConnectUrl(
    platform: string,
    profileId: string,
    redirectUrl: string
  ): string {
    const base = `${this.baseUrl}/v1/connect/${platform}`;
    const url = `${base}?profileId=${encodeURIComponent(
      profileId
    )}&redirect_url=${encodeURIComponent(redirectUrl)}`;
    return url;
  }

  async disconnectAccount(accountId: string): Promise<void> {
    // Assuming v1 DELETE endpoint for disconnect
    const res = await fetch(`${this.baseUrl}/v1/accounts/${accountId}`, {
      method: "DELETE",
      headers: this.defaultHeaders,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Late API error ${res.status}: ${text}`);
    }
  }

  async createDraft(payload: any): Promise<any> {
    const res = await fetch(`${this.baseUrl}/v1/drafts`, {
      method: "POST",
      headers: this.defaultHeaders,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Late API error ${res.status}: ${text}`);
    }
    return res.json();
  }

  async createPost(payload: any): Promise<any> {
    const res = await fetch(`${this.baseUrl}/v1/posts`, {
      method: "POST",
      headers: this.defaultHeaders,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Late API error ${res.status}: ${text}`);
    }
    return res.json();
  }

  async listPosts(params?: {
    status?: string;
    limit?: number;
    after?: string;
    profileId?: string;
  }): Promise<{ posts: any[]; after?: string; before?: string }> {
    const url = new URL(`${this.baseUrl}/v1/posts`);
    if (params?.status) url.searchParams.set("status", params.status);
    if (params?.limit) url.searchParams.set("limit", String(params.limit));
    if (params?.after) url.searchParams.set("after", params.after);
    if (params?.profileId) url.searchParams.set("profileId", params.profileId);

    const res = await fetch(url.toString(), {
      headers: this.defaultHeaders,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Late API error ${res.status}: ${text}`);
    }
    return res.json();
  }
}

const LATE_BASE_URL = "https://getlate.dev/api";
const LATE_API_KEY = process.env.LATE_API_KEY || "";

export const late = new LateClient({
  apiKey: LATE_API_KEY,
  baseUrl: LATE_BASE_URL,
});
