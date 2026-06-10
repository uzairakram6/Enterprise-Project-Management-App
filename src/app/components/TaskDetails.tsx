import { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CornerDownRight,
  ListTree,
  Plus,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "./ui/utils";
import {
  MAX_TASK_DEPTH,
  getAncestors,
  getChildren,
  getDepth,
  getProjectName,
  getRollup,
  getSubtree,
  getTaskPath,
  newTaskId,
  type Task,
  type TaskPriority,
  type TaskStatus,
  type TaskUpdate,
  type UpdateType,
} from "../data/tasks";

interface TaskDetailsProps {
  taskId: string;
  tasks: Task[];
  updates: TaskUpdate[];
  onTasksChange: (tasks: Task[]) => void;
  onOpenTask: (taskId: string) => void;
  onBack: () => void;
}

const STATUS_META: Record<TaskStatus, { label: string; badge: string; dot: string }> = {
  doing: { label: "Doing", badge: "bg-blue-500", dot: "bg-blue-500" },
  done: { label: "Done", badge: "bg-green-500", dot: "bg-green-500" },
  "at-risk": { label: "At Risk", badge: "bg-amber-500", dot: "bg-amber-500" },
  blocked: { label: "Blocked", badge: "bg-red-500", dot: "bg-red-500" },
  "on-hold": { label: "On Hold", badge: "bg-gray-400", dot: "bg-gray-400" },
};

const UPDATE_TYPE_META: Record<UpdateType, { label: string; className: string }> = {
  daily: { label: "Daily", className: "bg-blue-50 text-blue-700 border-blue-200" },
  blocker: { label: "Blocker", className: "bg-red-50 text-red-700 border-red-200" },
  escalation: { label: "Escalation", className: "bg-amber-50 text-amber-700 border-amber-200" },
  note: { label: "Note", className: "bg-gray-50 text-gray-600 border-gray-200" },
};

// All nesting levels are rendered inline; indentation grows with depth.
// For extremely deep trees, horizontal scroll or drill-in is still available.
const MAX_VISIBLE_LEVELS = 20;

interface SubtaskFormState {
  parentId: string;
  title: string;
  priority: TaskPriority;
  description: string;
}

function TaskTreeRow({
  task,
  level,
  tasks,
  updates,
  expanded,
  onToggle,
  onOpenTask,
  onAddSubtask,
}: {
  task: Task;
  level: number;
  tasks: Task[];
  updates: TaskUpdate[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onOpenTask: (id: string) => void;
  onAddSubtask: (parentId: string) => void;
}) {
  const children = getChildren(tasks, task.id);
  const rollup = getRollup(tasks, updates, task.id);
  const hasChildren = children.length > 0;
  const isExpanded = expanded.has(task.id);
  const canExpandInline = true; // All levels expand inline (cap was removed per client request)
  const atMaxDepth = getDepth(tasks, task.id) + 1 >= MAX_TASK_DEPTH;

  return (
    <>
      <div
        className="group flex items-center gap-2 py-2 px-2 rounded-md hover:bg-muted/40 cursor-pointer transition-colors"
        style={{ paddingLeft: `${8 + level * 24}px` }}
        onClick={() => onOpenTask(task.id)}
      >
        {hasChildren && canExpandInline ? (
          <button
            type="button"
            className="p-0.5 rounded hover:bg-muted shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-[18px] shrink-0 flex justify-center">
            {level > 0 && <CornerDownRight className="w-3 h-3 text-muted-foreground/50" />}
          </span>
        )}

        <span className={cn("w-2 h-2 rounded-full shrink-0", STATUS_META[rollup.status].dot)} />

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <p className="text-sm font-medium truncate">{task.title}</p>
          {rollup.descendants > 0 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 shrink-0 gap-0.5">
              <ListTree className="w-2.5 h-2.5" />
              {rollup.descendants}
            </Badge>
          )}
          {rollup.openBlockers > 0 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-red-50 text-red-700 border-red-200">
              {rollup.openBlockers} blocker{rollup.openBlockers > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
          {task.assignees.map((m) => m.split(" ")[0]).join(", ")}
        </span>
        {rollup.hours > 0 && (
          <span className="text-xs text-muted-foreground shrink-0 w-10 text-right">{rollup.hours}h</span>
        )}

        <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[11px] gap-0.5"
            disabled={atMaxDepth}
            title={atMaxDepth ? `Max depth (${MAX_TASK_DEPTH}) reached — configurable per project` : "Add subtask"}
            onClick={(e) => {
              e.stopPropagation();
              onAddSubtask(task.id);
            }}
          >
            <Plus className="w-3 h-3" />
            Sub
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            title="Open task"
            onClick={(e) => {
              e.stopPropagation();
              onOpenTask(task.id);
            }}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {hasChildren && canExpandInline && isExpanded &&
        children.map((child) => (
          <TaskTreeRow
            key={child.id}
            task={child}
            level={level + 1}
            tasks={tasks}
            updates={updates}
            expanded={expanded}
            onToggle={onToggle}
            onOpenTask={onOpenTask}
            onAddSubtask={onAddSubtask}
          />
        ))}

      {/* All levels render inline; no "Open to see" fallback needed */}
    </>
  );
}

export default function TaskDetails({
  taskId,
  tasks,
  updates,
  onTasksChange,
  onOpenTask,
  onBack,
}: TaskDetailsProps) {
  const task = tasks.find((t) => t.id === taskId);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [updateFilter, setUpdateFilter] = useState<UpdateType | "all">("all");
  const [subtaskForm, setSubtaskForm] = useState<SubtaskFormState | null>(null);

  const ancestors = useMemo(() => (task ? getAncestors(tasks, task.id) : []), [tasks, task]);
  const children = useMemo(() => (task ? getChildren(tasks, task.id) : []), [tasks, task]);
  const rollup = useMemo(
    () => (task ? getRollup(tasks, updates, task.id) : null),
    [tasks, updates, task],
  );

  const subtreeUpdates = useMemo(() => {
    if (!task) return [];
    const ids = new Set([task.id, ...getSubtree(tasks, task.id).map((t) => t.id)]);
    return updates
      .filter((u) => ids.has(u.taskId))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [tasks, updates, task]);

  if (!task || !rollup) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Button>
        <p className="text-muted-foreground">Task not found.</p>
      </div>
    );
  }

  const depth = ancestors.length;
  const visibleUpdates =
    updateFilter === "all" ? subtreeUpdates : subtreeUpdates.filter((u) => u.type === updateFilter);

  const toggleExpand = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openSubtaskForm = (parentId: string) => {
    const parent = tasks.find((t) => t.id === parentId);
    setSubtaskForm({
      parentId,
      title: "",
      priority: "medium",
      description: "",
    });
  };

  const saveSubtask = () => {
    if (!subtaskForm || !subtaskForm.title.trim()) return;
    const newTask: Task = {
      id: newTaskId(),
      projectId: task.projectId,
      parentId: subtaskForm.parentId,
      title: subtaskForm.title.trim(),
      description: subtaskForm.description.trim() || undefined,
      assignees: [],
      priority: subtaskForm.priority,
      labels: [],
      status: "doing",
      createdBy: "Hamza Khan (PM)",
      createdAt: new Date().toISOString().split("T")[0],
    };
    onTasksChange([...tasks, newTask]);
    setExpanded((current) => new Set(current).add(subtaskForm.parentId));
    setSubtaskForm(null);
  };

  const formParent = subtaskForm ? tasks.find((t) => t.id === subtaskForm.parentId) : null;
  const formParentPath = subtaskForm
    ? [getTaskPath(tasks, subtaskForm.parentId), formParent?.title].filter(Boolean).join(" › ")
    : "";

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation — drill in/out at any depth */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 shrink-0">
          <ArrowLeft className="w-4 h-4" />
          All Tasks
        </Button>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <span className="text-muted-foreground">{getProjectName(task.projectId)}</span>
            </BreadcrumbItem>
            {ancestors.map((ancestor) => (
              <BreadcrumbItem key={ancestor.id} className="flex items-center gap-1.5">
                <BreadcrumbSeparator />
                <BreadcrumbLink asChild>
                  <button
                    type="button"
                    className="cursor-pointer max-w-[180px] truncate inline-block hover:underline"
                    onClick={() => onOpenTask(ancestor.id)}
                  >
                    {ancestor.title}
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
            ))}
            <BreadcrumbItem className="flex items-center gap-1.5">
              <BreadcrumbSeparator />
              <BreadcrumbPage className="max-w-[220px] truncate inline-block">{task.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl mb-3">{task.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline">{getProjectName(task.projectId)}</Badge>
            <Badge
              variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}
              className={task.priority === "medium" ? "bg-blue-500" : ""}
            >
              {task.priority} priority
            </Badge>
            <Badge className={cn("capitalize", STATUS_META[rollup.status].badge)}>
              {STATUS_META[rollup.status].label}
            </Badge>
            <Badge variant="secondary">Level {depth}</Badge>
            {task.labels.map((label) => (
              <Badge key={label} variant="outline" className="text-muted-foreground">
                {label}
              </Badge>
            ))}
          </div>
          {task.description && <p className="text-muted-foreground max-w-3xl">{task.description}</p>}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span>Created by {task.createdBy}</span>
          </div>
        </div>
        <Button onClick={() => openSubtaskForm(task.id)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Add Subtask
        </Button>
      </div>

      {/* Subtree roll-up stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Direct Subtasks</p>
          <p className="text-2xl font-bold mt-1">{rollup.directChildren}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total in Subtree</p>
          <p className="text-2xl font-bold mt-1">{rollup.descendants}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Subtree Hours</p>
          <p className="text-2xl font-bold mt-1">{rollup.hours}h</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Open Blockers</p>
          <p className={cn("text-2xl font-bold mt-1", rollup.openBlockers > 0 ? "text-red-600" : "text-green-600")}>
            {rollup.openBlockers}
          </p>
        </Card>
      </div>

      {rollup.openBlockers > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-900">
              {rollup.openBlockers} open blocker{rollup.openBlockers > 1 ? "s" : ""} in this subtree.
              These roll up into the weekly delivery status (amber/red) for{" "}
              <span className="font-medium">{getProjectName(task.projectId)}</span>.
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Subtask tree */}
        <Card className="p-6 xl:col-span-3">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <ListTree className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Subtasks</h2>
              <span className="text-xs text-muted-foreground">
                {rollup.directChildren} direct · {rollup.descendants} total
              </span>
            </div>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">No subtasks yet.</p>
              <Button variant="outline" size="sm" onClick={() => openSubtaskForm(task.id)} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Create first subtask
              </Button>
            </div>
          ) : (
            <div className="-mx-2">
              {children.map((child) => (
                <TaskTreeRow
                  key={child.id}
                  task={child}
                  level={0}
                  tasks={tasks}
                  updates={updates}
                  expanded={expanded}
                  onToggle={toggleExpand}
                  onOpenTask={onOpenTask}
                  onAddSubtask={openSubtaskForm}
                />
              ))}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground mt-4">
            Nesting is unlimited (capped at {MAX_TASK_DEPTH} levels via project settings). All levels expand
            inline — click chevrons to collapse/expand any branch.
          </p>
        </Card>

        {/* Typed updates across the subtree */}
        <Card className="p-6 xl:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Updates</h2>
            <span className="text-xs text-muted-foreground">incl. all nested subtasks</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {(["all", "daily", "blocker", "escalation", "note"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setUpdateFilter(type)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors border capitalize",
                  updateFilter === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40",
                )}
              >
                {type === "all" ? `All (${subtreeUpdates.length})` : UPDATE_TYPE_META[type].label}
              </button>
            ))}
          </div>

          {visibleUpdates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No updates of this type in the subtree yet.</p>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {visibleUpdates.map((update) => {
                const updateTask = tasks.find((t) => t.id === update.taskId);
                const isOnCurrentTask = update.taskId === task.id;
                return (
                  <div key={update.id} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-[10px]", UPDATE_TYPE_META[update.type].className)}>
                          {UPDATE_TYPE_META[update.type].label}
                        </Badge>
                        <span className="text-xs font-medium">{update.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(update.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      {update.hours !== undefined && (
                        <Badge variant="secondary" className="text-[10px]">{update.hours}h</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{update.text}</p>
                    {!isOnCurrentTask && updateTask && (
                      <button
                        type="button"
                        className="flex items-center gap-1 text-[11px] text-primary hover:underline mt-1.5"
                        onClick={() => onOpenTask(updateTask.id)}
                      >
                        <CornerDownRight className="w-3 h-3" />
                        {updateTask.title}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Add subtask dialog — works for the current task or any nested row */}
      <Dialog open={!!subtaskForm} onOpenChange={(open) => !open && setSubtaskForm(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Subtask</DialogTitle>
            <DialogDescription>
              Under <span className="font-medium text-foreground">{formParentPath}</span>
            </DialogDescription>
          </DialogHeader>
          {subtaskForm && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={subtaskForm.title}
                  autoFocus
                  placeholder="e.g., RLS policy setup"
                  onChange={(e) => setSubtaskForm({ ...subtaskForm, title: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && saveSubtask()}
                />
              </div>
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={subtaskForm.priority}
                    onValueChange={(value: TaskPriority) => setSubtaskForm({ ...subtaskForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  rows={2}
                  value={subtaskForm.description}
                  placeholder="What is this subtask about?"
                  onChange={(e) => setSubtaskForm({ ...subtaskForm, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubtaskForm(null)}>
              Cancel
            </Button>
            <Button onClick={saveSubtask} disabled={!subtaskForm?.title.trim()}>
              Create Subtask
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
