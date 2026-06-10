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
    <div className="flex flex-col min-h-full -m-2">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 pb-3 pt-2 space-y-3">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Tasks</h1>
            <p className="text-[11px] text-muted-foreground">
              {activeRoots.length} active · {completedRoots.length} completed ·{" "}
              {rootTasks.length} top-level · {tasks.length} total tasks
            </p>
          </div>
          <Button
            onClick={() => (showForm ? resetForm() : openCreateTopLevel())}
            size="sm"
            className="gap-1.5 h-8 text-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {showForm ? "Cancel" : "New Task"}
          </Button>
        </div>

        {/* Search + filter toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tasks, descriptions, label tags, assignees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 text-xs gap-1.5 shrink-0",
              filterCount > 0 && "border-primary text-primary",
            )}
            onClick={() => setShowFilters((s) => !s)}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {filterCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 ml-0.5">
                {filterCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs shrink-0"
            onClick={expandAll}
            title="Expand all"
          >
            <ChevronDown className="w-3.5 h-3.5 mr-1" />
            Expand
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs shrink-0"
            onClick={collapseAll}
            title="Collapse all"
          >
            <ChevronRight className="w-3.5 h-3.5 mr-1" />
            Collapse
          </Button>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filters.project}
              onValueChange={(v) => setFilters((f) => ({ ...f, project: v }))}
            >
              <SelectTrigger className="h-7 text-xs w-[140px]">
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
              <SelectTrigger className="h-7 text-xs w-[120px]">
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
              <SelectTrigger className="h-7 text-xs w-[140px]">
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
              <SelectTrigger className="h-7 text-xs w-[140px]">
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
              <SelectTrigger className="h-7 text-xs w-[130px]">
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
              <SelectTrigger className="h-7 text-xs w-[120px]">
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
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setFilters(EMPTY_FILTERS)}
              >
                <X className="w-3 h-3" />
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Create/Edit form */}
        {showForm && (
          <Card className="p-3 border-primary/20">
            <p className="text-xs font-semibold mb-2.5">
              {editingTask
                ? "Edit task"
                : subtaskFormParentId
                  ? `Add subtask under "${tasks.find((t) => t.id === subtaskFormParentId)?.title ?? ""}"`
                  : "New top-level task"}
              {formData.projectId && !subtaskFormParentId
                ? ` · ${projectName(formData.projectId)}`
                : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
              <Input
                className="h-8 text-xs"
                placeholder="Task name *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {!subtaskFormParentId && (
                <Select
                  value={formData.projectId}
                  onValueChange={(val) => setFormData({ ...formData, projectId: val })}
                >
                  <SelectTrigger className="h-8 text-xs">
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
                className="w-full"
              />
              <Input
                type="date"
                className="h-8 text-xs"
                placeholder="Due date (optional)"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <Textarea
              className="text-xs min-h-[56px] mb-2"
              placeholder="Description (optional)"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
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

      {/* Task list */}
      <div className="flex-1 px-4 py-3 min-h-0">
        <Card className="overflow-hidden">
          {/* List header */}
          <div className="grid grid-cols-[minmax(10rem,1fr)_10rem_7rem_6rem_4rem_5.5rem] items-center gap-2 px-3 py-2 bg-muted/40 border-b text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <span className="min-w-0">Task</span>
            <span className="min-w-0">Project</span>
            <span className="min-w-0">Label Tags</span>
            <span className="min-w-0">Status</span>
            <span className="min-w-0 text-right">Due</span>
            <span className="min-w-0" />
          </div>

          <ScrollArea className="max-h-[calc(100vh-16rem)]">
            {visibleRows.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {filterCount > 0 || search
                    ? "No tasks match your filters."
                    : "No tasks yet."}
                </p>
                {!showForm && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs mt-1"
                    onClick={openCreateTopLevel}
                  >
                    Create first task
                  </Button>
                )}
              </div>
            ) : (
              <ul className="divide-y">
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
                      className="group grid grid-cols-[minmax(10rem,1fr)_10rem_7rem_6rem_4rem_5.5rem] items-center gap-2 px-3 py-2 hover:bg-muted/30 transition-colors"
                    >
                      {/* Title + badges */}
                      <div
                        className="min-w-0 cursor-pointer flex items-center gap-2"
                        onClick={() => onViewTask(task.id)}
                      >
                        <span
                          className="w-5 shrink-0 flex justify-center"
                          style={{ marginLeft: `${level * 18}px` }}
                        >
                          {hasChildren ? (
                            <button
                              type="button"
                              className="p-0.5 rounded hover:bg-muted"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(task.id);
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </button>
                          ) : level > 0 ? (
                            <CornerDownRight className="w-3 h-3 text-muted-foreground/40" />
                          ) : (
                            <span className="w-3.5" />
                          )}
                        </span>
                        <span
                          className={cn("w-2 h-2 rounded-full shrink-0", STATUS_DOT[rollup.status])}
                          title={`Rolled-up status: ${STATUS_LABEL[rollup.status]}`}
                        />
                        <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-medium truncate">{task.title}</p>
                          {rollup.descendants > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 h-3.5 shrink-0 gap-0.5"
                            >
                              <ListTree className="w-2 h-2" />
                              {rollup.descendants}
                            </Badge>
                          )}
                          {rollup.openBlockers > 0 && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 h-3.5 shrink-0 bg-red-50 text-red-700 border-red-200"
                            >
                              {rollup.openBlockers} blocker
                              {rollup.openBlockers > 1 ? "s" : ""}
                            </Badge>
                          )}
                          {overdue && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 h-3.5 shrink-0 bg-amber-50 text-amber-700 border-amber-200"
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
                          className="w-full min-w-0 justify-start text-[9px] px-1 py-0 h-3.5 truncate"
                        >
                          {projectName(task.projectId)}
                        </Badge>
                      </span>

                      {/* Label tags */}
                      <span className="min-w-0 flex flex-wrap gap-0.5">
                        {visibleLabelTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className={cn(
                              "text-[9px] px-1 py-0 h-3.5 truncate max-w-full",
                              labelTagBadgeClass(tag),
                            )}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {labelTagOverflow > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 h-3.5 shrink-0 bg-muted text-muted-foreground border-border"
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
                          className={cn("text-[9px] px-1 py-0 h-3.5", STATUS_DOT[task.status].replace("bg-", "text-").replace("500", "700"))}
                        >
                          {STATUS_LABEL[task.status]}
                        </Badge>
                      </span>

                      {/* Due date */}
                      <span
                        className={cn(
                          "min-w-0 text-right text-[10px]",
                          overdue ? "text-red-600 font-medium" : "text-muted-foreground",
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
                      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          title="Add subtask"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCreateSubtask(task.id);
                          }}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          title="Edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(task);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(task.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          title="Open details"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewTask(task.id);
                          }}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </Card>

        <p className="text-[10px] text-muted-foreground text-center pt-3">
          {visibleRows.length} of {tasks.length} tasks visible
          {filterCount > 0 || search ? " (filtered)" : ""} · Click a row to open details ·
          Use chevrons to expand/collapse subtasks
        </p>
      </div>
    </div>
  );
}
