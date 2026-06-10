export type UserStatus = "active" | "inactive" | "pending";
export type PermissionAction = "view" | "create" | "edit" | "delete" | "approve";

export interface ModulePermission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: ModulePermission[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  department: string;
  employeeId: string;
  location: string;
  reportingManager: string;
  status: UserStatus;
  lastActive: string;
  joinedDate: string;
  assignedProjects: string[];
  avatarColor: string;
}

export const MODULES = [
  "Dashboard",
  "Projects",
  "Daily Updates",
  "Resource Allocation",
  "Users",
  "Reports",
  "Workflows",
  "Settings",
] as const;

export const PERMISSION_ACTIONS: PermissionAction[] = [
  "view",
  "create",
  "edit",
  "delete",
  "approve",
];

export const DEPARTMENTS = [
  "Leadership",
  "Engineering",
  "Quality Assurance",
  "Product",
  "Operations",
] as const;

export const LOCATIONS = [
  "Karachi, PK",
  "Lahore, PK",
  "Islamabad, PK",
  "Remote",
] as const;

export function createEmptyPermissions(): ModulePermission[] {
  return MODULES.map((module) => ({
    module,
    view: false,
    create: false,
    edit: false,
    delete: false,
    approve: false,
  }));
}

export const ROLE_COLOR_OPTIONS = [
  { id: "purple", label: "Purple", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "blue", label: "Blue", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "teal", label: "Teal", color: "bg-teal-100 text-teal-700 border-teal-200" },
  { id: "sky", label: "Sky", color: "bg-sky-100 text-sky-700 border-sky-200" },
  { id: "amber", label: "Amber", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "rose", label: "Rose", color: "bg-rose-100 text-rose-700 border-rose-200" },
] as const;

function buildPermissions(
  overrides: Partial<Record<string, Partial<Record<PermissionAction, boolean>>>> = {}
): ModulePermission[] {
  return MODULES.map((module) => {
    const mod = overrides[module] ?? {};
    return {
      module,
      view: mod.view ?? false,
      create: mod.create ?? false,
      edit: mod.edit ?? false,
      delete: mod.delete ?? false,
      approve: mod.approve ?? false,
    };
  });
}

function fullAccess(): ModulePermission[] {
  return MODULES.map((module) => ({
    module,
    view: true,
    create: true,
    edit: true,
    delete: true,
    approve: true,
  }));
}

export type AppRoleId = "avp" | "engineer-manager" | "project-manager" | "employee";

export const SYSTEM_ROLE_IDS: AppRoleId[] = [
  "avp",
  "engineer-manager",
  "project-manager",
  "employee",
];

/** Maps sidebar page ids to permission module names. */
export const PAGE_MODULE_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  "daily-updates": "Daily Updates",
  updates: "Reports",
  tasks: "Projects",
  resources: "Resource Allocation",
  "resource-utilization": "Resource Allocation",
  users: "Users",
  roles: "Users",
};

export const ROLES: Role[] = [
  {
    id: "avp",
    name: "AVP",
    description: "Executive oversight across all projects and departments",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    permissions: fullAccess(),
  },
  {
    id: "engineer-manager",
    name: "Engineer Manager",
    description: "Technical leadership and team performance management",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    permissions: buildPermissions({
      Dashboard: { view: true },
      Projects: { view: true, create: true, edit: true },
      "Daily Updates": { view: true, edit: true, approve: true },
      "Resource Allocation": { view: true, create: true, edit: true },
      Reports: { view: true, create: true },
      Workflows: { view: true, edit: true },
    }),
  },
  {
    id: "project-manager",
    name: "Project Manager",
    description: "Project planning, tracking, and stakeholder communication",
    color: "bg-teal-100 text-teal-700 border-teal-200",
    permissions: buildPermissions({
      Dashboard: { view: true },
      Projects: { view: true, create: true, edit: true },
      "Daily Updates": { view: true, create: true, edit: true, approve: true },
      "Resource Allocation": { view: true, edit: true },
      Reports: { view: true, create: true },
      Workflows: { view: true },
    }),
  },
  {
    id: "employee",
    name: "Employee",
    description: "Day-to-day project work and daily update submissions",
    color: "bg-sky-100 text-sky-700 border-sky-200",
    permissions: buildPermissions({
      Dashboard: { view: true },
      Projects: { view: true },
      "Daily Updates": { view: true, create: true, edit: true },
    }),
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: "Hamza Khan",
    email: "hamza.khan@techverx.com",
    phone: "+92 300 1234567",
    roleId: "avp",
    department: "Leadership",
    employeeId: "EMP-001",
    location: "Karachi, PK",
    reportingManager: "—",
    status: "active",
    lastActive: "2 min ago",
    joinedDate: "2022-03-15",
    assignedProjects: ["Sumhuman", "T360 View Engine"],
    avatarColor: "from-blue-500 to-purple-600",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    email: "sara.ahmed@techverx.com",
    phone: "+92 301 2345678",
    roleId: "engineer-manager",
    department: "Engineering",
    employeeId: "EMP-012",
    location: "Lahore, PK",
    reportingManager: "Hamza Khan",
    status: "active",
    lastActive: "15 min ago",
    joinedDate: "2023-01-10",
    assignedProjects: ["Sumhuman", "GTS — Global Trash System"],
    avatarColor: "from-pink-500 to-rose-500",
  },
  {
    id: 3,
    name: "Muhammad Ali",
    email: "muhammad.ali@techverx.com",
    phone: "+92 302 3456789",
    roleId: "employee",
    department: "Engineering",
    employeeId: "EMP-034",
    location: "Karachi, PK",
    reportingManager: "Sara Ahmed",
    status: "active",
    lastActive: "1 hour ago",
    joinedDate: "2023-06-20",
    assignedProjects: ["T360 View Engine", "Bilingual Chatbot"],
    avatarColor: "from-emerald-500 to-teal-500",
  },
  {
    id: 4,
    name: "Fatima Malik",
    email: "fatima.malik@techverx.com",
    phone: "+92 303 4567890",
    roleId: "project-manager",
    department: "Engineering",
    employeeId: "EMP-021",
    location: "Islamabad, PK",
    reportingManager: "Hamza Khan",
    status: "active",
    lastActive: "3 hours ago",
    joinedDate: "2022-11-05",
    assignedProjects: ["Friday", "CIS CA"],
    avatarColor: "from-violet-500 to-purple-500",
  },
  {
    id: 5,
    name: "Usman Khan",
    email: "usman.khan@techverx.com",
    phone: "+92 304 5678901",
    roleId: "employee",
    department: "Engineering",
    employeeId: "EMP-045",
    location: "Remote",
    reportingManager: "Sara Ahmed",
    status: "active",
    lastActive: "5 hours ago",
    joinedDate: "2024-02-14",
    assignedProjects: ["DMG", "Deep Agents"],
    avatarColor: "from-orange-500 to-amber-500",
  },
  {
    id: 6,
    name: "Zainab Ali",
    email: "zainab.ali@techverx.com",
    phone: "+92 305 6789012",
    roleId: "employee",
    department: "Quality Assurance",
    employeeId: "EMP-056",
    location: "Lahore, PK",
    reportingManager: "Fatima Malik",
    status: "active",
    lastActive: "Yesterday",
    joinedDate: "2023-09-01",
    assignedProjects: ["Bilingual Chatbot", "Navera"],
    avatarColor: "from-cyan-500 to-blue-500",
  },
  {
    id: 7,
    name: "Aries",
    email: "aries@techverx.com",
    phone: "+92 306 7890123",
    roleId: "avp",
    department: "Leadership",
    employeeId: "EMP-003",
    location: "Karachi, PK",
    reportingManager: "Hamza Khan",
    status: "active",
    lastActive: "30 min ago",
    joinedDate: "2021-08-22",
    assignedProjects: ["GTS — Global Trash System", "Vorpix"],
    avatarColor: "from-indigo-500 to-blue-600",
  },
  {
    id: 8,
    name: "Manohar",
    email: "manohar@techverx.com",
    phone: "+92 307 8901234",
    roleId: "project-manager",
    department: "Engineering",
    employeeId: "EMP-008",
    location: "Karachi, PK",
    reportingManager: "Aries",
    status: "active",
    lastActive: "4 hours ago",
    joinedDate: "2022-05-18",
    assignedProjects: ["Sumhuman", "ALS"],
    avatarColor: "from-green-500 to-emerald-600",
  },
  {
    id: 9,
    name: "Mahnoor",
    email: "mahnoor@techverx.com",
    phone: "+92 308 9012345",
    roleId: "project-manager",
    department: "Operations",
    employeeId: "EMP-019",
    location: "Islamabad, PK",
    reportingManager: "Aries",
    status: "inactive",
    lastActive: "2 weeks ago",
    joinedDate: "2023-03-12",
    assignedProjects: ["CIS CA"],
    avatarColor: "from-fuchsia-500 to-pink-500",
  },
  {
    id: 10,
    name: "Sheroz",
    email: "sheroz@techverx.com",
    phone: "+92 309 0123456",
    roleId: "employee",
    department: "Engineering",
    employeeId: "EMP-067",
    location: "Lahore, PK",
    reportingManager: "Sara Ahmed",
    status: "inactive",
    lastActive: "1 month ago",
    joinedDate: "2024-01-08",
    assignedProjects: ["DMG"],
    avatarColor: "from-slate-500 to-gray-600",
  },
  {
    id: 11,
    name: "Uzair",
    email: "uzair@techverx.com",
    phone: "+92 310 1234560",
    roleId: "engineer-manager",
    department: "Engineering",
    employeeId: "EMP-015",
    location: "Karachi, PK",
    reportingManager: "Hamza Khan",
    status: "active",
    lastActive: "1 day ago",
    joinedDate: "2022-09-30",
    assignedProjects: ["Bilingual Chatbot", "Navera"],
    avatarColor: "from-red-500 to-orange-500",
  },
  {
    id: 12,
    name: "Khalid",
    email: "khalid@techverx.com",
    phone: "+92 311 2345671",
    roleId: "avp",
    department: "Leadership",
    employeeId: "EMP-005",
    location: "Karachi, PK",
    reportingManager: "Hamza Khan",
    status: "pending",
    lastActive: "Never",
    joinedDate: "2026-06-01",
    assignedProjects: [],
    avatarColor: "from-yellow-500 to-amber-500",
  },
];

export function getRoleById(roleId: string): Role | undefined {
  return ROLES.find((r) => r.id === roleId);
}

export function findRoleById(roleId: string, roleList: Role[]): Role | undefined {
  return roleList.find((r) => r.id === roleId);
}

export function canViewModule(role: Role | undefined, module: string): boolean {
  if (!role) return false;
  const permission = role.permissions.find((p) => p.module === module);
  return permission?.view ?? false;
}

export function canAccessPage(role: Role | undefined, pageId: string): boolean {
  const module = PAGE_MODULE_MAP[pageId];
  if (!module) return true;
  return canViewModule(role, module);
}

export function getUserInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getUsersByRole(roleId: string, users: User[]): User[] {
  return users.filter((u) => u.roleId === roleId);
}

export function countUsersByStatus(users: User[]) {
  return {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    pending: users.filter((u) => u.status === "pending").length,
  };
}

export function countUsersPerRole(roleId: string, users: User[]): number {
  return users.filter((u) => u.roleId === roleId).length;
}
