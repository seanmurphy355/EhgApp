type ActivityType = "task.run_requested" | "session.created" | "system.info";

type User = {
  id: string;
  name: string;
  email: string;
};

export type ActivityItem = {
  id: string;
  type: ActivityType;
  detail: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

type ActivityListResponse = {
  items: ActivityItem[];
};

export type ActivitySummaryResponse = {
  tasksToday: number;
  eventsToday: number;
  lastEventAt: string | null;
};

type RunTaskRequest = {
  repo: string;
  prompt: string;
};

type RunTaskResponse = {
  activity: ActivityItem;
};

type LocalSessionResponse = {
  token: string;
  user: User;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8787").replace(/\/$/, "");
const TOKEN_STORAGE_KEY = "aurelia.local.sessionToken";

let sessionToken: string | null = localStorage.getItem(TOKEN_STORAGE_KEY);

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}, requiresAuth = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (requiresAuth) {
    if (!sessionToken) {
      throw new ApiError("Not authenticated.", 401);
    }
    headers.set("Authorization", `Bearer ${sessionToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || "Request failed.", response.status);
  }

  return (await response.json()) as T;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

function clearSessionToken(): void {
  sessionToken = null;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function createLocalSession(): Promise<LocalSessionResponse> {
  const payload = await request<LocalSessionResponse>("/api/sessions/local", { method: "POST", body: "{}" }, false);
  sessionToken = payload.token;
  localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
  return payload;
}

async function getCurrentUser(): Promise<User> {
  return request<User>("/api/users/me");
}

export async function ensureSession(): Promise<User> {
  if (sessionToken) {
    try {
      return await getCurrentUser();
    } catch {
      clearSessionToken();
    }
  }

  const created = await createLocalSession();
  return created.user;
}

export async function fetchActivity(limit = 50): Promise<ActivityListResponse> {
  return request<ActivityListResponse>(`/api/activity?limit=${limit}`);
}

export async function fetchActivitySummary(): Promise<ActivitySummaryResponse> {
  return request<ActivitySummaryResponse>("/api/activity/summary");
}

export async function runTask(payload: RunTaskRequest): Promise<RunTaskResponse> {
  return request<RunTaskResponse>("/api/tasks/run", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Session expired. Creating a new local session can fix this.";
    }
    return error.message || "Backend request failed.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Backend request failed.";
}

export type AgentWalletInfo = {
  address: string | null;
  configured: boolean;
};

export async function fetchAgentWallet(): Promise<AgentWalletInfo> {
  return request<AgentWalletInfo>("/api/agent/wallet");
}