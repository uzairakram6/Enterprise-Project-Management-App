export interface ParentTask {
  id: number;
  taskName: string;
  project: string;
  assignedTo: string[];
  dueDate: string;
  priority: "low" | "medium" | "high";
  description: string;
  status: "active" | "completed" | "on-hold";
  createdBy: string;
  createdDate: string;
}

export const INITIAL_PARENT_TASKS: ParentTask[] = [
  {
    id: 1,
    taskName: "Multi-Tenancy - Database Schema",
    project: "Multi-Tenancy Platform",
    assignedTo: ["Ali Hassan", "Sara Ahmed"],
    dueDate: "2026-06-15",
    priority: "high",
    description: "Implement tenant isolation at database level with RLS policies",
    status: "active",
    createdBy: "Hamza Khan (PM)",
    createdDate: "2026-06-01",
  },
  {
    id: 2,
    taskName: "Multi-Tenancy - API Layer",
    project: "Multi-Tenancy Platform",
    assignedTo: ["Usman Khan"],
    dueDate: "2026-06-20",
    priority: "high",
    description: "Build API middleware for tenant context injection",
    status: "active",
    createdBy: "Hamza Khan (PM)",
    createdDate: "2026-06-01",
  },
  {
    id: 3,
    taskName: "Customer Portal - UI Components",
    project: "Customer Portal Redesign",
    assignedTo: ["Fatima Malik", "Zainab Ali"],
    dueDate: "2026-06-18",
    priority: "medium",
    description: "Design and implement reusable React components for customer portal",
    status: "active",
    createdBy: "Hamza Khan (PM)",
    createdDate: "2026-06-03",
  },
];

export const PARENT_TASK_PROJECTS = [
  { id: 1, name: "Multi-Tenancy Platform" },
  { id: 2, name: "Customer Portal Redesign" },
  { id: 3, name: "Mobile App Development" },
  { id: 4, name: "API Gateway Modernization" },
];

export const PARENT_TASK_TEAM_MEMBERS = [
  "Ali Hassan",
  "Sara Ahmed",
  "Usman Khan",
  "Fatima Malik",
  "Ahmed Raza",
  "Zainab Ali",
];
