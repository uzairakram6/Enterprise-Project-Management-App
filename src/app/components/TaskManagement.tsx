import { useMemo, useState, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import {
  Plus,
  Save,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  ListTree,
  CornerDownRight,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { cn } from "./ui/utils";
import {
  PROJECTS,
  TEAM_MEMBERS,
  getRollup,
  getRootTasks,
  getChildren,
  getAncestors,
  getSubtree,
  newTaskId,
  collectAvailableLabelTags,
  derivePriorityFromLabelTags,
  getTaskLabelTags,
  getVisibleTaskLabelTags,
  getLabelTagSortOrder,
  taskLabelTagsMatchQuery,
  taskMatchesLabelTagFilter,
  type Task,
  type TaskStatus,
  type TaskUpdate,
} from "../data/tasks";
import LabelTagSelect from "./LabelTagSelect";

interface TaskManagementProps {
  tasks: Task[];
  updates: TaskUpdate[];
  onTasksChange: (tasks: Task[]) => void;
  onViewTask: (taskId: string) => void;
}

const STATUS_DOT: Record<TaskStatus, string> = {
  doing: "bg-blue-500",
  done: "bg-green-500",
  "at-risk": "bg-amber-500",
  blocked: "bg-red-500",
  "on-hold": "bg-gray-400",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  doing: "Doing",
  done: "Done",
  "at-risk": "At Risk",
  blocked: "Blocked",
  "on-hold": "On Hold",
};

const LABEL_TAG_BADGE: Record<string, string> = {
  "High Priority": "bg-red-100 text-red-700 border-red-200",
  "Medium Priority": "bg-amber-100 text-amber-700 border-amber-200",
  "Low Priority": "bg-blue-100 text-blue-700 border-blue-200",
  "Milestone 1": "bg-purple-100 text-purple-700 border-purple-200",
};

function labelTagBadgeClass(tag: string): string {
  return LABEL_TAG_BADGE[tag] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

const STATUS_BADGE: Record<TaskStatus, string> = {
  doing: "bg-blue-50 text-blue-700 border-blue-200",
  done: "bg-green-50 text-green-700 border-green-200",
  "at-risk": "bg-amber-50 text-amber-700 border-amber-200",
  blocked: "bg-red-50 text-red-700 border-red-200",
  "on-hold": "bg-gray-100 text-gray-700 border-gray-200",
};

const TASK_GRID_COLUMNS =
  "grid-cols-[minmax(16rem,1fr)_minmax(10.5rem,12rem)_7rem_6.5rem_5rem_7rem]";

interface FilterState {
  project: string;
  status: string;
  labelTag: string;
  assignee: string;
  hasBlockers: string;
  overdue: string;
}

const EMPTY_FILTERS: FilterState = {
  project: "all",
  status: "all",
  labelTag: "all",
  assignee: "all",
  hasBlockers: "all",
  overdue: "all",
};

function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === "done") return false;
  return new Date(task.dueDate) < new Date();
}

function matchesTask(
  task: Task,
  filters: FilterState,
  search: string,
  tasks: Task[],
  updates: TaskUpdate[],
): boolean {
  // Project filter
  if (filters.project !== "all" && task.projectId !== filters.project) return false;

  // Status filter
  if (filters.status !== "all" && task.status !== filters.status) return false;

  // Label tag filter
  if (!taskMatchesLabelTagFilter(task, filters.labelTag)) return false;

  // Assignee filter
  if (filters.assignee !== "all") {
    if (filters.assignee === "unassigned") {
      if (task.assignees.length > 0) return false;
    } else if (!task.assignees.includes(filters.assignee)) {
      return false;
    }
  }

  // Has blockers filter
  if (filters.hasBlockers !== "all") {
    const rollup = getRollup(tasks, updates, task.id);
    const hasBlockers = rollup.openBlockers > 0;
    if (filters.hasBlockers === "yes" && !hasBlockers) return false;
    if (filters.hasBlockers === "no" && hasBlockers) return false;
  }

  // Overdue filter
  if (filters.overdue !== "all") {
    const overdue = isOverdue(task);
    if (filters.overdue === "yes" && !overdue) return false;
    if (filters.overdue === "no" && overdue) return false;
  }

  // Search
  if (search) {
    const q = search.toLowerCase();
    const inTitle = task.title.toLowerCase().includes(q);
    const inDesc = task.description?.toLowerCase().includes(q) ?? false;
    const inLabelTags = taskLabelTagsMatchQuery(task, q);
    const inAssignees = task.assignees.some((a) => a.toLowerCase().includes(q));
    if (!inTitle && !inDesc && !inLabelTags && !inAssignees) return false;
  }

  return true;
}

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const priorityDiff = getLabelTagSortOrder(a) - getLabelTagSortOrder(b);
    if (priorityDiff !== 0) return priorityDiff;
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    return a.title.localeCompare(b.title);
  });
}

interface VisibleRow {
  task: Task;
  level: number;
  hasChildren: boolean;
}

function buildVisibleRows(
  tasks: Task[],
  expanded: Set<string>,
  filters: FilterState,
  search: string,
  updates: TaskUpdate[],
): VisibleRow[] {
  const searchTrimmed = search.trim();
  const isSearchActive = searchTrimmed.length > 0;

  // Determine which tasks match filters+search
  const directMatches = new Set<string>();
  for (const task of tasks) {
    if (matchesTask(task, filters, searchTrimmed, tasks, updates)) {
      directMatches.add(task.id);
    }
  }

  // In search mode, also include ancestors of matches so the tree is reachable
  const visibleIds = new Set(directMatches);
  if (isSearchActive) {
    for (const id of directMatches) {
      const ancestors = getAncestors(tasks, id);
      for (const a of ancestors) visibleIds.add(a.id);
    }
  }

  // Also include any task that has a visible descendant (so the expand chevron shows)
  const hasVisibleDescendant = new Set<string>();
  for (const task of tasks) {
    if (task.parentId && visibleIds.has(task.id)) {
      hasVisibleDescendant.add(task.parentId);
    }
  }
  // Propagate up
  let changed = true;
  while (changed) {
    changed = false;
    for (const task of tasks) {
      if (task.parentId && hasVisibleDescendant.has(task.id) && !hasVisibleDescendant.has(task.parentId)) {
        hasVisibleDescendant.add(task.parentId);
        changed = true;
      }
    }
  }

  // Build rows recursively
  const rows: VisibleRow[] = [];

  function walk(parentId: string | null, level: number) {
    let children = getChildren(tasks, parentId);
    children = sortTasks(children);

    for (const child of children) {
      const isVisible = visibleIds.has(child.id) || hasVisibleDescendant.has(child.id);
      if (!isVisible) continue;

      const childVisibleIds = getChildren(tasks, child.id)
        .filter((c) => visibleIds.has(c.id) || hasVisibleDescendant.has(c.id))
        .map((c) => c.id);
      const hasChildren = childVisibleIds.length > 0;

      rows.push({ task: child, level, hasChildren });

      const isExpanded = expanded.has(child.id) || isSearchActive;
      if (isExpanded && hasChildren) {
        walk(child.id, level + 1);
      }
    }
  }

  walk(null, 0);
  return rows;
}

function activeFilterCount(filters: FilterState): number {
  let count = 0;
  for (const [key, val] of Object.entries(filters)) {
    if (val !== "all") count++;
  }
  return count;
}

export default function TaskManagement({
  tasks,
  updates,
  onTasksChange,
  onViewTask,
}: TaskManagementProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [subtaskFormParentId, setSubtaskFormParentId] = useState<string | null>(null);
  const [customLabelTags, setCustomLabelTags] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    projectId: "",
    labelTags: ["Medium Priority"] as string[],
    description: "",
    dueDate: "",
    assignees: [] as string[],
  });

  const availableLabelTags = useMemo(
    () => collectAvailableLabelTags(tasks, customLabelTags),
    [tasks, customLabelTags],
  );

  const visibleRows = useMemo(
    () => buildVisibleRows(tasks, expanded, filters, search, updates),
    [tasks, expanded, filters, search, updates],
  );

  const rootTasks = useMemo(() => getRootTasks(tasks), [tasks]);
  const activeRoots = rootTasks.filter((t) => t.status !== "done");
  const completedRoots = rootTasks.filter((t) => t.status === "done");

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const all = new Set<string>();
    for (const row of visibleRows) {
      if (row.hasChildren) all.add(row.task.id);
    }
    setExpanded(all);
  }, [visibleRows]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set());
  }, []);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      projectId: task.projectId,
      labelTags: getTaskLabelTags(task),
      description: task.description ?? "",
      dueDate: task.dueDate ?? "",
      assignees: [...task.assignees],
    });
    setShowForm(true);
    setSubtaskFormParentId(null);
  };

  const handleDelete = (id: string) => {
    const descendants = getSubtree(tasks, id);
    const message =
      descendants.length > 0
        ? `Delete this task and its ${descendants.length} nested subtask${descendants.length > 1 ? "s" : ""}?`
        : "Delete this task?";
    if (confirm(message)) {
      const removed = new Set([id, ...descendants.map((t) => t.id)]);
      onTasksChange(tasks.filter((t) => !removed.has(t.id)));
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.projectId) {
      alert("Please fill in all required fields");
      return;
    }

    const labelTags = formData.labelTags.map((tag) => tag.trim()).filter(Boolean);
    const priority = derivePriorityFromLabelTags(labelTags);

    if (editingTask) {
      onTasksChange(
        tasks.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: formData.title,
                projectId: formData.projectId,
                priority,
                labels: labelTags,
                description: formData.description || undefined,
                dueDate: formData.dueDate || undefined,
                assignees: formData.assignees,
              }
            : t,
        ),
      );
    } else if (subtaskFormParentId) {
      const parent = tasks.find((t) => t.id === subtaskFormParentId);
      const newTask: Task = {
        id: newTaskId(),
        projectId: parent?.projectId ?? formData.projectId,
        parentId: subtaskFormParentId,
        title: formData.title,
        description: formData.description || undefined,
        assignees: formData.assignees,
        dueDate: formData.dueDate || undefined,
        priority,
        labels: labelTags,
        status: "doing",
        createdBy: "Hamza Khan (PM)",
        createdAt: new Date().toISOString().split("T")[0],
      };
      onTasksChange([...tasks, newTask]);
      setExpanded((prev) => new Set(prev).add(subtaskFormParentId));
    } else {
      const newTask: Task = {
        id: newTaskId(),
        projectId: formData.projectId,
        parentId: null,
        title: formData.title,
        description: formData.description || undefined,
        assignees: formData.assignees,
        dueDate: formData.dueDate || undefined,
        priority,
        labels: labelTags,
        status: "doing",
        createdBy: "Hamza Khan (PM)",
        createdAt: new Date().toISOString().split("T")[0],
      };
      onTasksChange([newTask, ...tasks]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      projectId: "",
      labelTags: ["Medium Priority"],
      description: "",
      dueDate: "",
      assignees: [],
    });
    setEditingTask(null);
    setSubtaskFormParentId(null);
    setShowForm(false);
  };

  const openCreateTopLevel = () => {
    setEditingTask(null);
    setSubtaskFormParentId(null);
    setFormData({
      title: "",
      projectId: "",
      labelTags: ["Medium Priority"],
      description: "",
      dueDate: "",
      assignees: [],
    });
    setShowForm(true);
  };

  const openCreateSubtask = (parentId: string) => {
    const parent = tasks.find((t) => t.id === parentId);
    setEditingTask(null);
    setSubtaskFormParentId(parentId);
    setFormData({
      title: "",
      projectId: parent?.projectId ?? "",
      labelTags: parent ? getTaskLabelTags(parent) : ["Medium Priority"],
      description: "",
      dueDate: "",
      assignees: parent?.assignees ? [...parent.assignees] : [],
    });
    setShowForm(true);
  };

  const projectName = (id: string) =>
    PROJECTS.find((p) => p.id === id)?.name ?? id;

  const filterCount = activeFilterCount(filters);

  return (
    <div className="flex flex-col min-h-full -m-2 bg-slate-50/70">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-5 pb-4 pt-4 space-y-4 shadow-sm shadow-slate-200/60">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-slate-950">Tasks</h1>
            <p className="mt-1 text-sm text-slate-600">
              {activeRoots.length} active · {completedRoots.length} completed ·{" "}
              {rootTasks.length} top-level · {tasks.length} total tasks
            </p>
          </div>
          <Button
            onClick={() => (showForm ? resetForm() : openCreateTopLevel())}
            className="gap-2 h-10 px-4 text-sm shrink-0 rounded-lg shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            {showForm ? "Cancel" : "New Task"}
          </Button>
        </div>

        {/* Search + filter toggle */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              placeholder="Search tasks, descriptions, label tags, assignees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-slate-100/80 pl-12 pr-10 text-base shadow-inner shadow-slate-200/50 placeholder:text-slate-500 focus-visible:bg-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className={cn(
                "h-11 gap-2 rounded-xl border-slate-200 bg-white px-4 text-sm shadow-sm shrink-0",
                filterCount > 0 && "border-primary/50 bg-blue-50 text-primary",
              )}
              onClick={() => setShowFilters((s) => !s)}
            >
              <Filter className="w-4 h-4" />
              Filters
              {filterCount > 0 && (
                <Badge variant="secondary" className="ml-0.5 h-5 rounded-md px-1.5 text-xs">
                  {filterCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              className="h-11 rounded-xl px-3 text-sm text-slate-700 shrink-0 hover:bg-slate-100"
              onClick={expandAll}
              title="Expand all"
            >
              <ChevronDown className="w-4 h-4 mr-1" />
              Expand
            </Button>
            <Button
              variant="ghost"
              className="h-11 rounded-xl px-3 text-sm text-slate-700 shrink-0 hover:bg-slate-100"
              onClick={collapseAll}
              title="Collapse all"
            >
              <ChevronRight className="w-4 h-4 mr-1" />
              Collapse
            </Button>
          </div>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <Select
              value={filters.project}
              onValueChange={(v) => setFilters((f) => ({ ...f, project: v }))}
            >
              <SelectTrigger className="h-10 w-[170px] text-sm">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {PROJECTS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            >
              <SelectTrigger className="h-10 w-[145px] text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="doing">Doing</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.labelTag}
              onValueChange={(v) => setFilters((f) => ({ ...f, labelTag: v }))}
            >
              <SelectTrigger className="h-10 w-[155px] text-sm">
                <SelectValue placeholder="Label tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Label tags</SelectItem>
                {availableLabelTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.assignee}
              onValueChange={(v) => setFilters((f) => ({ ...f, assignee: v }))}
            >
              <SelectTrigger className="h-10 w-[175px] text-sm">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {TEAM_MEMBERS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.hasBlockers}
              onValueChange={(v) => setFilters((f) => ({ ...f, hasBlockers: v }))}
            >
              <SelectTrigger className="h-10 w-[155px] text-sm">
                <SelectValue placeholder="Blockers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Has Blockers</SelectItem>
                <SelectItem value="no">No Blockers</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.overdue}
              onValueChange={(v) => setFilters((f) => ({ ...f, overdue: v }))}
            >
              <SelectTrigger className="h-10 w-[145px] text-sm">
                <SelectValue placeholder="Overdue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Overdue</SelectItem>
                <SelectItem value="no">Not Overdue</SelectItem>
              </SelectContent>
            </Select>

            {filterCount > 0 && (
              <Button
                variant="ghost"
                className="h-10 gap-1.5 rounded-lg px-3 text-sm text-slate-700"
                onClick={() => setFilters(EMPTY_FILTERS)}
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Create/Edit form */}
        {showForm && (
          <Card className="rounded-xl border-primary/20 bg-white p-4 shadow-sm">
            <p className="mb-3 text-base font-semibold text-slate-900">
              {editingTask
                ? "Edit task"
                : subtaskFormParentId
                  ? `Add subtask under "${tasks.find((t) => t.id === subtaskFormParentId)?.title ?? ""}"`
                  : "New top-level task"}
              {formData.projectId && !subtaskFormParentId
                ? ` · ${projectName(formData.projectId)}`
                : ""}
            </p>
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <Input
                className="h-10 text-sm"
                placeholder="Task name *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {!subtaskFormParentId && (
                <Select
                  value={formData.projectId}
                  onValueChange={(val) => setFormData({ ...formData, projectId: val })}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Project *" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECTS.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <LabelTagSelect
                value={formData.labelTags}
                onChange={(labelTags) => setFormData({ ...formData, labelTags })}
                availableTags={availableLabelTags}
                onCreateTag={(tag) =>
                  setCustomLabelTags((prev) =>
                    prev.includes(tag) ? prev : [...prev, tag],
                  )
                }
                placeholder="Label tags"
                className="h-10 w-full text-sm"
              />
              <Input
                type="date"
                className="h-10 text-sm"
                placeholder="Due date (optional)"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <Textarea
              className="mb-3 min-h-[72px] text-sm"
              placeholder="Description (optional)"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} className="h-9 gap-2 text-sm">
                <Save className="w-4 h-4" />
                {editingTask ? "Update" : "Create"}
              </Button>
              <Button variant="outline" className="h-9 text-sm" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Task list */}
      <div className="flex-1 px-5 py-4 min-h-0">
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm shadow-slate-200/70">
          {/* List header */}
          <div className={cn("grid min-w-[54rem] items-center gap-3 border-b bg-slate-100/80 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600", TASK_GRID_COLUMNS)}>
            <span className="min-w-0">Task</span>
            <span className="min-w-0">Project</span>
            <span className="min-w-0">Label Tags</span>
            <span className="min-w-0">Status</span>
            <span className="min-w-0 text-right">Due</span>
            <span className="min-w-0" />
          </div>

          <ScrollArea className="max-h-[calc(100vh-18rem)]">
            {visibleRows.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-base text-slate-600">
                  {filterCount > 0 || search
                    ? "No tasks match your filters."
                    : "No tasks yet."}
                </p>
                {!showForm && (
                  <Button
                    variant="link"
                    className="mt-2 h-auto p-0 text-sm"
                    onClick={openCreateTopLevel}
                  >
                    Create first task
                  </Button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {visibleRows.map(({ task, level, hasChildren }) => {
                  const rollup = getRollup(tasks, updates, task.id);
                  const isExpanded = expanded.has(task.id);
                  const overdue = isOverdue(task);
                  const { visible: visibleLabelTags, overflow: labelTagOverflow } =
                    getVisibleTaskLabelTags(task);
                  const hiddenLabelTagsTitle =
                    labelTagOverflow > 0
                      ? getTaskLabelTags(task).slice(2).join(", ")
                      : undefined;

                  return (
                    <li
                      key={task.id}
                      className={cn("group grid min-w-[54rem] items-center gap-3 px-5 py-3.5 transition-colors hover:bg-blue-50/40", TASK_GRID_COLUMNS)}
                    >
                      {/* Title + badges */}
                      <div
                        className="min-w-0 cursor-pointer flex items-center gap-3"
                        onClick={() => onViewTask(task.id)}
                      >
                        <span
                          className="w-7 shrink-0 flex justify-center"
                          style={{ marginLeft: `${level * 22}px` }}
                        >
                          {hasChildren ? (
                            <button
                              type="button"
                              className="rounded-md p-1 transition-colors hover:bg-slate-200"
                              aria-label={isExpanded ? "Collapse task" : "Expand task"}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(task.id);
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                          ) : level > 0 ? (
                            <CornerDownRight className="w-4 h-4 text-slate-400" />
                          ) : (
                            <span className="w-4" />
                          )}
                        </span>
                        <span
                          className={cn("h-2.5 w-2.5 rounded-full ring-4 ring-slate-100 shrink-0", STATUS_DOT[rollup.status])}
                          title={`Rolled-up status: ${STATUS_LABEL[rollup.status]}`}
                        />
                        <div className="min-w-0 flex items-center gap-2 flex-wrap">
                          <p className="truncate text-base font-semibold leading-6 text-slate-950">{task.title}</p>
                          {rollup.descendants > 0 && (
                            <Badge
                              variant="outline"
                              className="h-6 shrink-0 gap-1 rounded-md border-slate-300 bg-white px-2 text-xs text-slate-700"
                            >
                              <ListTree className="w-3.5 h-3.5" />
                              {rollup.descendants}
                            </Badge>
                          )}
                          {rollup.openBlockers > 0 && (
                            <Badge
                              variant="outline"
                              className="h-6 shrink-0 rounded-md bg-red-50 px-2 text-xs text-red-700 border-red-200"
                            >
                              {rollup.openBlockers} blocker
                              {rollup.openBlockers > 1 ? "s" : ""}
                            </Badge>
                          )}
                          {overdue && (
                            <Badge
                              variant="outline"
                              className="h-6 shrink-0 rounded-md bg-amber-50 px-2 text-xs text-amber-700 border-amber-200"
                            >
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Project */}
                      <span className="min-w-0">
                        <Badge
                          variant="outline"
                          className="h-7 w-full min-w-0 justify-start truncate rounded-md border-slate-200 bg-slate-50 px-2.5 text-sm font-medium text-slate-900"
                        >
                          {projectName(task.projectId)}
                        </Badge>
                      </span>

                      {/* Label tags */}
                      <span className="min-w-0 flex flex-wrap gap-1">
                        {visibleLabelTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className={cn(
                              "h-7 max-w-full truncate rounded-md px-2 text-xs font-semibold",
                              labelTagBadgeClass(tag),
                            )}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {labelTagOverflow > 0 && (
                          <Badge
                            variant="outline"
                            className="h-7 shrink-0 rounded-md border-slate-200 bg-slate-100 px-2 text-xs font-semibold text-slate-600"
                            title={hiddenLabelTagsTitle}
                          >
                            +{labelTagOverflow}
                          </Badge>
                        )}
                      </span>

                      {/* Status */}
                      <span className="min-w-0">
                        <Badge
                          variant="outline"
                          className={cn("h-7 rounded-md px-2.5 text-sm font-semibold", STATUS_BADGE[task.status])}
                        >
                          {STATUS_LABEL[task.status]}
                        </Badge>
                      </span>

                      {/* Due date */}
                      <span
                        className={cn(
                          "min-w-0 text-right",
                          overdue ? "text-sm font-semibold text-red-600" : "text-sm font-medium text-slate-600",
                        )}
                      >
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1.5 opacity-70 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 rounded-lg p-0 text-slate-700 hover:bg-blue-100 hover:text-blue-700"
                          title="Add subtask"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCreateSubtask(task.id);
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 rounded-lg p-0 text-slate-700 hover:bg-slate-100"
                          title="Edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(task);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 rounded-lg p-0 text-destructive hover:bg-red-50"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(task.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 rounded-lg p-0 text-slate-700 hover:bg-slate-100"
                          title="Open details"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewTask(task.id);
                          }}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Card>

        <p className="text-sm text-slate-500 text-center pt-4">
          {visibleRows.length} of {tasks.length} tasks visible
          {filterCount > 0 || search ? " (filtered)" : ""} · Click a row to open details ·
          Use chevrons to expand/collapse subtasks
        </p>
      </div>
    </div>
  );
}
