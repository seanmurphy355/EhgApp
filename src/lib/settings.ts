export type ReviewPosture = "standard" | "strict" | "expedited";

export type WorkspaceSettings = {
  workspaceName: string;
  defaultRepository: string;
  defaultBriefTemplate: string;
  reviewPosture: ReviewPosture;
  showActivityRail: boolean;
};

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
