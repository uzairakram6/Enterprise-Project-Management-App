// Unified recursive task model.
// Shape mirrors the planned MongoDB document (parentId reference, flat collection),
// so swapping dummy data for API data later is a drop-in replacement.

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "doing" | "done" | "at-risk" | "blocked" | "on-hold";
export type UpdateType = "daily" | "blocker" | "escalation" | "note";

export interface Task {
  id: string;
  projectId: string;
  parentId: string | null; // null = top-level (parent) task
  title: string;
  description?: string;
  assignees: string[];
  dueDate?: string; // optional per client requirement
  priority: TaskPriority;
  labels: string[];
  status: TaskStatus;
  createdBy: string;
  createdAt: string;
}

export interface TaskUpdate {
  id: string;
  taskId: string;
  type: UpdateType;
  author: string;
  date: string;
  hours?: number;
  text: string;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  icon: string;
  iconBg: string;
}

// Will become a per-project setting; UI-level safety cap for now.
export const MAX_TASK_DEPTH = 10;

export const PROJECTS: Project[] = [
  { id: "sumhuman", name: "Sumhuman", type: "Internal Project", icon: "🤖", iconBg: "bg-blue-100 text-blue-600" },
  { id: "gts", name: "GTS — Global Trash System", type: "Internal Project", icon: "♻️", iconBg: "bg-green-100 text-green-600" },
  { id: "bilingual", name: "Bilingual Chatbot", type: "Client Project", icon: "💬", iconBg: "bg-purple-100 text-purple-600" },
  { id: "friday", name: "Friday", type: "Client Project", icon: "📅", iconBg: "bg-amber-100 text-amber-600" },
  { id: "cis-ca", name: "CIS CA", type: "Client Project", icon: "🛡️", iconBg: "bg-red-100 text-red-600" },
  { id: "dmg", name: "DMG", type: "Client Project", icon: "📦", iconBg: "bg-cyan-100 text-cyan-600" },
  { id: "als", name: "ALS", type: "Client Project", icon: "🧭", iconBg: "bg-emerald-100 text-emerald-600" },
  { id: "vorpix", name: "Vorpix", type: "Client Project", icon: "🖼️", iconBg: "bg-indigo-100 text-indigo-600" },
  { id: "navera", name: "Navera", type: "Client Project", icon: "🧩", iconBg: "bg-violet-100 text-violet-600" },
  { id: "deep-agents", name: "Deep Agents", type: "Internal Project", icon: "🧠", iconBg: "bg-slate-100 text-slate-600" },
  { id: "t360-view-engine", name: "T360 View Engine", type: "Internal Project", icon: "🔧", iconBg: "bg-blue-100 text-blue-600" },
  { id: "fleetroute-logistics", name: "FleetRoute Logistics", type: "Client Project", icon: "🚚", iconBg: "bg-green-100 text-green-600" },
  { id: "medvault-patient-portal", name: "MedVault Patient Portal", type: "Client Project", icon: "🏥", iconBg: "bg-teal-100 text-teal-600" },
  { id: "secureauth-identity-platform", name: "SecureAuth Identity Platform", type: "Client Project", icon: "🔐", iconBg: "bg-red-100 text-red-600" },
  { id: "insightpulse-analytics", name: "InsightPulse Analytics", type: "Client Project", icon: "📈", iconBg: "bg-purple-100 text-purple-600" },
  { id: "omniretail-commerce-hub", name: "OmniRetail Commerce Hub", type: "Client Project", icon: "🛒", iconBg: "bg-orange-100 text-orange-600" },
  { id: "smartgrid-energy-monitor", name: "SmartGrid Energy Monitor", type: "Client Project", icon: "⚡", iconBg: "bg-yellow-100 text-yellow-700" },
  { id: "compliancetrack-audit-suite", name: "ComplianceTrack Audit Suite", type: "Client Project", icon: "📋", iconBg: "bg-rose-100 text-rose-600" },
];

export const TEAM_MEMBERS = [
  "Ali Hassan",
  "Sara Ahmed",
  "Usman Khan",
  "Fatima Malik",
  "Ahmed Raza",
  "Zainab Ali",
];

const PM = "Hamza Khan (PM)";

const LEGACY_DAILY_TASKS: Record<string, Record<string, string[]>> = {
  sumhuman: {
    "User Onboarding": ["Signup flow", "Role assignment", "Welcome emails"],
    "API Integration": ["Auth endpoints", "Error handling", "Rate limiting"],
    "Database Schema": ["Tenant columns", "RLS policies", "Migration scripts"],
    "Bug Fixes": [],
    "Workflow Setup": [],
  },
  gts: {
    "Route Optimization": ["Map API setup", "Algorithm tuning", "Driver app hooks"],
    "Fleet Tracking": ["GPS ingestion", "Live map UI", "Alert rules"],
    "Dispatch UI": [],
    "Sensor Integration": [],
    Reporting: [],
  },
  bilingual: {
    "NLP Pipeline": ["Tokenizer setup", "Language detection", "Response templates"],
    "Intent Training": [],
    "Voice Integration": [],
    Testing: [],
    Deployment: [],
  },
  friday: {
    "Scheduling Engine": ["Recurrence rules", "Conflict detection", "Timezone handling"],
    "Calendar Sync": [],
    Notifications: [],
    "Mobile UI": [],
    Analytics: [],
  },
  "cis-ca": {
    "Compliance Rules": ["Policy engine", "Rule editor", "Audit triggers"],
    "Audit Logs": [],
    "Role Management": [],
    "Document Vault": [],
    Reporting: [],
  },
  dmg: {
    "Data Migration": ["Source mapping", "Batch jobs", "Validation checks"],
    "ETL Pipelines": [],
    "Validation Suite": [],
    "Rollback Plan": [],
    Monitoring: [],
  },
};

function slugifyTaskTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function createLegacyDailyTasks(): Task[] {
  const tasks: Task[] = [];
  for (const [projectId, projectTasks] of Object.entries(LEGACY_DAILY_TASKS)) {
    for (const [title, subtasks] of Object.entries(projectTasks)) {
      const taskId = `${projectId}-${slugifyTaskTitle(title)}`;
      tasks.push({
        id: taskId,
        projectId,
        parentId: null,
        title,
        assignees: [],
        priority: "medium",
        labels: ["daily-updates"],
        status: "doing",
        createdBy: PM,
        createdAt: "2026-06-01",
      });
      for (const subtask of subtasks) {
        tasks.push({
          id: `${taskId}-${slugifyTaskTitle(subtask)}`,
          projectId,
          parentId: taskId,
          title: subtask,
          assignees: [],
          priority: "medium",
          labels: ["daily-updates"],
          status: "doing",
          createdBy: PM,
          createdAt: "2026-06-01",
        });
      }
    }
  }
  return tasks;
}

// Deep dummy tree (up to 5 levels) to exercise the n-level UI.
export const INITIAL_TASKS: Task[] = [
  ...createLegacyDailyTasks(),

  // ── Sumhuman ──────────────────────────────────────────────────────────
  {
    id: "mt-db",
    projectId: "sumhuman",
    parentId: "sumhuman-database-schema",
    title: "Tenant isolation schema",
    description: "Implement tenant isolation at database level with RLS policies",
    assignees: ["Ali Hassan", "Sara Ahmed"],
    dueDate: "2026-06-15",
    priority: "high",
    labels: ["milestone-1", "backend"],
    status: "doing",
    createdBy: PM,
    createdAt: "2026-06-01",
  },
  {
    id: "mt-db-rls",
    projectId: "sumhuman",
    parentId: "mt-db",
    title: "RLS policy setup",
    assignees: ["Ali Hassan"],
    priority: "high",
    labels: ["backend"],
    status: "doing",
    createdBy: PM,
    createdAt: "2026-06-02",
  },
  {
    id: "mt-db-rls-users",
    projectId: "sumhuman",
    parentId: "mt-db-rls",
    title: "Policies: users table",
    assignees: ["Ali Hassan"],
    priority: "high",
    labels: [],
    status: "done",
    createdBy: "Ali Hassan",
    createdAt: "2026-06-03",
  },
  {
    id: "mt-db-rls-projects",
    projectId: "sumhuman",
    parentId: "mt-db-rls",
    title: "Policies: projects table",
    assignees: ["Ali Hassan"],
    priority: "medium",
    labels: [],
    status: "doing",
    createdBy: "Ali Hassan",
    createdAt: "2026-06-03",
  },
  {
    id: "mt-db-rls-bypass",
    projectId: "sumhuman",
    parentId: "mt-db-rls-projects",
    title: "Edge case: admin bypass",
    assignees: ["Sara Ahmed"],
    priority: "high",
    labels: ["security"],
    status: "blocked",
    createdBy: "Sara Ahmed",
    createdAt: "2026-06-05",
  },
  {
    id: "mt-db-rls-bypass-audit",
    projectId: "sumhuman",
    parentId: "mt-db-rls-bypass",
    title: "Bypass audit logging",
    assignees: ["Sara Ahmed"],
    priority: "medium",
    labels: ["security"],
    status: "doing",
    createdBy: "Sara Ahmed",
    createdAt: "2026-06-06",
  },
  {
    id: "mt-db-mig",
    projectId: "sumhuman",
    parentId: "mt-db",
    title: "Migration scripts",
    assignees: ["Sara Ahmed"],
    dueDate: "2026-06-12",
    priority: "medium",
    labels: ["backend"],
    status: "doing",
    createdBy: PM,
    createdAt: "2026-06-02",
  },
  {
    id: "mt-db-mig-rollback",
    projectId: "sumhuman",
    parentId: "mt-db-mig",
    title: "Rollback-safe migrations",
    assignees: ["Sara Ahmed"],
    priority: "medium",
    labels: [],
    status: "doing",
    createdBy: "Sara Ahmed",
    createdAt: "2026-06-04",
  },
  {
    id: "mt-db-tests",
    projectId: "sumhuman",
    parentId: "mt-db",
    title: "Admin bypass tests",
    assignees: ["Sara Ahmed"],
    priority: "medium",
    labels: ["qa"],
    status: "at-risk",
    createdBy: PM,
    createdAt: "2026-06-02",
  },
  {
    id: "mt-api",
    projectId: "sumhuman",
    parentId: "sumhuman-api-integration",
    title: "Tenant context middleware",
    description: "Build API middleware for tenant context injection",
    assignees: ["Usman Khan"],
    dueDate: "2026-06-20",
    priority: "high",
    labels: ["milestone-1", "backend"],
    status: "doing",
    createdBy: PM,
    createdAt: "2026-06-01",
  },
  {
    id: "mt-api-mw",
    projectId: "sumhuman",
    parentId: "mt-api",
    title: "Tenant middleware",
    assignees: ["Usman Khan"],
    priority: "high",
    labels: [],
    status: "done",
    createdBy: PM,
    createdAt: "2026-06-02",
  },
  {
    id: "mt-api-ctx",
    projectId: "sumhuman",
    parentId: "mt-api",
    title: "Context injection",
    assignees: ["Usman Khan"],
    priority: "medium",
    labels: [],
    status: "doing",
    createdBy: PM,
    createdAt: "2026-06-02",
  },
  {
    id: "mt-api-ctx-pipeline",
    projectId: "sumhuman",
    parentId: "mt-api-ctx",
    title: "Request pipeline wiring",
    assignees: ["Usman Khan"],
    priority: "medium",
    labels: [],
    status: "doing",
    createdBy: "Usman Khan",
    createdAt: "2026-06-05",
  },
  {
    id: "mt-api-ctx-headers",
    projectId: "sumhuman",
    parentId: "mt-api-ctx",
    title: "Header propagation",
    assignees: ["Usman Khan"],
    priority: "low",
    labels: [],
    status: "doing",
    createdBy: "Usman Khan",
    createdAt: "2026-06-05",
  },

  // ── GTS — Global Trash System ─────────────────────────────────────────
  {
    id: "cp-ui",
    projectId: "gts",
    parentId: "gts-dispatch-ui",
    title: "Dispatch UI components",
    description: "Design and implement reusable React components for dispatch operations",
    assignees: ["Fatima Malik", "Zainab Ali"],
    dueDate: "2026-06-18",
    priority: "medium",
    labels: ["frontend"],
    status: "doing",
    createdBy: PM,
    createdAt: "2026-06-03",
  },
  {
    id: "cp-ui-buttons",
    projectId: "gts",
    parentId: "cp-ui",
    title: "Button components",
    assignees: ["Fatima Malik"],
    priority: "medium",
    labels: [],
    status: "done",
    createdBy: PM,
    createdAt: "2026-06-04",
  },
  {
    id: "cp-ui-forms",
    projectId: "gts",
    parentId: "cp-ui",
    title: "Form components",
    assignees: ["Zainab Ali"],
    priority: "medium",
    labels: [],
    status: "doing",
    createdBy: PM,
    createdAt: "2026-06-04",
  },
  {
    id: "cp-ui-forms-inputs",
    projectId: "gts",
    parentId: "cp-ui-forms",
    title: "Input wrappers",
    assignees: ["Zainab Ali"],
    priority: "medium",
    labels: [],
    status: "doing",
    createdBy: "Zainab Ali",
    createdAt: "2026-06-06",
  },
  {
    id: "cp-ui-forms-validation",
    projectId: "gts",
    parentId: "cp-ui-forms",
    title: "Validation states",
    assignees: ["Zainab Ali"],
    priority: "low",
    labels: [],
    status: "doing",
    createdBy: "Zainab Ali",
    createdAt: "2026-06-06",
  },

  // ── Friday ────────────────────────────────────────────────────────────
  {
    id: "mob-auth",
    projectId: "friday",
    parentId: "friday-mobile-ui",
    title: "Authentication",
    description: "Friday mobile auth flows including biometrics",
    assignees: ["Ahmed Raza"],
    dueDate: "2026-06-25",
    priority: "high",
    labels: ["mobile"],
    status: "doing",
    createdBy: PM,
    createdAt: "2026-06-02",
  },
  {
    id: "mob-auth-login",
    projectId: "friday",
    parentId: "mob-auth",
    title: "Login flow",
    assignees: ["Ahmed Raza"],
    priority: "high",
    labels: [],
    status: "doing",
    createdBy: PM,
    createdAt: "2026-06-03",
  },
  {
    id: "mob-auth-refresh",
    projectId: "friday",
    parentId: "mob-auth",
    title: "Token refresh",
    assignees: ["Ahmed Raza"],
    priority: "medium",
    labels: [],
    status: "doing",
    createdBy: PM,
    createdAt: "2026-06-03",
  },
];

// Typed updates (daily / blocker / escalation / note) attached at various depths —
// a blocker logged deep in the tree surfaces in every ancestor's roll-up.
export const INITIAL_TASK_UPDATES: TaskUpdate[] = [
  {
    id: "u1",
    taskId: "mt-db-rls-users",
    type: "daily",
    author: "Ali Hassan",
    date: "2026-06-08",
    hours: 6,
    text: "Finalized RLS policies for the users table; all isolation tests pass.",
  },
  {
    id: "u2",
    taskId: "mt-db-rls-bypass",
    type: "blocker",
    author: "Sara Ahmed",
    date: "2026-06-08",
    hours: 2,
    text: "Admin bypass conflicts with RLS on shared tables — waiting on security team's decision.",
  },
  {
    id: "u3",
    taskId: "mt-db-rls-bypass-audit",
    type: "daily",
    author: "Sara Ahmed",
    date: "2026-06-07",
    hours: 4,
    text: "Drafted audit logging schema for bypass events.",
  },
  {
    id: "u4",
    taskId: "mt-db-mig-rollback",
    type: "daily",
    author: "Sara Ahmed",
    date: "2026-06-07",
    hours: 5,
    text: "Writing rollback-safe migrations for staging validation.",
  },
  {
    id: "u5",
    taskId: "mt-db-tests",
    type: "escalation",
    author: "Sara Ahmed",
    date: "2026-06-06",
    text: "Security team review pending for 4 days — needs PM follow-up.",
  },
  {
    id: "u6",
    taskId: "mt-db",
    type: "note",
    author: PM,
    date: "2026-06-05",
    text: "Client confirmed tenant isolation must be verified before the June 15 demo.",
  },
  {
    id: "u7",
    taskId: "mt-api-mw",
    type: "daily",
    author: "Usman Khan",
    date: "2026-06-08",
    hours: 7,
    text: "Middleware merged and deployed to dev environment.",
  },
  {
    id: "u8",
    taskId: "mt-api-ctx-pipeline",
    type: "daily",
    author: "Usman Khan",
    date: "2026-06-07",
    hours: 6,
    text: "Injecting tenant context into the request pipeline.",
  },
  {
    id: "u9",
    taskId: "cp-ui-buttons",
    type: "daily",
    author: "Fatima Malik",
    date: "2026-06-08",
    hours: 4,
    text: "Shipped button component library to Storybook.",
  },
  {
    id: "u10",
    taskId: "cp-ui-forms-inputs",
    type: "daily",
    author: "Zainab Ali",
    date: "2026-06-07",
    hours: 5,
    text: "Started input wrapper components with validation states.",
  },
  {
    id: "u11",
    taskId: "mob-auth-login",
    type: "daily",
    author: "Ahmed Raza",
    date: "2026-06-08",
    hours: 6,
    text: "Implemented login screen and connected to auth endpoints.",
  },
];

// ── Tree helpers (pure functions over the flat array) ───────────────────
// Each maps to a single indexed MongoDB query later (parentId / ancestors array).

export function getProject(projectId: string): Project | undefined {
  return PROJECTS.find((p) => p.id === projectId);
}

export function getProjectName(projectId: string): string {
  return getProject(projectId)?.name ?? projectId;
}

export function getChildren(tasks: Task[], parentId: string | null, projectId?: string): Task[] {
  return tasks.filter(
    (t) => t.parentId === parentId && (projectId === undefined || t.projectId === projectId),
  );
}

export function getRootTasks(tasks: Task[], projectId?: string): Task[] {
  return getChildren(tasks, null, projectId);
}

/** Ancestor chain, ordered root → direct parent. */
export function getAncestors(tasks: Task[], taskId: string): Task[] {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const chain: Task[] = [];
  let current = byId.get(taskId);
  while (current?.parentId) {
    const parent = byId.get(current.parentId);
    if (!parent) break;
    chain.unshift(parent);
    current = parent;
  }
  return chain;
}

export function getDepth(tasks: Task[], taskId: string): number {
  return getAncestors(tasks, taskId).length;
}

/** All descendants of a task (excluding the task itself). */
export function getSubtree(tasks: Task[], rootId: string): Task[] {
  const result: Task[] = [];
  const queue = [rootId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    for (const child of tasks.filter((t) => t.parentId === id)) {
      result.push(child);
      queue.push(child.id);
    }
  }
  return result;
}

/** Breadcrumb-style path of ancestor titles, e.g. "API Layer › Context injection". */
export function getTaskPath(tasks: Task[], taskId: string): string {
  return getAncestors(tasks, taskId)
    .map((t) => t.title)
    .join(" › ");
}

export interface TaskRollup {
  directChildren: number;
  descendants: number;
  hours: number;
  doneCount: number;
  openBlockers: number;
  status: TaskStatus;
}

/** Roll up status, hours, and blockers across a task's subtree. */
export function getRollup(tasks: Task[], updates: TaskUpdate[], taskId: string): TaskRollup {
  const task = tasks.find((t) => t.id === taskId);
  const subtree = getSubtree(tasks, taskId);
  const all = task ? [task, ...subtree] : subtree;
  const ids = new Set(all.map((t) => t.id));
  const subtreeUpdates = updates.filter((u) => ids.has(u.taskId));

  const blockedTasks = all.filter((t) => t.status === "blocked").length;
  const blockerUpdates = subtreeUpdates.filter((u) => u.type === "blocker").length;
  const openBlockers = Math.max(blockedTasks, blockerUpdates);

  let status: TaskStatus = "doing";
  if (all.some((t) => t.status === "blocked")) status = "blocked";
  else if (all.some((t) => t.status === "at-risk")) status = "at-risk";
  else if (all.length > 0 && all.every((t) => t.status === "done")) status = "done";

  return {
    directChildren: tasks.filter((t) => t.parentId === taskId).length,
    descendants: subtree.length,
    hours: subtreeUpdates.reduce((sum, u) => sum + (u.hours ?? 0), 0),
    doneCount: subtree.filter((t) => t.status === "done").length,
    openBlockers,
    status,
  };
}

let idCounter = 0;
export function newTaskId(): string {
  idCounter += 1;
  return `task-${Date.now()}-${idCounter}`;
}

// ── Label tags (replaces priority in the Tasks UI) ──────────────────────

export const DEFAULT_LABEL_TAGS = [
  "High Priority",
  "Medium Priority",
  "Low Priority",
  "Milestone 1",
] as const;

export type DefaultLabelTag = (typeof DEFAULT_LABEL_TAGS)[number];

const PRIORITY_PRIORITY_TAGS = new Set<string>([
  "High Priority",
  "Medium Priority",
  "Low Priority",
]);

const LEGACY_MILESTONE_ALIASES = new Map<string, string>([
  ["milestone-1", "Milestone 1"],
  ["milestone 1", "Milestone 1"],
]);

/** Internal labels excluded from the Tasks label-tag UI. */
const HIDDEN_LABEL_TAGS = new Set(["daily-updates"]);

export const PRIORITY_TO_LABEL_TAG: Record<TaskPriority, DefaultLabelTag> = {
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

/** Canonical display name for a stored label tag value. */
export function normalizeLabelTag(tag: string): string {
  const trimmed = tag.trim();
  if (!trimmed) return trimmed;
  const alias = LEGACY_MILESTONE_ALIASES.get(trimmed.toLowerCase());
  if (alias) return alias;
  const match = DEFAULT_LABEL_TAGS.find((t) => t.toLowerCase() === trimmed.toLowerCase());
  return match ?? trimmed;
}

/** Lowercase, hyphen-normalized string for search/filter matching. */
export function normalizeLabelTagForSearch(tag: string): string {
  return normalizeLabelTag(tag).toLowerCase().replace(/[\s_-]+/g, " ").trim();
}

export function taskHasPriorityLabelTag(task: Task): boolean {
  return task.labels.some((l) => PRIORITY_PRIORITY_TAGS.has(normalizeLabelTag(l)));
}

/** Label tags shown in the Tasks table — includes a derived priority tag for legacy rows. */
export function getTaskLabelTags(task: Task): string[] {
  const normalized = task.labels
    .map(normalizeLabelTag)
    .filter(Boolean)
    .filter((tag) => !HIDDEN_LABEL_TAGS.has(tag.toLowerCase()));
  const unique = [...new Set(normalized)];
  if (!taskHasPriorityLabelTag(task)) {
    unique.unshift(PRIORITY_TO_LABEL_TAG[task.priority]);
  }
  return unique;
}

const MAX_VISIBLE_LABEL_TAGS = 2;

/** First N tags for table display plus overflow count (e.g. 5 tags → 2 visible, +3). */
export function getVisibleTaskLabelTags(task: Task): {
  visible: string[];
  overflow: number;
} {
  const tags = getTaskLabelTags(task);
  if (tags.length <= MAX_VISIBLE_LABEL_TAGS) {
    return { visible: tags, overflow: 0 };
  }
  return {
    visible: tags.slice(0, MAX_VISIBLE_LABEL_TAGS),
    overflow: tags.length - MAX_VISIBLE_LABEL_TAGS,
  };
}

export function derivePriorityFromLabelTags(tags: string[]): TaskPriority {
  const normalized = tags.map(normalizeLabelTag);
  if (normalized.includes("High Priority")) return "high";
  if (normalized.includes("Low Priority")) return "low";
  return "medium";
}

export function collectAvailableLabelTags(tasks: Task[], extra: string[] = []): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  const add = (tag: string) => {
    const normalized = normalizeLabelTag(tag);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    ordered.push(normalized);
  };
  for (const tag of DEFAULT_LABEL_TAGS) add(tag);
  for (const tag of extra) add(tag);
  for (const task of tasks) {
    for (const tag of getTaskLabelTags(task)) add(tag);
  }
  return ordered;
}

export function labelTagMatchesQuery(tag: string, query: string): boolean {
  const q = normalizeLabelTagForSearch(query);
  if (!q) return true;
  const normalized = normalizeLabelTagForSearch(tag);
  if (normalized.includes(q)) return true;
  const words = q.split(" ").filter(Boolean);
  return words.length > 1 && words.every((w) => normalized.includes(w));
}

export function taskLabelTagsMatchQuery(task: Task, query: string): boolean {
  return getTaskLabelTags(task).some((tag) => labelTagMatchesQuery(tag, query));
}

export function taskMatchesLabelTagFilter(task: Task, filterTag: string): boolean {
  if (filterTag === "all") return true;
  const target = normalizeLabelTagForSearch(filterTag);
  return getTaskLabelTags(task).some(
    (tag) => normalizeLabelTagForSearch(tag) === target,
  );
}

export function getLabelTagSortOrder(task: Task): number {
  const tags = getTaskLabelTags(task);
  if (tags.includes("High Priority")) return 0;
  if (tags.includes("Medium Priority")) return 1;
  if (tags.includes("Low Priority")) return 2;
  return 3;
}
