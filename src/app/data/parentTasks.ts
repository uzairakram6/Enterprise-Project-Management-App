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
    taskName: "Sumhuman — User Onboarding Flow",
    project: "Sumhuman",
    assignedTo: ["Ali Hassan", "Sara Ahmed"],
    dueDate: "2026-06-15",
    priority: "high",
    description: "Design and implement tenant-aware onboarding with role assignment",
    status: "active",
    createdBy: "Hamza Khan (PM)",
    createdDate: "2026-06-01",
  },
  {
    id: 2,
    taskName: "GTS — Route Optimization API",
    project: "GTS — Global Trash System",
    assignedTo: ["Usman Khan"],
    dueDate: "2026-06-20",
    priority: "high",
    description: "Build dispatch routing API for collection fleet scheduling",
    status: "active",
    createdBy: "Hamza Khan (PM)",
    createdDate: "2026-06-01",
  },
  {
    id: 3,
    taskName: "Bilingual Chatbot — NLP Pipeline",
    project: "Bilingual Chatbot",
    assignedTo: ["Fatima Malik", "Zainab Ali"],
    dueDate: "2026-06-18",
    priority: "medium",
    description: "Implement dual-language intent detection and response generation",
    status: "active",
    createdBy: "Hamza Khan (PM)",
    createdDate: "2026-06-03",
  },
];

export const PARENT_TASK_PROJECTS = [
  { id: 1, name: "Sumhuman" },
  { id: 2, name: "GTS — Global Trash System" },
  { id: 3, name: "Bilingual Chatbot" },
  { id: 4, name: "Friday" },
  { id: 5, name: "CIS CA" },
  { id: 6, name: "DMG" },
  { id: 7, name: "ALS" },
  { id: 8, name: "Vorpix" },
  { id: 9, name: "Navera" },
  { id: 10, name: "Deep Agents" },
];

export const PARENT_TASK_TEAM_MEMBERS = [
  "Ali Hassan",
  "Sara Ahmed",
  "Usman Khan",
  "Fatima Malik",
  "Ahmed Raza",
  "Zainab Ali",
];
