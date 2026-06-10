import React, { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Menu,
  X,
  ClipboardList,
  UserCircle,
  ListChecks,
  CalendarRange,
  type LucideIcon,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Badge } from "./components/ui/badge";
import Dashboard from "./components/Dashboard";
import ProjectsView from "./components/ProjectsView";
import WeeklyUpdatesView from "./components/WeeklyUpdatesView";
import ResourceAllocation from "./components/ResourceAllocation";
import NewProject from "./components/NewProject";
import ProjectDetails from "./components/ProjectDetails";
import ProjectSettings from "./components/ProjectSettings";
import ViewReports from "./components/ViewReports";
import WeekUpdateView from "./components/WeekUpdateView";
import ProjectWorkflowSettings from "./components/ProjectWorkflowSettings";
import DailyUpdates from "./components/DailyUpdates";
import { DEFAULT_PROJECT_NAME } from "./data/projects";
import ParentTaskManagement from "./components/ParentTaskManagement";
import ParentTaskDetails from "./components/ParentTaskDetails";
import { INITIAL_PARENT_TASKS, type ParentTask } from "./data/parentTasks";
import { Toaster } from "./components/ui/sonner";

type Page = "dashboard" | "projects" | "updates" | "daily-updates" | "parent-tasks" | "resources";
type SubPage =
  | "new-project"
  | "edit-project"
  | "project-details"
  | "view-reports"
  | "week-update"
  | "project-workflows"
  | "project-settings"
  | "parent-task-details"
  | null;

type NavItem = {
  id: Page;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
};

const navigation: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "daily-updates", label: "Daily Updates", icon: ClipboardList },
  { id: "updates", label: "Weekly Updates", icon: CalendarRange },
  { id: "parent-tasks", label: "Parent Tasks", icon: ListChecks },
  { id: "resources", label: "Resource Allocation", icon: Users },
];

type UserRole = "pm" | "dm" | "em" | "developer" | "admin";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [currentSubPage, setCurrentSubPage] = useState<SubPage>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null);
  const [selectedParentTaskId, setSelectedParentTaskId] = useState<number | null>(null);
  const [parentTasks, setParentTasks] = useState<ParentTask[]>(INITIAL_PARENT_TASKS);
  const [userRole, setUserRole] = useState<UserRole>("pm");

  const handleNewProject = () => {
    setCurrentSubPage("new-project");
  };

  const handleViewDetails = (projectId: number) => {
    setSelectedProjectId(projectId);
    setCurrentSubPage("project-details");
  };

  const handleViewReports = (projectId: number) => {
    setSelectedProjectId(projectId);
    setCurrentSubPage("view-reports");
  };

  const handleWeekClick = (projectId: number, weekNumber: number) => {
    setSelectedProjectId(projectId);
    setSelectedWeekNumber(weekNumber);
    setCurrentSubPage("week-update");
  };

  const handleBackToMain = () => {
    setCurrentSubPage(null);
    setSelectedProjectId(null);
    setSelectedWeekNumber(null);
    setSelectedParentTaskId(null);
  };

  const handleViewParentTask = (taskId: number) => {
    setSelectedParentTaskId(taskId);
    setCurrentSubPage("parent-task-details");
  };

  const handleBackToParentTasks = () => {
    setCurrentSubPage(null);
    setSelectedParentTaskId(null);
  };

  const handleManageWorkflows = (projectId: number) => {
    setSelectedProjectId(projectId);
    setCurrentSubPage("project-workflows");
  };

  const handleProjectSettings = (projectId: number) => {
    setSelectedProjectId(projectId);
    setCurrentSubPage("project-settings");
  };

  const handleEditProject = () => {
    setCurrentSubPage("edit-project");
  };

  const handleDeleteProject = () => {
    // Delete project logic here
    alert("Project deleted successfully");
    handleBackToMain();
  };

  const renderPage = () => {
    // Render subpages first if active
    if (currentSubPage === "new-project") {
      return <NewProject onBack={handleBackToMain} />;
    }
    if (currentSubPage === "edit-project") {
      return <NewProject onBack={handleBackToMain} isEditMode={true} />;
    }
    if (currentSubPage === "project-details") {
      return (
        <ProjectDetails
          onBack={handleBackToMain}
          onManageWorkflows={() => selectedProjectId && handleManageWorkflows(selectedProjectId)}
          onProjectSettings={() => selectedProjectId && handleProjectSettings(selectedProjectId)}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onViewWeekUpdate={(weekNumber) => handleWeekClick(selectedProjectId || 1, weekNumber)}
          userRole={userRole}
        />
      );
    }
    if (currentSubPage === "project-workflows") {
      return <ProjectWorkflowSettings onBack={handleBackToMain} />;
    }
    if (currentSubPage === "project-settings") {
      return (
        <ProjectSettings
          onBack={() => setCurrentSubPage("project-details")}
          onManageWorkflows={() => selectedProjectId && handleManageWorkflows(selectedProjectId)}
        />
      );
    }
    if (currentSubPage === "view-reports") {
      return <ViewReports onBack={handleBackToMain} />;
    }
    if (currentSubPage === "week-update" && selectedWeekNumber) {
      return (
        <WeekUpdateView
          weekNumber={selectedWeekNumber}
          projectName={DEFAULT_PROJECT_NAME}
          onBack={handleBackToMain}
        />
      );
    }
    if (currentSubPage === "parent-task-details" && selectedParentTaskId) {
      const selectedParentTask = parentTasks.find((task) => task.id === selectedParentTaskId);
      if (!selectedParentTask) {
        handleBackToParentTasks();
        return null;
      }
      return <ParentTaskDetails task={selectedParentTask} onBack={handleBackToParentTasks} />;
    }

    // Render main pages
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onViewProject={handleViewDetails} />;
      case "projects":
        return (
          <ProjectsView
            onNewProject={handleNewProject}
            onViewDetails={handleViewDetails}
            onViewReports={handleViewReports}
            onWeekClick={handleWeekClick}
          />
        );
      case "updates":
        return <WeeklyUpdatesView />;
      case "daily-updates":
        return <DailyUpdates />;
      case "parent-tasks":
        return (
          <ParentTaskManagement
            tasks={parentTasks}
            onTasksChange={setParentTasks}
            onViewTask={handleViewParentTask}
          />
        );
      case "resources":
        return <ResourceAllocation />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="size-full flex bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-card border-r border-border transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">PM</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">Project Manager</h2>
              <p className="text-xs text-muted-foreground">Enterprise Edition</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id && !currentSubPage;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setCurrentSubPage(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge != null && (
                  <Badge variant="destructive" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-blue-900">
              <strong>T360 View:</strong> Complete visibility across projects, resources, and performance
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <p className="font-medium">Hamza Khan</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Week</p>
              <p className="font-medium">Week 23, 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-muted-foreground" />
              <Select value={userRole} onValueChange={(val: UserRole) => setUserRole(val)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pm">Project Manager</SelectItem>
                  <SelectItem value="dm">Delivery Manager</SelectItem>
                  <SelectItem value="em">Engineering Mgr</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">HK</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderPage()}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
