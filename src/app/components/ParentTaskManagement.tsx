import { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Plus, Save, Calendar as CalendarIcon, Edit2, Trash2, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "./ui/utils";
import {
  PARENT_TASK_PROJECTS,
  PARENT_TASK_TEAM_MEMBERS,
  type ParentTask,
} from "../data/parentTasks";

interface ParentTaskManagementProps {
  tasks: ParentTask[];
  onTasksChange: (tasks: ParentTask[]) => void;
  onViewTask: (taskId: number) => void;
}

const PRIORITY_DOT: Record<ParentTask["priority"], string> = {
  high: "bg-red-500",
  medium: "bg-blue-500",
  low: "bg-gray-400",
};

const PRIORITY_ORDER: Record<ParentTask["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function shortProjectName(name: string) {
  const words = name.split(" ");
  if (words.length <= 2) return name;
  return words.slice(0, 2).join(" ");
}

function sortTasks(tasks: ParentTask[]) {
  return [...tasks].sort((a, b) => {
    const dueDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (dueDiff !== 0) return dueDiff;
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });
}

function sortProjectGroups(groups: { project: string; tasks: ParentTask[] }[]) {
  return [...groups]
    .sort((a, b) => {
      if (a.tasks.length === 0 && b.tasks.length > 0) return 1;
      if (a.tasks.length > 0 && b.tasks.length === 0) return -1;
      if (a.tasks.length === 0 && b.tasks.length === 0) return a.project.localeCompare(b.project);

      const aEarliest = Math.min(...a.tasks.map((t) => new Date(t.dueDate).getTime()));
      const bEarliest = Math.min(...b.tasks.map((t) => new Date(t.dueDate).getTime()));
      return aEarliest - bEarliest;
    })
    .map((group) => ({
      ...group,
      tasks: sortTasks(group.tasks),
    }));
}

function TaskRow({
  task,
  onView,
  onEdit,
  onDelete,
}: {
  task: ParentTask;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li
      className="group flex items-center gap-2 px-2.5 py-2 hover:bg-muted/30 cursor-pointer transition-colors"
      onClick={onView}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full shrink-0", PRIORITY_DOT[task.priority])}
        title={`${task.priority} priority`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium truncate">{task.taskName}</p>
        <p className="text-[10px] text-muted-foreground truncate">
          Due {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          {" · "}
          {task.assignedTo.map((m) => m.split(" ")[0]).join(", ")}
        </p>
      </div>
      <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Edit2 className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0 group-hover:text-foreground" />
    </li>
  );
}

function ProjectTaskCard({
  project,
  projectTasks,
  listMaxHeight,
  onAdd,
  onViewTask,
  onEditTask,
  onDeleteTask,
}: {
  project: string;
  projectTasks: ParentTask[];
  listMaxHeight: string;
  onAdd: () => void;
  onViewTask: (id: number) => void;
  onEditTask: (task: ParentTask) => void;
  onDeleteTask: (id: number) => void;
}) {
  return (
    <Card className="flex flex-col overflow-hidden min-h-0">
      <div className="flex items-center justify-between gap-2 px-2.5 py-2 bg-muted/40 border-b shrink-0">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold truncate">{project}</h2>
          <p className="text-[10px] text-muted-foreground">
            {projectTasks.length} active · sorted by due date
          </p>
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] shrink-0" onClick={onAdd}>
          <Plus className="w-3 h-3 mr-0.5" />
          Add
        </Button>
      </div>

      {projectTasks.length === 0 ? (
        <div className="px-2.5 py-4 text-center shrink-0">
          <p className="text-[10px] text-muted-foreground">No tasks yet</p>
          <Button variant="link" size="sm" className="h-auto p-0 text-[10px] mt-0.5" onClick={onAdd}>
            Create first task
          </Button>
        </div>
      ) : (
        <ScrollArea className={cn("min-h-0", listMaxHeight)}>
          <ul className="divide-y">
            {projectTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onView={() => onViewTask(task.id)}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))}
          </ul>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      )}
    </Card>
  );
}

export default function ParentTaskManagement({ tasks, onTasksChange, onViewTask }: ParentTaskManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<ParentTask | null>(null);
  const [dueDate, setDueDate] = useState<Date>();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    taskName: "",
    project: "",
    priority: "medium" as const,
    description: "",
  });

  const toggleMember = (member: string) => {
    setSelectedMembers((current) =>
      current.includes(member) ? current.filter((m) => m !== member) : [...current, member],
    );
  };

  const handleEdit = (task: ParentTask) => {
    setEditingTask(task);
    setFormData({
      taskName: task.taskName,
      project: task.project,
      priority: task.priority,
      description: task.description,
    });
    setSelectedMembers(task.assignedTo);
    setDueDate(new Date(task.dueDate));
    setProjectFilter(task.project);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this parent task? All related daily updates will be affected.")) {
      onTasksChange(tasks.filter((t) => t.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.taskName || !formData.project || selectedMembers.length === 0 || !dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    const taskData: ParentTask = {
      id: editingTask ? editingTask.id : Date.now(),
      taskName: formData.taskName,
      project: formData.project,
      assignedTo: selectedMembers,
      dueDate: dueDate.toISOString().split("T")[0],
      priority: formData.priority,
      description: formData.description,
      status: editingTask ? editingTask.status : "active",
      createdBy: "Hamza Khan (PM)",
      createdDate: editingTask ? editingTask.createdDate : new Date().toISOString().split("T")[0],
    };

    if (editingTask) {
      onTasksChange(tasks.map((t) => (t.id === editingTask.id ? taskData : t)));
    } else {
      onTasksChange([taskData, ...tasks]);
    }

    setProjectFilter(formData.project);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ taskName: "", project: "", priority: "medium", description: "" });
    setSelectedMembers([]);
    setDueDate(undefined);
    setEditingTask(null);
    setShowForm(false);
  };

  const openCreateForProject = (project: string) => {
    setEditingTask(null);
    setFormData({ taskName: "", project, priority: "medium", description: "" });
    setSelectedMembers([]);
    setDueDate(undefined);
    setProjectFilter(project);
    setShowForm(true);
  };

  const activeTasks = tasks.filter((t) => t.status === "active");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const projectGroups = useMemo(() => {
    const taskProjects = [...new Set(activeTasks.map((t) => t.project))];
    const allProjects = [
      ...PARENT_TASK_PROJECTS.map((p) => p.name),
      ...taskProjects.filter((name) => !PARENT_TASK_PROJECTS.some((p) => p.name === name)),
    ];

    return sortProjectGroups(
      allProjects.map((project) => ({
        project,
        tasks: activeTasks.filter((t) => t.project === project),
      })),
    );
  }, [activeTasks]);

  const visibleGroups =
    projectFilter === "all"
      ? projectGroups
      : projectGroups.filter((g) => g.project === projectFilter);

  const groupsWithTasks = projectGroups.filter((g) => g.tasks.length > 0);
  const isSingleProjectView = projectFilter !== "all";

  return (
    <div className="flex flex-col min-h-full -m-2">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-2 pb-3 pt-1 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Parent Tasks</h1>
            <p className="text-[11px] text-muted-foreground">
              {activeTasks.length} active · {completedTasks.length} completed · {groupsWithTasks.length} projects
            </p>
          </div>
          <Button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            size="sm"
            className="gap-1.5 h-8 text-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {showForm ? "Cancel" : "New Task"}
          </Button>
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-1.5 pb-1">
            <button
              type="button"
              onClick={() => setProjectFilter("all")}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors border shrink-0",
                projectFilter === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40",
              )}
            >
              All ({activeTasks.length})
            </button>
            {projectGroups.map(({ project, tasks: projectTasks }) => (
              <button
                key={project}
                type="button"
                onClick={() => setProjectFilter(project)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors border shrink-0 max-w-[200px] truncate",
                  projectFilter === project
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40",
                )}
              >
                {shortProjectName(project)} ({projectTasks.length})
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {showForm && (
          <Card className="p-3 border-primary/20">
            <p className="text-xs font-semibold mb-2.5">
              {editingTask ? "Edit task" : "New parent task"}
              {formData.project ? ` · ${formData.project}` : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
              <Input
                className="h-8 text-xs"
                placeholder="Task name *"
                value={formData.taskName}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              />
              <Select value={formData.project} onValueChange={(val) => setFormData({ ...formData, project: val })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Project *" />
                </SelectTrigger>
                <SelectContent>
                  {PARENT_TASK_PROJECTS.map((project) => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={formData.priority}
                onValueChange={(val: ParentTask["priority"]) => setFormData({ ...formData, priority: val })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-full justify-start text-xs font-normal">
                    <CalendarIcon className="mr-1.5 h-3 w-3" />
                    {dueDate ? dueDate.toLocaleDateString() : "Due date *"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
                </PopoverContent>
              </Popover>
            </div>
            <Textarea
              className="text-xs min-h-[56px] mb-2"
              placeholder="Description (optional)"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="flex flex-wrap gap-1 mb-2">
              {PARENT_TASK_TEAM_MEMBERS.map((member) => (
                <Badge
                  key={member}
                  variant={selectedMembers.includes(member) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer text-[10px] px-1.5 py-0 h-5",
                    selectedMembers.includes(member) && "bg-primary",
                  )}
                  onClick={() => toggleMember(member)}
                >
                  {member}
                  {selectedMembers.includes(member) && <CheckCircle2 className="w-2.5 h-2.5 ml-0.5" />}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" className="gap-1 h-7 text-xs">
                <Save className="w-3 h-3" />
                {editingTask ? "Update" : "Create"}
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Scrollable task board */}
      <div className="flex-1 px-2 py-3 min-h-0">
        {isSingleProjectView ? (
          visibleGroups.map(({ project, tasks: projectTasks }) => (
            <ProjectTaskCard
              key={project}
              project={project}
              projectTasks={projectTasks}
              listMaxHeight="max-h-[calc(100vh-16rem)]"
              onAdd={() => openCreateForProject(project)}
              onViewTask={onViewTask}
              onEditTask={handleEdit}
              onDeleteTask={handleDelete}
            />
          ))
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 auto-rows-fr">
            {visibleGroups.map(({ project, tasks: projectTasks }) => (
              <ProjectTaskCard
                key={project}
                project={project}
                projectTasks={projectTasks}
                listMaxHeight="max-h-56"
                onAdd={() => openCreateForProject(project)}
                onViewTask={onViewTask}
                onEditTask={handleEdit}
                onDeleteTask={handleDelete}
              />
            ))}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center pt-3">
          Tasks sorted by due date · Click a row to view details
        </p>
      </div>
    </div>
  );
}
