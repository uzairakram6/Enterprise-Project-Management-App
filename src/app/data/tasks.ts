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
  { id: "mtp", name: "Multi-Tenancy Platform", type: "Client Project", icon: "🏢", iconBg: "bg-blue-100 text-blue-600" },
  { id: "portal", name: "Customer Portal Redesign", type: "Client Project", icon: "📊", iconBg: "bg-purple-100 text-purple-600" },
  { id: "mobile", name: "Mobile App Development", type: "Client Project", icon: "📱", iconBg: "bg-green-100 text-green-600" },
  { id: "gateway", name: "API Gateway Modernization", type: "Internal Project", icon: "🔧", iconBg: "bg-amber-100 text-amber-600" },
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

// Deep dummy tree (up to 5 levels) to exercise the n-level UI.
export const INITIAL_TASKS: Task[] = [
  // ── Multi-Tenancy Platform ────────────────────────────────────────────
  {
    id: "mt-db",
    projectId: "mtp",
    parentId: null,
    title: "Multi-Tenancy – Database Schema",
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
    projectId: "mtp",
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
    projectId: "mtp",
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
    projectId: "mtp",
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
    projectId: "mtp",
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
    projectId: "mtp",
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
    projectId: "mtp",
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
    projectId: "mtp",
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
    projectId: "mtp",
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
    projectId: "mtp",
    parentId: null,
    title: "Multi-Tenancy – API Layer",
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
    projectId: "mtp",
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
    projectId: "mtp",
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
    projectId: "mtp",
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
    projectId: "mtp",
    parentId: "mt-api-ctx",
    title: "Header propagation",
    assignees: ["Usman Khan"],
    priority: "low",
    labels: [],
    status: "doing",
    createdBy: "Usman Khan",
    createdAt: "2026-06-05",
  },

  // ── Customer Portal Redesign ──────────────────────────────────────────
  {
    id: "cp-ui",
    projectId: "portal",
    parentId: null,
    title: "Customer Portal – UI Components",
    description: "Design and implement reusable React components for customer portal",
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
    projectId: "portal",
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
    projectId: "portal",
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
    projectId: "portal",
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
    projectId: "portal",
    parentId: "cp-ui-forms",
    title: "Validation states",
    assignees: ["Zainab Ali"],
    priority: "low",
    labels: [],
    status: "doing",
    createdBy: "Zainab Ali",
    createdAt: "2026-06-06",
  },

  // ── Mobile App Development ────────────────────────────────────────────
  {
    id: "mob-auth",
    projectId: "mobile",
    parentId: null,
    title: "Authentication",
    description: "Mobile auth flows including biometrics",
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
    projectId: "mobile",
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
    projectId: "mobile",
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
