export type ReviewPosture = "standard" | "strict" | "expedited";

export type WorkspaceSettings = {
  workspaceName: string;
  defaultRepository: string;
  defaultBriefTemplate: string;
  reviewPosture: ReviewPosture;
  showActivityRail: boolean;
};

export type Workspace = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  settings: WorkspaceSettings;
};

const WORKSPACES_STORAGE_KEY = "aurelia.workspaces.v1";
const LAST_WORKSPACE_KEY = "aurelia.last-workspace-id";
export const WORKSPACE_SETTINGS_STORAGE_KEY = "aurelia.workspace-settings.v1";

export const defaultWorkspaceSettings: WorkspaceSettings = {
  workspaceName: "Aurelia Research Hub",
  defaultRepository: "ehg/agent-research-lab",
  defaultBriefTemplate: "Summarize the objective, constraints, evidence requirements, and target deliverable for each research run.",
  reviewPosture: "standard",
  showActivityRail: true,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeRequiredText(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function sanitizeOptionalText(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
}

function sanitizeReviewPosture(value: unknown, fallback: ReviewPosture): ReviewPosture {
  if (value === "standard" || value === "strict" || value === "expedited") {
    return value;
  }

  return fallback;
}

function sanitizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeWorkspaceSettings(value: unknown): WorkspaceSettings {
  const record = isRecord(value) ? value : {};

  return {
    workspaceName: sanitizeRequiredText(record.workspaceName, defaultWorkspaceSettings.workspaceName),
    defaultRepository: sanitizeRequiredText(record.defaultRepository, defaultWorkspaceSettings.defaultRepository),
    defaultBriefTemplate: sanitizeOptionalText(record.defaultBriefTemplate, defaultWorkspaceSettings.defaultBriefTemplate),
    reviewPosture: sanitizeReviewPosture(record.reviewPosture, defaultWorkspaceSettings.reviewPosture),
    showActivityRail: sanitizeBoolean(record.showActivityRail, defaultWorkspaceSettings.showActivityRail),
  };
}

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function normalizeWorkspace(raw: unknown): Workspace | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== "string" || raw.id.length === 0) return null;

  return {
    id: raw.id,
    name: sanitizeRequiredText(raw.name, "Untitled workspace"),
    description: typeof raw.description === "string" ? raw.description : "",
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    settings: normalizeWorkspaceSettings(raw.settings),
  };
}

export function loadWorkspaces(): Workspace[] {
  if (!canUseLocalStorage()) return [];

  try {
    const raw = window.localStorage.getItem(WORKSPACES_STORAGE_KEY);
    if (!raw) return migrateFromLegacy();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return migrateFromLegacy();

    const workspaces: Workspace[] = [];
    for (const item of parsed) {
      const ws = normalizeWorkspace(item);
      if (ws) workspaces.push(ws);
    }
    return workspaces;
  } catch {
    return [];
  }
}

function migrateFromLegacy(): Workspace[] {
  if (!canUseLocalStorage()) return [];

  try {
    const legacyRaw = window.localStorage.getItem(WORKSPACE_SETTINGS_STORAGE_KEY);
    if (!legacyRaw) return [];

    const legacySettings = normalizeWorkspaceSettings(JSON.parse(legacyRaw));
    const migrated: Workspace = {
      id: generateId(),
      name: legacySettings.workspaceName,
      description: "",
      createdAt: new Date().toISOString(),
      settings: legacySettings,
    };

    saveWorkspaces([migrated]);
    return [migrated];
  } catch {
    return [];
  }
}

export function saveWorkspaces(workspaces: Workspace[]): void {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(workspaces));
  } catch {
    // storage full or unavailable
  }
}

export function createWorkspace(name: string, description = ""): Workspace {
  const ws: Workspace = {
    id: generateId(),
    name: name.trim() || "Untitled workspace",
    description: description.trim(),
    createdAt: new Date().toISOString(),
    settings: { ...defaultWorkspaceSettings, workspaceName: name.trim() || "Untitled workspace" },
  };

  const all = loadWorkspaces();
  all.push(ws);
  saveWorkspaces(all);
  return ws;
}

export function deleteWorkspace(id: string): void {
  const all = loadWorkspaces().filter((ws) => ws.id !== id);
  saveWorkspaces(all);
}

export function loadLastWorkspaceId(): string | null {
  if (!canUseLocalStorage()) return null;
  return window.localStorage.getItem(LAST_WORKSPACE_KEY);
}

export function saveLastWorkspaceId(id: string | null): void {
  if (!canUseLocalStorage()) return;

  try {
    if (id) {
      window.localStorage.setItem(LAST_WORKSPACE_KEY, id);
    } else {
      window.localStorage.removeItem(LAST_WORKSPACE_KEY);
    }
  } catch {
    // storage full or unavailable
  }
}

export function loadWorkspaceSettings(): WorkspaceSettings {
  if (!canUseLocalStorage()) {
    return defaultWorkspaceSettings;
  }

  try {
    const rawValue = window.localStorage.getItem(WORKSPACE_SETTINGS_STORAGE_KEY);

    if (!rawValue) {
      return defaultWorkspaceSettings;
    }

    return normalizeWorkspaceSettings(JSON.parse(rawValue));
  } catch {
    return defaultWorkspaceSettings;
  }
}

export function saveWorkspaceSettings(settings: WorkspaceSettings): WorkspaceSettings {
  const normalized = normalizeWorkspaceSettings(settings);

  if (canUseLocalStorage()) {
    try {
      window.localStorage.setItem(WORKSPACE_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      return normalized;
    }
  }

  return normalized;
}
