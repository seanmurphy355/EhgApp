export type AgentStatus = "active" | "idle" | "paused" | "error";

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export type AgentHealth = {
  status: HealthStatus;
  latencyMs: number;
  memoryPct: number;
  errorRate: number;
  lastCheckAt: number;
};

export type AgentEntry = {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  currentTask: string | null;
  progress: number;
  budgetUsed: number;
  budgetTotal: number;
  lastHeartbeat: string;
  mountedAt: number;
  health: AgentHealth;
};

export const HEALTH_CONFIG: Record<HealthStatus, { label: string; tone: string }> = {
  healthy: { label: "Healthy", tone: "ui.success" },
  degraded: { label: "Degraded", tone: "ui.warning" },
  unhealthy: { label: "Unhealthy", tone: "ui.danger" },
};

export type PipelineTask = {
  id: string;
  title: string;
  agent: string;
  timeInStage: string;
};

export type PipelineStage = {
  label: string;
  tone: string;
  tasks: PipelineTask[];
};

export type ApprovalItem = {
  id: string;
  title: string;
  agent: string;
  submittedAgo: string;
};

export type FeedEntry = {
  id: string;
  title: string;
  detail: string;
  tone: string;
};

export const STATUS_CONFIG: Record<AgentStatus, { label: string; tone: string }> = {
  active: { label: "Active", tone: "ui.success" },
  idle: { label: "Idle", tone: "ui.textSubtle" },
  paused: { label: "Paused", tone: "ui.warning" },
  error: { label: "Error", tone: "ui.danger" },
};

const now = Date.now();

export const SEED_AGENTS: AgentEntry[] = [
  { id: "fra", name: "Field Researcher Alpha", role: "Investigation", status: "active", currentTask: "Survey local policy archives for regulatory precedent", progress: 68, budgetUsed: 320, budgetTotal: 1000, lastHeartbeat: "2m ago", mountedAt: now - 120_000, health: { status: "healthy", latencyMs: 42, memoryPct: 34, errorRate: 0.2, lastCheckAt: now - 15_000 } },
  { id: "dab", name: "Data Analyst Beta", role: "Analysis", status: "active", currentTask: "Cross-reference citation graphs across 12 journals", progress: 41, budgetUsed: 180, budgetTotal: 800, lastHeartbeat: "45s ago", mountedAt: now - 45_000, health: { status: "degraded", latencyMs: 310, memoryPct: 78, errorRate: 4.1, lastCheckAt: now - 30_000 } },
  { id: "rc", name: "Review Coordinator", role: "Oversight", status: "idle", currentTask: null, progress: 0, budgetUsed: 0, budgetTotal: 600, lastHeartbeat: "18m ago", mountedAt: now - 1_080_000, health: { status: "healthy", latencyMs: 18, memoryPct: 12, errorRate: 0, lastCheckAt: now - 600_000 } },
  { id: "ls", name: "Literature Scanner", role: "Discovery", status: "active", currentTask: "Scan arXiv for 2026 submissions on causal inference", progress: 85, budgetUsed: 740, budgetTotal: 1200, lastHeartbeat: "1m ago", mountedAt: now - 60_000, health: { status: "healthy", latencyMs: 55, memoryPct: 61, errorRate: 0.5, lastCheckAt: now - 20_000 } },
  { id: "ba", name: "Budget Auditor", role: "Finance", status: "paused", currentTask: null, progress: 0, budgetUsed: 0, budgetTotal: 400, lastHeartbeat: "1h ago", mountedAt: now - 3_600_000, health: { status: "unhealthy", latencyMs: 1240, memoryPct: 92, errorRate: 12.3, lastCheckAt: now - 3_000_000 } },
];

export const SEED_PIPELINE: PipelineStage[] = [
  { label: "Queued", tone: "ui.textSubtle", tasks: [
    { id: "q1", title: "Compile systematic review protocol", agent: "Review Coordinator", timeInStage: "34m" },
    { id: "q2", title: "Audit Q1 research expenditure", agent: "Budget Auditor", timeInStage: "2h 10m" },
  ]},
  { label: "In Progress", tone: "ui.accent", tasks: [
    { id: "p1", title: "Survey local policy archives", agent: "Field Researcher Alpha", timeInStage: "1h 20m" },
    { id: "p2", title: "Cross-reference citation graphs", agent: "Data Analyst Beta", timeInStage: "45m" },
    { id: "p3", title: "Scan arXiv 2026 submissions", agent: "Literature Scanner", timeInStage: "28m" },
  ]},
  { label: "Under Review", tone: "ui.violet", tasks: [
    { id: "r1", title: "Preliminary findings on gene therapy efficacy", agent: "Field Researcher Alpha", timeInStage: "3h" },
  ]},
  { label: "Completed", tone: "ui.success", tasks: [
    { id: "c1", title: "Literature gap analysis — immunotherapy", agent: "Literature Scanner", timeInStage: "6h" },
    { id: "c2", title: "Dataset normalization for cohort study", agent: "Data Analyst Beta", timeInStage: "1d" },
  ]},
];

export const SEED_FEED: FeedEntry[] = [
  { id: "f1", title: "Literature Scanner started task", detail: "Scanning arXiv for 2026 causal inference submissions.", tone: "ui.accent" },
  { id: "f2", title: "Field Researcher Alpha checkpoint", detail: "Completed 68% of local policy archive survey.", tone: "ui.success" },
  { id: "f3", title: "Data Analyst Beta finding", detail: "Identified 3 citation clusters requiring manual review.", tone: "ui.violet" },
  { id: "f4", title: "Budget Auditor paused", detail: "Awaiting Q1 expenditure data from finance team.", tone: "ui.warning" },
  { id: "f5", title: "Review Coordinator idle", detail: "No pending review assignments. Waiting for new submissions.", tone: "ui.textSubtle" },
];

export const ROTATING_FEED: FeedEntry[] = [
  { id: "r1", title: "Literature Scanner discovery", detail: "Found 4 new papers on causal inference methods.", tone: "ui.accent" },
  { id: "r2", title: "Field Researcher Alpha milestone", detail: "Regulatory precedent survey reached 75% coverage.", tone: "ui.success" },
  { id: "r3", title: "Data Analyst Beta anomaly", detail: "Detected citation loop in 2 journal cross-references.", tone: "ui.danger" },
  { id: "r4", title: "Budget Auditor resumed", detail: "Q1 finance data received. Resuming expenditure audit.", tone: "ui.success" },
  { id: "r5", title: "Review Coordinator assigned", detail: "New review assignment: gene therapy efficacy findings.", tone: "ui.violet" },
  { id: "r6", title: "Literature Scanner checkpoint", detail: "arXiv scan 92% complete. 12 submissions flagged.", tone: "ui.accent" },
];

export const SEED_APPROVALS: ApprovalItem[] = [
  { id: "a1", title: "Gene therapy efficacy — preliminary findings", agent: "Field Researcher Alpha", submittedAgo: "3h ago" },
  { id: "a2", title: "Citation cluster anomaly report", agent: "Data Analyst Beta", submittedAgo: "1h ago" },
  { id: "a3", title: "Scope expansion: add immunotherapy vertical", agent: "Literature Scanner", submittedAgo: "45m ago" },
  { id: "a4", title: "Budget reallocation request — Q2", agent: "Budget Auditor", submittedAgo: "20m ago" },
];

export const TONE_HEX: Record<string, string> = {
  "ui.success": "#2EDF72",
  "ui.accent": "#6B63D7",
  "ui.warning": "#FFB64A",
  "ui.violet": "#AB94FF",
  "ui.danger": "#FF6767",
  "ui.textSubtle": "#707070",
};

export function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
